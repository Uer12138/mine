import { createClient } from "@supabase/supabase-js"
import { createServerComponentClient, createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Create server client for server components
export function createServerClient() {
  if (!isSupabaseConfigured) {
    return null
  }

  try {
    const { cookies } = require("next/headers")
    const cookieStore = cookies()
    return createServerComponentClient({ cookies: () => cookieStore })
  } catch (error) {
    // If we're in a client context, cookies won't be available
    console.warn("Cannot create server client in client context")
    return null
  }
}

export function createClientClient() {
  if (!isSupabaseConfigured) {
    return null
  }
  return createClientComponentClient()
}

function generateDemoUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function getCurrentUserId(): Promise<string> {
  try {
    const serverClient = createServerClient()
    if (serverClient) {
      const {
        data: { user },
      } = await serverClient.auth.getUser()
      if (user?.id) {
        return user.id // This is already a proper UUID from Supabase auth
      }
    }

    let demoUserId = typeof window !== "undefined" ? localStorage.getItem("demo_user_id") : null
    if (!demoUserId) {
      demoUserId = generateDemoUUID()
      if (typeof window !== "undefined") {
        localStorage.setItem("demo_user_id", demoUserId)
      }
    }
    return demoUserId
  } catch (error) {
    console.error("Error getting user ID:", error)
    // Return a consistent demo UUID
    return generateDemoUUID()
  }
}

export async function getCurrentUserIdClient(): Promise<string> {
  try {
    const clientClient = createClientClient()
    if (clientClient) {
      const {
        data: { user },
      } = await clientClient.auth.getUser()
      if (user?.id) {
        return user.id // This is already a proper UUID from Supabase auth
      }
    }

    // 如果没有 Supabase 连接，尝试从 localStorage 获取当前登录用户的 ID
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user?.id) {
          return user.id
        }
      } catch (error) {
        console.error("Error parsing current user:", error)
      }
    }

    // 如果没有当前用户，返回一个默认的 demo UUID
    let demoUserId = localStorage.getItem("demo_user_id")
    if (!demoUserId) {
      demoUserId = generateDemoUUID()
      localStorage.setItem("demo_user_id", demoUserId)
    }
    return demoUserId
  } catch (error) {
    console.error("Error getting user ID:", error)
    // 尝试从当前用户获取 ID
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user?.id) {
          return user.id
        }
      } catch (error) {
        console.error("Error parsing current user in fallback:", error)
      }
    }
    
    // 最后的回退方案
    let demoUserId = localStorage.getItem("demo_user_id")
    if (!demoUserId) {
      demoUserId = generateDemoUUID()
      localStorage.setItem("demo_user_id", demoUserId)
    }
    return demoUserId
  }
}

// 健康任务数据类型
export interface HealthTask {
  id?: number
  user_id?: string
  task_id: string
  task_title: string
  task_description?: string
  stage: "beginner" | "intermediate" | "advanced"
  is_completed: boolean
  completed_at?: string
  created_at?: string
  updated_at?: string
}

// 检查Supabase连接状态
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabase) {
      return false
    }

    const { data, error } = await supabase.from("health_tasks").select("count").limit(1)
    return !error
  } catch (error) {
    console.error("Supabase connection error:", error)
    return false
  }
}

// 获取用户的健康任务
export async function getUserHealthTasks(userId: string): Promise<HealthTask[]> {
  try {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from("health_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching health tasks:", error)
    return []
  }
}

// 更新任务状态
export async function updateTaskStatus(userId: string, taskId: string, isCompleted: boolean): Promise<boolean> {
  try {
    if (!supabase) {
      return false
    }

    const { error } = await supabase.from("health_tasks").upsert(
      {
        user_id: userId,
        task_id: taskId,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,task_id",
      },
    )

    return !error
  } catch (error) {
    console.error("Error updating task status:", error)
    return false
  }
}

// 初始化用户的健康任务
export async function initializeUserTasks(userId: string, tasks: HealthTask[]): Promise<boolean> {
  try {
    if (!supabase) {
      return false
    }

    const tasksToInsert = tasks.map((task) => ({
      user_id: userId,
      task_id: task.task_id,
      task_title: task.task_title,
      task_description: task.task_description,
      stage: task.stage,
      is_completed: false,
    }))

    const { error } = await supabase.from("health_tasks").upsert(tasksToInsert, {
      onConflict: "user_id,task_id",
      ignoreDuplicates: true,
    })

    return !error
  } catch (error) {
    console.error("Error initializing user tasks:", error)
    return false
  }
}
