import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 奶茶产品接口
export interface TeaProduct {
  id: number
  name: string
  brand: string
  base_calories: number
  sugar_content: string
  size: string
  ingredients: string[]
  category: 'low' | 'medium' | 'high'
  rating: number
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
}

// 奶茶记录接口
export interface TeaRecord {
  id?: string
  user_id: string
  tea_product_id?: number
  custom_name?: string
  tea_name: string
  size: string
  sweetness_level: string
  toppings?: string[]
  estimated_calories: number
  calories?: number
  isManualCalories?: boolean
  mood?: string
  notes?: string
  recorded_at: string
  created_at?: string
}

// 客户端Supabase客户端
function getSupabaseClient() {
  return createClientComponentClient()
}



// 检查Supabase连接状态
export async function checkTeaDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_products')
      .select('count')
      .limit(1)
    
    return !error
  } catch (error) {
    console.error('Tea database connection failed:', error)
    return false
  }
}

// 计算字符串相似度（简单的编辑距离算法）
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null))
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  
  const maxLen = Math.max(len1, len2)
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen
}

// 智能搜索奶茶产品（支持多字段相似度匹配）
export async function searchTeaProductsIntelligent(query: string, limit: number = 10): Promise<TeaProduct[]> {
  try {
    const supabase = getSupabaseClient()
    
    if (!query.trim()) {
      // 如果没有查询词，返回热门奶茶
      const { data, error } = await supabase
        .from('tea_products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    }
    
    // 获取所有产品进行智能匹配
    const { data: allProducts, error } = await supabase
      .from('tea_products')
      .select('*')
    
    if (error) throw error
    if (!allProducts) return []
    
    // 分词处理（简单按空格和常见分隔符分割）
    const queryTerms = query.toLowerCase().split(/[\s,，、]+/).filter(term => term.length > 0)
    
    // 计算每个产品的匹配分数
    const scoredProducts = allProducts.map(product => {
      let totalScore = 0
      let matchCount = 0
      
      queryTerms.forEach(term => {
        // 检查名称匹配
        const nameScore = calculateSimilarity(term, product.name.toLowerCase())
        if (nameScore > 0.3 || product.name.toLowerCase().includes(term)) {
          totalScore += nameScore * 3 // 名称匹配权重最高
          matchCount++
        }
        
        // 检查品牌匹配
        const brandScore = calculateSimilarity(term, product.brand.toLowerCase())
        if (brandScore > 0.3 || product.brand.toLowerCase().includes(term)) {
          totalScore += brandScore * 2 // 品牌匹配权重中等
          matchCount++
        }
        
        // 检查描述匹配
        if (product.description) {
          const descScore = calculateSimilarity(term, product.description.toLowerCase())
          if (descScore > 0.3 || product.description.toLowerCase().includes(term)) {
            totalScore += descScore * 1 // 描述匹配权重较低
            matchCount++
          }
        }
        
        // 检查配料匹配
        product.ingredients.forEach((ingredient: string) => {
          const ingredientScore = calculateSimilarity(term, ingredient.toLowerCase())
          if (ingredientScore > 0.3 || ingredient.toLowerCase().includes(term)) {
            totalScore += ingredientScore * 1.5 // 配料匹配权重中等
            matchCount++
          }
        })
      })
      
      // 计算最终分数（考虑匹配项数量和评分）
      const finalScore = matchCount > 0 ? (totalScore / queryTerms.length) * (matchCount / queryTerms.length) * (product.rating / 5) : 0
      
      return {
        ...product,
        matchScore: finalScore
      }
    })
    
    // 过滤和排序结果
    return scoredProducts
      .filter(product => product.matchScore > 0.1) // 只返回有一定匹配度的结果
      .sort((a, b) => b.matchScore - a.matchScore) // 按匹配分数降序排列
      .slice(0, limit)
      .map(({ matchScore, ...product }) => product) // 移除临时的matchScore字段
      
  } catch (error) {
    console.error('Intelligent search failed:', error)
    return []
  }
}

// 搜索奶茶产品（保持向后兼容）
export async function searchTeaProducts(query: string, limit: number = 10): Promise<TeaProduct[]> {
  try {
    const supabase = getSupabaseClient()
    
    if (!query.trim()) {
      // 如果没有查询词，返回热门奶茶
      const { data, error } = await supabase
        .from('tea_products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    }
    
    // 搜索奶茶名称和品牌
    const { data, error } = await supabase
      .from('tea_products')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
      .order('rating', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Search tea products failed:', error)
    return []
  }
}

// 根据品牌获取奶茶产品
export async function getTeaProductsByBrand(brand: string): Promise<TeaProduct[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_products')
      .select('*')
      .eq('brand', brand)
      .order('rating', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get tea products by brand failed:', error)
    return []
  }
}

// 根据热量分类获取奶茶产品
export async function getTeaProductsByCategory(category: 'low' | 'medium' | 'high'): Promise<TeaProduct[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_products')
      .select('*')
      .eq('category', category)
      .order('rating', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get tea products by category failed:', error)
    return []
  }
}

// 获取所有品牌
export async function getAllBrands(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_products')
      .select('brand')
      .order('brand')
    
    if (error) throw error
    
    // 去重并返回品牌列表
    const brands = [...new Set(data?.map(item => item.brand) || [])]
    return brands
  } catch (error) {
    console.error('Get all brands failed:', error)
    return []
  }
}

// 保存奶茶记录
export async function saveTeaRecord(record: Omit<TeaRecord, 'id' | 'created_at'>): Promise<TeaRecord | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_records')
      .insert([record])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Save tea record failed:', error)
    return null
  }
}

// 获取用户的奶茶记录
export async function getUserTeaRecords(userId: string, limit: number = 50): Promise<TeaRecord[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_records')
      .select(`
        *,
        tea_products (
          name,
          brand,
          base_calories,
          category
        )
      `)
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get user tea records failed:', error)
    return []
  }
}

// 删除奶茶记录
export async function deleteTeaRecord(recordId: string, userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('tea_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId)
    
    return !error
  } catch (error) {
    console.error('Delete tea record failed:', error)
    return false
  }
}

// 更新奶茶记录
export async function updateTeaRecord(recordId: string, userId: string, updates: Partial<TeaRecord>): Promise<TeaRecord | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('tea_records')
      .update(updates)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Update tea record failed:', error)
    return null
  }
}

// 获取用户记录统计
export async function getUserRecordStats(userId: string): Promise<{
  totalRecords: number
  totalCalories: number
  averageCalories: number
  favoriteCategory: string
  favoriteBrand: string
}> {
  try {
    const supabase = getSupabaseClient()
    
    // 获取总记录数和总热量
    const { data: records, error: recordsError } = await supabase
      .from('tea_records')
      .select('estimated_calories, tea_products(category, brand)')
      .eq('user_id', userId)
    
    if (recordsError) throw recordsError
    
    const totalRecords = records?.length || 0
    const totalCalories = records?.reduce((sum, record) => sum + (record.estimated_calories || 0), 0) || 0
    const averageCalories = totalRecords > 0 ? Math.round(totalCalories / totalRecords) : 0
    
    // 统计最喜欢的分类和品牌
    const categoryCount: Record<string, number> = {}
    const brandCount: Record<string, number> = {}
    
    records?.forEach(record => {
      const product = record.tea_products as any
      if (product?.category) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
      }
      if (product?.brand) {
        brandCount[product.brand] = (brandCount[product.brand] || 0) + 1
      }
    })
    
    const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, '未知'
    )
    
    const favoriteBrand = Object.keys(brandCount).reduce((a, b) => 
      brandCount[a] > brandCount[b] ? a : b, '未知'
    )
    
    return {
      totalRecords,
      totalCalories,
      averageCalories,
      favoriteCategory,
      favoriteBrand
    }
  } catch (error) {
    console.error('Get user record stats failed:', error)
    return {
      totalRecords: 0,
      totalCalories: 0,
      averageCalories: 0,
      favoriteCategory: '未知',
      favoriteBrand: '未知'
    }
  }
}