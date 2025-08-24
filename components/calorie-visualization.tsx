"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  calculateCalorieComparison, 
  getCalorieLevel, 
  getRecommendedExercises,
  type CalorieComparison 
} from '@/lib/calorie-comparison'
import { 
  Utensils, 
  Activity, 
  Info,
  Apple,
  Zap
} from 'lucide-react'

interface CalorieVisualizationProps {
  calories: number
  className?: string
  compact?: boolean
}

export default function CalorieVisualization({ 
  calories, 
  className = "", 
  compact = false 
}: CalorieVisualizationProps) {
  const comparison = calculateCalorieComparison(calories)
  const calorieLevel = getCalorieLevel(calories)
  const recommendedExercises = getRecommendedExercises(calories)

  if (calories <= 0) {
    return null
  }

  if (compact) {
    return (
      <div className={`mt-2 p-2 bg-gray-50 rounded-lg text-xs ${className}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">热量参考</span>
          </div>
          <Badge variant="outline" className={`text-xs ${calorieLevel.color}`}>
            {calorieLevel.level}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Apple className="w-3 h-3 text-green-500" />
            <span className="text-gray-600">≈ {comparison.foodEquivalents[0]?.amount} {comparison.foodEquivalents[0]?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600">需{recommendedExercises[0]?.name}{recommendedExercises[0]?.duration}{recommendedExercises[0]?.unit}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`mt-3 border-gray-200 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">热量直观对比</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`text-xs ${calorieLevel.color}`}>
              {calorieLevel.level}
            </Badge>
            <span className="text-xs text-gray-500">{calorieLevel.description}</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* 食物对比 */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Utensils className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">相当于食物</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {comparison.foodEquivalents.slice(0, 6).map((food, index) => (
                <div key={index} className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-xs font-medium text-green-800">{food.name}</span>
                  <span className="text-xs text-green-600">{food.amount}</span>
                  <span className="text-xs text-gray-500">({food.weight})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 运动消耗 */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">需要运动</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recommendedExercises.map((exercise, index) => (
                <div key={index} className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs font-medium text-blue-800">{exercise.name}</span>
                  <span className="text-xs text-blue-600">{exercise.duration}{exercise.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 健康提示 */}
          {calories > 300 && (
            <div className="flex items-start space-x-2 p-2 bg-yellow-50 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <span className="font-medium">健康提示：</span>
                {calories > 500 ? (
                  <span>这杯奶茶热量较高，建议选择小杯或减少配料，搭配适量运动。</span>
                ) : (
                  <span>适量饮用，建议搭配轻度运动帮助消耗热量。</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 简化版本的热量对比组件，用于列表展示
export function CalorieVisualizationMini({ calories, className = "" }: { calories: number, className?: string }) {
  return (
    <CalorieVisualization 
      calories={calories} 
      className={className} 
      compact={true} 
    />
  )
}