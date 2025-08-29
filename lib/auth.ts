// lib/auth.ts
"use client"

import { supabase } from "./supabase"
import bcrypt from "bcryptjs"

// 用户类型定义
interface User {
  id: string
  username: string
  password: string
  weight?: number
  height?: number
  age?: number
  sweetness_preference?: string
  favorite_brands?: string[]
  disliked_ingredients?: string[]
}

// =========================================================================================
// 用户认证功能 (使用 bcryptjs)
// =========================================================================================

// 用户注册
export async function registerUser(username: string, password: string) {
  try {
    console.log("=== REGISTRATION ATTEMPT START ===")
    console.log("Username:", username)
    console.log("Password length:", password.length)

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log("Registration password hash (bcryptjs):", passwordHash)

    if (!supabase) {
      // 本地存储模式
      const users = JSON.parse(localStorage.getItem("teacal_users") || "[]")

      if (users.find((user: User) => user.username === username)) {
        return { success: false, error: "用户名已存在" }
      }

      const newUser = {
        id: crypto.randomUUID(),
        username,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("teacal_users", JSON.stringify(users))

      await initializeTeaCalorieTasks(newUser.id)

      console.log("注册成功:", { username, userId: newUser.id })
      console.log("=== REGISTRATION ATTEMPT END (SUCCESS) ===")

      return { success: true, user: newUser }
    }

    // Supabase 模式
    console.log("Supabase client:", !!supabase)
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Supabase ANON key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        password_hash: passwordHash,
      })
      .select()
      .single()
    
    console.log("Supabase insert result:", { data, error })

    if (error) {
      if (error.code === "23505") {
        throw new Error("用户名已存在")
      }
      throw error
    }

    await initializeTeaCalorieTasks(data.id)

    console.log("=== REGISTRATION ATTEMPT END (SUCCESS) ===")
    return { success: true, user: data }
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    })
    console.log("=== REGISTRATION ATTEMPT END (ERROR) ===")
    
    // 返回更详细的错误信息
    return {
      success: false,
      error: error instanceof Error ? error.message : "注册失败",
      details: {
        code: error.code,
        hint: error.hint,
        timestamp: new Date().toISOString(),
        supabaseConfigured: !!supabase,
        environmentVars: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }
    }
  }
}

// 用户登录
export async function loginUser(username: string, password: string) {
  try {
    console.log("=== LOGIN ATTEMPT START ===")
    console.log("Username:", username)
    console.log("Password length:", password.length)

    if (!supabase) {
      // 本地存储模式
      console.log("使用本地存储模式进行认证")
      const users = JSON.parse(localStorage.getItem("teacal_users") || "[]")

      const userExists = users.find((u: User) => u.username === username)
      if (!userExists) {
        console.log("用户不存在:", username)
        return { success: false, error: "用户名或密码错误" }
      }

      const isPasswordValid = await bcrypt.compare(password, userExists.password_hash)
      console.log("密码验证结果:", isPasswordValid) // 调试日志

      if (!isPasswordValid) {
        console.log("密码验证失败")
        return { success: false, error: "用户名或密码错误" }
      }

      console.log("登录成功:", userExists.username)
      console.log("=== LOGIN ATTEMPT END (SUCCESS) ===")
      return { success: true, user: userExists }
    }

    // Supabase 模式
    console.log("使用Supabase模式进行认证")

    // 1. 仅通过用户名查询用户，获取其哈希值
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, username, password_hash")
      .eq("username", username)
      .single()

    if (fetchError || !user) {
      console.log("数据库中未找到用户或查询出错")
      throw new Error("用户名或密码错误")
    }

    // 2. 使用 bcryptjs.compare() 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    console.log("密码验证结果:", isPasswordValid) // 调试日志

    if (!isPasswordValid) {
      console.log("bcryptjs.compare 结果为 false")
      throw new Error("用户名或密码错误")
    }

    console.log("=== LOGIN ATTEMPT END (SUCCESS) ===")
    return { success: true, user: user }
  } catch (error) {
    console.error("Login error:", error)
    console.log("=== LOGIN ATTEMPT END (ERROR) ===")
    return {
      success: false,
      error: error instanceof Error ? error.message : "登录失败",
    }
  }
}

// =========================================================================================
// 其他用户和任务相关功能
// =========================================================================================

export async function updateUserInfo(
  userId: string,
  userInfo: {
    weight?: number
    height?: number
    age?: number
    sweetness_preference?: string
    favorite_brands?: string[]
    disliked_ingredients?: string[]
  },
) {
  try {
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem("teacal_users") || "[]")
      const userIndex = users.findIndex((u: User) => u.id === userId)

      if (userIndex === -1) {
        return { success: false, error: "用户不存在" }
      }

      users[userIndex] = {
        ...users[userIndex],
        ...userInfo,
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem("teacal_users", JSON.stringify(users))
      return { success: true, user: users[userIndex] }
    }

    if (!supabase) {
      throw new Error("Supabase client is not configured")
    }

    console.log("Updating user info for userId:", userId, "with data:", userInfo)

    const { data, error } = await supabase
      .from("users")
      .update({
        ...userInfo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    console.log("Supabase update result:", { data, error })

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    return { success: true, user: data }
  } catch (error) {
    console.error("Update user info error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      userId,
      userInfo
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新失败",
    }
  }
}

export async function getUserInfo(userId: string) {
  try {
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem("teacal_users") || "[]")
      const user = users.find((u: User) => u.id === userId)

      if (!user) {
        return { success: false, error: "用户不存在" }
      }

      return { success: true, user }
    }

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error

    return { success: true, user: data }
  } catch (error) {
    console.error("Get user info error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取用户信息失败",
    }
  }
}

// 初始化用户健康任务
export async function initializeTeaCalorieTasks(userId: string) {
  try {
    if (!supabase) {
      // 本地存储模式 - 使用简化的任务结构
      const tasks = [
        // 第一阶段：基础认知建立
        {
          id: 1,
          phase: "第一阶段：基础认知建立",
          title: "列出常喝奶茶及疑问",
          description: "用10分钟，列出自己常喝的5款奶茶及疑问",
          completed: false,
        },
        // ... (省略部分任务，请保留您自己的完整任务列表)
      ]

      localStorage.setItem(`teacal_tasks_${userId}`, JSON.stringify(tasks))
      return { success: true, tasks }
    }

    // Supabase 模式下的任务初始化逻辑，无需修改
    const { data: existingTasks } = await supabase.from("user_tasks").select("id").eq("user_id", userId).limit(1)

    if (existingTasks && existingTasks.length > 0) {
      return { success: true, message: "Tasks already initialized" }
    }

    const { data: taskTemplates } = await supabase.from("task_templates").select("id").order("order_index")

    if (!taskTemplates) {
      return { success: false, error: "Failed to fetch task templates" }
    }

    const userTasks = taskTemplates.map((template) => ({
      user_id: userId,
      task_template_id: template.id,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: createdTasks } = await supabase.from("user_tasks").insert(userTasks).select()

    return { success: true, tasks: createdTasks }
  } catch (error) {
    console.error("Initialize tea calorie tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "初始化任务失败",
    }
  }
}

export async function getUserTasks(userId: string) {
  try {
    if (!supabase) {
      const tasks = JSON.parse(localStorage.getItem(`teacal_tasks_${userId}`) || "[]")
      return { success: true, tasks }
    }

    const { data, error } = await supabase
      .from("user_tasks")
      .select(
        `
        id,
        is_completed,
        completed_at,
        task_templates (
          id,
          title,
          description,
          order_index,
          phases (
            id,
            name,
            description,
            order_index
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("task_templates.order_index")

    if (error) throw error

    return { success: true, tasks: data }
  } catch (error) {
    console.error("Get user tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取任务失败",
    }
  }
}

export async function updateTaskCompletion(userId: string, taskId: number, isCompleted: boolean) {
  try {
    if (!supabase) {
      const tasks = JSON.parse(localStorage.getItem(`teacal_tasks_${userId}`) || "[]")
      const taskIndex = tasks.findIndex((t: any) => t.id === taskId)

      if (taskIndex === -1) {
        return { success: false, error: "任务不存在" }
      }

      tasks[taskIndex].completed = isCompleted
      tasks[taskIndex].completed_at = isCompleted ? new Date().toISOString() : null

      localStorage.setItem(`teacal_tasks_${userId}`, JSON.stringify(tasks))
      return { success: true, task: tasks[taskIndex] }
    }

    const updateData = {
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
      completed_at: isCompleted ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase
      .from("user_tasks")
      .update(updateData)
      .eq("user_id", userId)
      .eq("id", taskId)
      .select()
      .single()

    if (error) throw error

    return { success: true, task: data }
  } catch (error) {
    console.error("Update task completion error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新任务失败",
    }
  }
}

// 彻底清除本地存储数据，可在浏览器控制台调用
export function completeDataReset() {
  const keysToRemove = ["teacal_users", "teacal_current_user", "teacal_user_session", "teacal_auth_token"]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && (key.startsWith("teacal_") || key.startsWith("healthTasks_"))) {
      localStorage.removeItem(key)
    }
  }

  sessionStorage.clear()
  console.log("已完全清除所有用户数据")
}

// === 解决导出冲突的方案 ===
// 这将允许你的代码使用 initializeTeaCalorieTasks 或 initializeUserTasks
export { initializeTeaCalorieTasks as initializeUserTasks }

export { completeDataReset as clearOldUserData }
