// 热量对比计算工具函数
// 基于100kcal标准计算食物和运动等价量

export interface FoodComparison {
  name: string
  amount: string
  weight: string
}

export interface ExerciseComparison {
  name: string
  duration: number
  unit: string
}

export interface CalorieComparison {
  calories: number
  foodEquivalents: FoodComparison[]
  exerciseEquivalents: ExerciseComparison[]
}

// 100kcal对应的食物等价量（基准数据）
const FOOD_BASE_100KCAL: FoodComparison[] = [
  { name: "白米饭", amount: "半碗", weight: "85g左右" },
  { name: "馒头", amount: "1个", weight: "51g左右" },
  { name: "全麦面包", amount: "1.5片", weight: "69g左右" },
  { name: "水果玉米", amount: "半根", weight: "90g左右" },
  { name: "鸡蛋", amount: "1.5个", weight: "90g左右" }
]

// 100kcal对应的运动消耗量（基准数据）
const EXERCISE_BASE_100KCAL: ExerciseComparison[] = [
  { name: "跳绳", duration: 10, unit: "分钟" },
  { name: "爬楼梯", duration: 10, unit: "分钟" },
  { name: "跑步", duration: 20, unit: "分钟" },
  { name: "大扫除", duration: 30, unit: "分钟" },
  { name: "站立", duration: 100, unit: "分钟" },
  { name: "慢走", duration: 50, unit: "分钟" }
]

/**
 * 计算指定热量对应的食物和运动等价量
 * @param calories 热量值（kcal）
 * @returns 热量对比数据
 */
export function calculateCalorieComparison(calories: number): CalorieComparison {
  if (calories <= 0) {
    return {
      calories: 0,
      foodEquivalents: [],
      exerciseEquivalents: []
    }
  }

  const ratio = calories / 100

  // 计算食物等价量
  const foodEquivalents: FoodComparison[] = FOOD_BASE_100KCAL.map(food => {
    // 对于"半碗"这种情况，需要特殊处理
    let baseAmount = 0.5 // 默认为半碗
    if (food.amount.includes("半")) {
      baseAmount = 0.5
    } else {
      const extracted = parseFloat(food.amount.replace(/[^0-9.]/g, ''))
      baseAmount = isNaN(extracted) ? 1 : extracted
    }
    
    const multipliedAmount = baseAmount * ratio
    const multipliedWeight = parseFloat(food.weight.replace(/[^0-9.]/g, '')) * ratio
    
    return {
      name: food.name,
      amount: formatAmount(multipliedAmount, food.amount),
      weight: `${Math.round(multipliedWeight)}g左右`
    }
  })

  // 计算运动等价量
  const exerciseEquivalents: ExerciseComparison[] = EXERCISE_BASE_100KCAL.map(exercise => ({
    name: exercise.name,
    duration: Math.round(exercise.duration * ratio),
    unit: exercise.unit
  }))

  return {
    calories,
    foodEquivalents,
    exerciseEquivalents
  }
}

/**
 * 格式化数量显示
 * @param multipliedAmount 计算后的数量
 * @param originalAmount 原始数量描述
 * @returns 格式化后的数量描述
 */
function formatAmount(multipliedAmount: number, originalAmount: string): string {
  const roundedAmount = Math.round(multipliedAmount * 10) / 10
  
  if (originalAmount.includes("半")) {
    // 白米饭的基准是"半碗"，所以multipliedAmount=1时应该显示"半碗"
    if (roundedAmount < 0.5) {
      return `${Math.round(roundedAmount * 10) / 10}碗`
    } else if (roundedAmount === 0.5) {
      return "1/4碗"
    } else if (roundedAmount === 1) {
      return "半碗"
    } else if (roundedAmount === 2) {
      return "1碗"
    } else if (roundedAmount < 2) {
      return `${Math.round(roundedAmount * 0.5 * 10) / 10}碗`
    } else {
      return `${Math.round(roundedAmount * 0.5 * 10) / 10}碗`
    }
  } else if (originalAmount.includes("片")) {
    return `${roundedAmount}片`
  } else if (originalAmount.includes("个")) {
    return `${roundedAmount}个`
  } else if (originalAmount.includes("根")) {
    return `${roundedAmount}根`
  }
  
  return `${roundedAmount}份`
}

/**
 * 获取热量等级描述
 * @param calories 热量值
 * @returns 热量等级描述
 */
export function getCalorieLevel(calories: number): { level: string; color: string; description: string } {
  if (calories <= 150) {
    return {
      level: "低热量",
      color: "text-green-600",
      description: "相对健康的选择"
    }
  } else if (calories <= 300) {
    return {
      level: "中等热量",
      color: "text-yellow-600",
      description: "适量饮用"
    }
  } else if (calories <= 500) {
    return {
      level: "高热量",
      color: "text-orange-600",
      description: "建议偶尔享用"
    }
  } else {
    return {
      level: "超高热量",
      color: "text-red-600",
      description: "需要谨慎选择"
    }
  }
}

/**
 * 获取推荐的运动建议（选择最合适的2-3种运动）
 * @param calories 热量值
 * @returns 推荐的运动建议
 */
export function getRecommendedExercises(calories: number): ExerciseComparison[] {
  const allExercises = calculateCalorieComparison(calories).exerciseEquivalents
  
  // 根据热量值选择最合适的运动建议
  if (calories <= 200) {
    // 低热量：选择轻松的运动
    return allExercises.filter(ex => ['慢走', '站立', '大扫除'].includes(ex.name)).slice(0, 2)
  } else if (calories <= 400) {
    // 中等热量：选择中等强度运动
    return allExercises.filter(ex => ['跑步', '跳绳', '慢走'].includes(ex.name)).slice(0, 3)
  } else {
    // 高热量：选择高强度运动
    return allExercises.filter(ex => ['跳绳', '爬楼梯', '跑步'].includes(ex.name))
  }
}