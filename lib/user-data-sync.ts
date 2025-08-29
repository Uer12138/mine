import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { supabase, isSupabaseConfigured } from './supabase'

// 数据库类型定义
export interface UserProfile {
  id: string
  username: string
  weight?: number
  height?: number
  age?: number
  gender?: string
  sweetness_preference?: string
  favorite_brands?: string[]
  disliked_ingredients?: string[]
  health_goals?: string[]
  created_at?: string
  updated_at?: string
}

export interface TeaRecord {
  id?: string
  user_id: string
  tea_name: string
  brand?: string
  size: string
  sweetness_level: string | number
  toppings?: string[]
  tea_product_id?: number | null
  estimated_calories: number
  sugar_content?: number
  caffeine_content?: number
  mood?: string
  notes?: string
  rating?: number
  would_order_again?: boolean
  recorded_at: string
  created_at?: string
  updated_at?: string
}

export interface UserPreference {
  user_id: string
  preference_key: string
  preference_value: any
  created_at?: string
  updated_at?: string
}

// 获取Supabase客户端
function getSupabaseClient() {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }
  return createClientComponentClient()
}

// =========================================================================================
// 用户资料管理
// =========================================================================================

/**
 * 获取用户资料
 */
export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 从localStorage获取用户信息
      const users = JSON.parse(localStorage.getItem('teacal_users') || '[]')
      const user = users.find((u: any) => u.id === userId)
      
      if (!user) {
        return { success: false, error: '用户不存在' }
      }
      
      return { success: true, data: user }
    }

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('获取用户资料失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('获取用户资料异常:', error)
    return { success: false, error: '获取用户资料失败' }
  }
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 更新localStorage中的用户信息
      const users = JSON.parse(localStorage.getItem('teacal_users') || '[]')
      const userIndex = users.findIndex((u: any) => u.id === userId)
      
      if (userIndex === -1) {
        return { success: false, error: '用户不存在' }
      }
      
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('teacal_users', JSON.stringify(users))
      return { success: true, data: users[userIndex] }
    }

    const { data, error } = await client
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('更新用户资料失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('更新用户资料异常:', error)
    return { success: false, error: '更新用户资料失败' }
  }
}

// =========================================================================================
// 奶茶记录管理
// =========================================================================================

// 糖分级别转换函数
function convertSweetnessLevelToNumber(sweetness: string | number): number {
  if (typeof sweetness === 'number') {
    return sweetness
  }
  
  const sweetnessMap: { [key: string]: number } = {
    '无糖': 0,
    '少糖': 30,
    '三分糖': 30,
    '半糖': 50,
    '五分糖': 50,
    '七分糖': 70,
    '全糖': 100
  }
  
  return sweetnessMap[sweetness] || 50 // 默认半糖
}

/**
 * 添加奶茶记录
 */
export async function addTeaRecord(record: Omit<TeaRecord, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: TeaRecord; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 保存到localStorage
      const records = JSON.parse(localStorage.getItem('teaRecords') || '[]')
      const newRecord = {
        ...record,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      records.push(newRecord)
      localStorage.setItem('teaRecords', JSON.stringify(records))
      return { success: true, data: newRecord }
    }

    // 转换糖分级别为数字并处理toppings字段
    const processedRecord = {
      ...record,
      sweetness_level: convertSweetnessLevelToNumber(record.sweetness_level),
      toppings: record.toppings && record.toppings.length > 0 ? record.toppings : [],
      tea_product_id: record.tea_product_id || null // 避免外键约束错误
    }

    const { data, error } = await client
      .from('tea_records')
      .insert({
        ...processedRecord,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('添加奶茶记录失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('添加奶茶记录异常:', error)
    return { success: false, error: '添加奶茶记录失败' }
  }
}

/**
 * 获取用户奶茶记录
 */
export async function getUserTeaRecords(userId: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: TeaRecord[]; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 从localStorage获取记录
      const records = JSON.parse(localStorage.getItem('teaRecords') || '[]')
      const userRecords = records
        .filter((r: TeaRecord) => r.user_id === userId)
        .sort((a: TeaRecord, b: TeaRecord) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
        .slice(offset, offset + limit)
      
      return { success: true, data: userRecords }
    }

    const { data, error } = await client
      .from('tea_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('获取奶茶记录失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('获取奶茶记录异常:', error)
    return { success: false, error: '获取奶茶记录失败' }
  }
}

/**
 * 获取奶茶记录 (getUserTeaRecords 的别名)
 */
export const getTeaRecords = getUserTeaRecords

/**
 * 更新奶茶记录
 */
export async function updateTeaRecord(recordId: string, userId: string, updates: Partial<TeaRecord>): Promise<{ success: boolean; data?: TeaRecord; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 更新localStorage中的记录
      const records = JSON.parse(localStorage.getItem('teaRecords') || '[]')
      const recordIndex = records.findIndex((r: TeaRecord) => r.id === recordId && r.user_id === userId)
      
      if (recordIndex === -1) {
        return { success: false, error: '记录不存在' }
      }
      
      records[recordIndex] = {
        ...records[recordIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('teaRecords', JSON.stringify(records))
      return { success: true, data: records[recordIndex] }
    }

    // 如果更新包含糖分级别，需要转换为数字
    const processedUpdates = {
      ...updates,
      ...(updates.sweetness_level !== undefined && {
        sweetness_level: convertSweetnessLevelToNumber(updates.sweetness_level)
      })
    }

    const { data, error } = await client
      .from('tea_records')
      .update({
        ...processedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('更新奶茶记录失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('更新奶茶记录异常:', error)
    return { success: false, error: '更新奶茶记录失败' }
  }
}

/**
 * 删除奶茶记录
 */
export async function deleteTeaRecord(recordId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 从localStorage删除记录
      const records = JSON.parse(localStorage.getItem('teaRecords') || '[]')
      const filteredRecords = records.filter((r: TeaRecord) => !(r.id === recordId && r.user_id === userId))
      
      localStorage.setItem('teaRecords', JSON.stringify(filteredRecords))
      return { success: true }
    }

    const { error } = await client
      .from('tea_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId)

    if (error) {
      console.error('删除奶茶记录失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('删除奶茶记录异常:', error)
    return { success: false, error: '删除奶茶记录失败' }
  }
}

// =========================================================================================
// 用户偏好管理
// =========================================================================================

/**
 * 获取用户偏好
 */
export async function getUserPreferences(userId: string): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 从localStorage获取偏好
      const preferences = JSON.parse(localStorage.getItem(`userPreferences_${userId}`) || '{}')
      return { success: true, data: preferences }
    }

    const { data, error } = await client
      .from('user_preferences')
      .select('preference_key, preference_value')
      .eq('user_id', userId)

    if (error) {
      console.error('获取用户偏好失败:', error)
      return { success: false, error: error.message }
    }

    // 转换为键值对格式
    const preferences: Record<string, any> = {}
    data?.forEach(item => {
      preferences[item.preference_key] = item.preference_value
    })

    return { success: true, data: preferences }
  } catch (error) {
    console.error('获取用户偏好异常:', error)
    return { success: false, error: '获取用户偏好失败' }
  }
}

/**
 * 设置用户偏好
 */
export async function setUserPreference(userId: string, key: string, value: any): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      // 保存到localStorage
      const preferences = JSON.parse(localStorage.getItem(`userPreferences_${userId}`) || '{}')
      preferences[key] = value
      localStorage.setItem(`userPreferences_${userId}`, JSON.stringify(preferences))
      return { success: true }
    }

    const { error } = await client
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_key: key,
        preference_value: value,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('设置用户偏好失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('设置用户偏好异常:', error)
    return { success: false, error: '设置用户偏好失败' }
  }
}

// 预算数据同步功能
export async function getUserBudget(userId: string): Promise<{ success: boolean; data?: number; error?: string }> {
  const result = await getUserPreferences(userId)
  if (!result.success || !result.data) {
    return { success: false, error: result.error || 'Failed to get user preferences' }
  }

  const weeklyBudget = result.data.weeklyBudget
  return {
    success: true,
    data: weeklyBudget ? parseInt(weeklyBudget) : 2000 // 默认预算2000kcal
  }
}

export async function setUserBudget(userId: string, budget: number): Promise<{ success: boolean; error?: string }> {
  return await setUserPreference(userId, 'weeklyBudget', budget.toString())
}

// 便捷的预算同步函数
export async function syncBudgetData(userId: string, budget: number): Promise<{ success: boolean; error?: string }> {
  try {
    // 同步到数据库
    const result = await setUserBudget(userId, budget)
    if (result.success) {
      // 同步到本地存储
      localStorage.setItem('weeklyBudget', budget.toString())
    }
    return result
  } catch (error) {
    console.error('Error syncing budget data:', error)
    // 如果数据库同步失败，至少保存到本地
    localStorage.setItem('weeklyBudget', budget.toString())
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function loadBudgetData(userId: string): Promise<number> {
  try {
    // 首先尝试从数据库加载
    const result = await getUserBudget(userId)
    if (result.success && result.data) {
      // 同步到本地存储
      localStorage.setItem('weeklyBudget', result.data.toString())
      return result.data
    }
  } catch (error) {
    console.error('Failed to load budget from database:', error)
  }

  // 如果数据库加载失败，从本地存储加载
  const savedBudget = localStorage.getItem('weeklyBudget')
  return savedBudget ? parseInt(savedBudget) : 2000
}

// =========================================================================================
// 数据迁移功能
// =========================================================================================

/**
 * 从localStorage迁移奶茶记录到数据库
 */
export async function migrateTeaRecordsFromLocalStorage(userId: string): Promise<{ success: boolean; migratedCount?: number; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Supabase未配置' }
    }

    // 获取localStorage中的记录
    const localRecords = JSON.parse(localStorage.getItem('teaRecords') || '[]')
    const userRecords = localRecords.filter((r: TeaRecord) => r.user_id === userId)

    if (userRecords.length === 0) {
      return { success: true, migratedCount: 0 }
    }

    // 检查数据库中已存在的记录，避免重复迁移
    const { data: existingRecords } = await client
      .from('tea_records')
      .select('id')
      .eq('user_id', userId)

    const existingIds = new Set(existingRecords?.map(r => r.id) || [])
    const recordsToMigrate = userRecords.filter((r: TeaRecord) => !existingIds.has(r.id))

    if (recordsToMigrate.length === 0) {
      return { success: true, migratedCount: 0 }
    }

    // 批量插入记录
    const { error } = await client
      .from('tea_records')
      .insert(recordsToMigrate.map((record: TeaRecord) => ({
        ...record,
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString()
      })))

    if (error) {
      console.error('迁移奶茶记录失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, migratedCount: recordsToMigrate.length }
  } catch (error) {
    console.error('迁移奶茶记录异常:', error)
    return { success: false, error: '迁移奶茶记录失败' }
  }
}

/**
 * 同步用户偏好到数据库
 */
export async function syncUserPreferencesToSupabase(userId: string, preferences: Record<string, any>): Promise<{ success: boolean; syncedCount?: number; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Supabase未配置' }
    }

    const preferenceEntries = Object.entries(preferences)
    if (preferenceEntries.length === 0) {
      return { success: true, syncedCount: 0 }
    }

    // 批量更新偏好设置
    const { error } = await client
      .from('user_preferences')
      .upsert(
        preferenceEntries.map(([key, value]) => ({
          user_id: userId,
          preference_key: key,
          preference_value: value,
          updated_at: new Date().toISOString()
        }))
      )

    if (error) {
      console.error('同步用户偏好失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, syncedCount: preferenceEntries.length }
  } catch (error) {
    console.error('同步用户偏好异常:', error)
    return { success: false, error: '同步用户偏好失败' }
  }
}

/**
 * 检查用户是否需要数据迁移
 */
export async function checkMigrationNeeded(userId: string): Promise<{ needsMigration: boolean; localRecordsCount: number; dbRecordsCount: number }> {
  try {
    // 检查localStorage中的记录数量
    const localRecords = JSON.parse(localStorage.getItem('teaRecords') || '[]')
    const userLocalRecords = localRecords.filter((r: TeaRecord) => r.user_id === userId)
    const localRecordsCount = userLocalRecords.length

    // 检查数据库中的记录数量
    const client = getSupabaseClient()
    let dbRecordsCount = 0
    
    if (client) {
      const { data, error } = await client
        .from('tea_records')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
      
      if (!error) {
        dbRecordsCount = data?.length || 0
      }
    }

    const needsMigration = localRecordsCount > 0 && dbRecordsCount === 0

    return {
      needsMigration,
      localRecordsCount,
      dbRecordsCount
    }
  } catch (error) {
    console.error('检查迁移状态异常:', error)
    return {
      needsMigration: false,
      localRecordsCount: 0,
      dbRecordsCount: 0
    }
  }
}