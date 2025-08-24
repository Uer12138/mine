"use client"

import { useState, useEffect } from "react"
import { Lightbulb, Zap, Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { searchMockProductsIntelligent } from "./brand-search"

interface MilkTeaProduct {
  id: string
  name: string
  brand: string
  calories: number
  sugar: string
  size: string
  ingredients: string[]
  rating: number
  category: "low" | "medium" | "high"
  image?: string
}

interface SmartRecommendationsProps {
  searchQuery: string
  onDrinkSelect?: (drink: MilkTeaProduct) => void
}

export default function SmartRecommendations({ searchQuery, onDrinkSelect }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{
    lowestCalorie: MilkTeaProduct | null
    balanced: MilkTeaProduct | null
  }>({ lowestCalorie: null, balanced: null })

  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations({ lowestCalorie: null, balanced: null })
      return
    }

    // 获取搜索结果
    const searchResults = searchMockProductsIntelligent(searchQuery, 20)
    
    if (searchResults.length === 0) {
      setRecommendations({ lowestCalorie: null, balanced: null })
      return
    }

    // 找到最低卡路里的选择
    const lowestCalorie = searchResults.reduce((prev, current) => 
      prev.calories < current.calories ? prev : current
    )

    // 找到兼具口味和低卡的选择（综合评分算法）
    const balanced = searchResults
      .filter(product => product.id !== lowestCalorie.id) // 排除最低卡的选择
      .map(product => {
        // 计算综合评分：评分权重40%，低卡权重60%
        const ratingScore = (product.rating / 5) * 0.4
        const calorieScore = (1 - (product.calories / Math.max(...searchResults.map(p => p.calories)))) * 0.6
        return {
          ...product,
          balanceScore: ratingScore + calorieScore
        }
      })
      .sort((a, b) => b.balanceScore - a.balanceScore)[0]

    setRecommendations({
      lowestCalorie,
      balanced: balanced || null
    })
  }, [searchQuery])

  if (!searchQuery.trim() || (!recommendations.lowestCalorie && !recommendations.balanced)) {
    return null
  }

  const renderRecommendationCard = (product: MilkTeaProduct, type: 'lowest' | 'balanced') => {
    const isLowest = type === 'lowest'
    const icon = isLowest ? <Zap className="w-4 h-4" /> : <Heart className="w-4 h-4" />
    const title = isLowest ? "最低卡选择" : "口味低卡平衡"
    const description = isLowest ? "热量最低的选择" : "兼顾口味与热量的推荐"
    const badgeColor = isLowest ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded-full ${isLowest ? 'bg-green-100' : 'bg-purple-100'}`}>
            <div className={isLowest ? 'text-green-600' : 'text-purple-600'}>
              {icon}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-sm truncate">{product.name}</h5>
              <p className="text-xs text-gray-500">{product.brand}</p>
            </div>
            <Badge className={`text-xs ${badgeColor} border-0`}>
              {product.calories} kcal
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xs ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.rating})</span>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={() => onDrinkSelect?.(product)}
            >
              选择
            </Button>
          </div>
          
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {product.ingredients.slice(0, 3).map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {ingredient}
                </Badge>
              ))}
              {product.ingredients.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{product.ingredients.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-mint/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg">智能推荐</CardTitle>
        </div>
        <CardDescription className="text-sm">
          基于搜索关键词 "{searchQuery}" 为您推荐的最佳选择
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-col sm:flex-row">
          {recommendations.lowestCalorie && renderRecommendationCard(recommendations.lowestCalorie, 'lowest')}
          {recommendations.balanced && renderRecommendationCard(recommendations.balanced, 'balanced')}
        </div>
        
        {!recommendations.balanced && recommendations.lowestCalorie && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 当前搜索结果较少，建议尝试更通用的关键词获得更多推荐
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}