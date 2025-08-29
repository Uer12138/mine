"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

// 动态导入PersonalizedRecommendations组件，确保只在客户端渲染
const PersonalizedRecommendations = dynamic(
  () => import("@/components/personalized-recommendations"),
  { ssr: false }
)

interface UserPreferences {
  favoriteBrands: string[]
  minSweetness: number
  dislikedIngredients: string[]
  healthGoals: string[]
}

export default function RecommendationsPage() {
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // 从localStorage读取用户信息和偏好
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser)
          
          // 构建用户偏好对象
          const preferences: UserPreferences = {
            favoriteBrands: user.favorite_brands || [],
            minSweetness: user.sweetness_preference === "low" ? 30 : 
                         user.sweetness_preference === "medium" ? 50 : 70,
            dislikedIngredients: user.disliked_ingredients || [], // 从用户注册信息中读取不喜小料
            healthGoals: ["控制热量摄入", "减少糖分"] // 默认健康目标
          }
          
          setUserPreferences(preferences)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")}>
                ← 返回首页
              </Button>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-mint" />
                <h1 className="text-xl font-bold text-gray-800">个性化推荐</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalizedRecommendations userPreferences={userPreferences || undefined} />
      </div>
    </div>
  )
}
