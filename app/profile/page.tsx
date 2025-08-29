"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateUserInfo } from "@/lib/auth"
import { getUserProfile, updateUserProfile } from "@/lib/user-data-sync"
import { getCurrentUserIdClient } from "@/lib/supabase"

interface User {
  id: string
  username: string
  sweetness_preference?: string
  favorite_brands?: string[]
  disliked_ingredients?: string[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  
  // 常见奶茶品牌列表
  const teaBrands = [
    "茶百道",
    "奈雪的茶",
    "蜜雪冰城",
    "一点点",
    "COCO都可",
    "益禾堂",
    "沪上阿姨"
  ]
  
  // 常见小料列表
  const commonIngredients = [
    "珍珠",
    "椰果",
    "布丁",
    "仙草",
    "红豆",
    "芋圆",
    "奶盖",
    "燕麦"
  ]
  const [formData, setFormData] = useState({
    sweetness_preference: "medium",
    favorite_brands: [] as string[],
    disliked_ingredients: [] as string[],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await getCurrentUserIdClient()
        if (!userId) {
          router.push("/auth/login")
          return
        }

        // 首先尝试从数据库获取用户资料
        const result = await getUserProfile(userId)
        if (result.success && result.data) {
          const profile = result.data
          setUser({
            id: userId,
            username: profile.username,
            sweetness_preference: profile.sweetness_preference,
            favorite_brands: profile.favorite_brands,
            disliked_ingredients: profile.disliked_ingredients
          })
          setFormData({
            sweetness_preference: profile.sweetness_preference || "medium",
            favorite_brands: profile.favorite_brands || [],
            disliked_ingredients: profile.disliked_ingredients || [],
          })
        } else {
          // 回退到localStorage
          const currentUser = localStorage.getItem("currentUser")
          if (currentUser) {
            const userData = JSON.parse(currentUser)
            setUser(userData)
            setFormData({
              sweetness_preference: userData.sweetness_preference || "medium",
              favorite_brands: userData.favorite_brands || [],
              disliked_ingredients: userData.disliked_ingredients || [],
            })
          } else {
            router.push("/auth/login")
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        // 回退到localStorage
        const currentUser = localStorage.getItem("currentUser")
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          setUser(userData)
          setFormData({
            sweetness_preference: userData.sweetness_preference || "medium",
            favorite_brands: userData.favorite_brands || [],
            disliked_ingredients: userData.disliked_ingredients || [],
          })
        } else {
          router.push("/auth/login")
        }
      }
    }

    loadUserData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!user) return

    try {
      // 首先尝试更新数据库
      const profileData = {
        username: user.username,
        sweetness_preference: formData.sweetness_preference,
        favorite_brands: formData.favorite_brands,
        disliked_ingredients: formData.disliked_ingredients,
      }

      const result = await updateUserProfile(user.id, profileData)
      
      if (result.success) {
        // 数据库更新成功，同时更新localStorage
        const updatedUser = { ...user, ...profileData }
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setSuccess("个人信息更新成功！")
        setIsEditing(false)
        
        // 触发用户偏好更新事件
        window.dispatchEvent(new CustomEvent('userPreferencesUpdated'))
      } else {
        // 数据库更新失败，回退到原有逻辑
        const fallbackResult = await updateUserInfo(user.id, {
          sweetness_preference: formData.sweetness_preference,
          favorite_brands: formData.favorite_brands,
          disliked_ingredients: formData.disliked_ingredients,
        })

        if (fallbackResult.success) {
          const updatedUser = { ...user, ...fallbackResult.user }
          localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          setUser(updatedUser)
          setSuccess("个人信息更新成功！")
          setIsEditing(false)
          
          // 触发用户偏好更新事件
          window.dispatchEvent(new CustomEvent('userPreferencesUpdated'))
        } else {
          setError(fallbackResult.error || "更新失败")
        }
      }
    } catch (err) {
      setError("更新失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        sweetness_preference: user.sweetness_preference || "medium",
        favorite_brands: user.favorite_brands || [],
        disliked_ingredients: user.disliked_ingredients || [],
      })
    }
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  // 处理品牌选择
  const handleBrandToggle = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      favorite_brands: prev.favorite_brands.includes(brand)
        ? prev.favorite_brands.filter(b => b !== brand)
        : [...prev.favorite_brands, brand]
    }))
  }
  
  // 处理不喜小料选择
  const handleIngredientToggle = (ingredient: string) => {
    setFormData(prev => ({
      ...prev,
      disliked_ingredients: prev.disliked_ingredients.includes(ingredient)
        ? prev.disliked_ingredients.filter(i => i !== ingredient)
        : [...prev.disliked_ingredients, ingredient]
    }))
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
              <p className="text-gray-600">管理您的个人信息和偏好设置</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              返回首页
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>查看和编辑您的个人信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>用户名</Label>
                  <Input value={user.username} disabled className="mt-1" />
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sweetness-view">甜度偏好</Label>
                      <Select
                        value={formData.sweetness_preference}
                        onValueChange={(value) => {
                          setFormData({ ...formData, sweetness_preference: value })
                          // 自动保存甜度偏好
                          updateUserInfo(user.id, { sweetness_preference: value }).then((result) => {
                            if (result.success) {
                              const updatedUser = { ...user, sweetness_preference: value }
                              localStorage.setItem("currentUser", JSON.stringify(updatedUser))
                              setUser(updatedUser)
                              // 触发自定义事件通知其他组件更新
                              window.dispatchEvent(new Event('userPreferencesUpdated'))
                            }
                          })
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="选择甜度偏好" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低糖 (0-30%)</SelectItem>
                          <SelectItem value="medium">中糖 (30-70%)</SelectItem>
                          <SelectItem value="high">高糖 (70-100%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>常喝的奶茶品牌（可多选）</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {teaBrands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`view-brand-${brand}`} 
                              checked={formData.favorite_brands.includes(brand)}
                              onCheckedChange={() => {
                                const newBrands = formData.favorite_brands.includes(brand)
                                  ? formData.favorite_brands.filter(b => b !== brand)
                                  : [...formData.favorite_brands, brand]
                                setFormData({ ...formData, favorite_brands: newBrands })
                                // 自动保存品牌偏好
                                updateUserInfo(user.id, { favorite_brands: newBrands }).then((result) => {
                                  if (result.success) {
                                    const updatedUser = { ...user, favorite_brands: newBrands }
                                    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
                                    setUser(updatedUser)
                                    // 触发自定义事件通知其他组件更新
                                    window.dispatchEvent(new Event('userPreferencesUpdated'))
                                  }
                                })
                              }}
                            />
                            <Label 
                              htmlFor={`view-brand-${brand}`}
                              className="text-sm cursor-pointer"
                            >
                              {brand}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>不喜欢的小料（可多选）</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {commonIngredients.map((ingredient) => (
                          <div key={ingredient} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`view-ingredient-${ingredient}`} 
                              checked={formData.disliked_ingredients.includes(ingredient)}
                              onCheckedChange={() => {
                                const newIngredients = formData.disliked_ingredients.includes(ingredient)
                                  ? formData.disliked_ingredients.filter(i => i !== ingredient)
                                  : [...formData.disliked_ingredients, ingredient]
                                setFormData({ ...formData, disliked_ingredients: newIngredients })
                                // 自动保存小料偏好
                                updateUserInfo(user.id, { disliked_ingredients: newIngredients }).then((result) => {
                                  if (result.success) {
                                    const updatedUser = { ...user, disliked_ingredients: newIngredients }
                                    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
                                    setUser(updatedUser)
                                    // 触发自定义事件通知其他组件更新
                                    window.dispatchEvent(new Event('userPreferencesUpdated'))
                                  }
                                })
                              }}
                            />
                            <Label 
                              htmlFor={`view-ingredient-${ingredient}`}
                              className="text-sm cursor-pointer"
                            >
                              {ingredient}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="sweetness">甜度偏好</Label>
                      <Select
                        value={formData.sweetness_preference}
                        onValueChange={(value) => setFormData({ ...formData, sweetness_preference: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="选择甜度偏好" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低糖 (0-30%)</SelectItem>
                          <SelectItem value="medium">中糖 (30-70%)</SelectItem>
                          <SelectItem value="high">高糖 (70-100%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>常喝的奶茶品牌（可多选）</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {teaBrands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`brand-${brand}`} 
                              checked={formData.favorite_brands.includes(brand)}
                              onCheckedChange={() => handleBrandToggle(brand)}
                              disabled={isLoading}
                            />
                            <Label 
                              htmlFor={`brand-${brand}`}
                              className="text-sm cursor-pointer"
                            >
                              {brand}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>不喜欢的小料（可多选）</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {commonIngredients.map((ingredient) => (
                          <div key={ingredient} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`ingredient-${ingredient}`} 
                              checked={formData.disliked_ingredients.includes(ingredient)}
                              onCheckedChange={() => handleIngredientToggle(ingredient)}
                              disabled={isLoading}
                            />
                            <Label 
                              htmlFor={`ingredient-${ingredient}`}
                              className="text-sm cursor-pointer"
                            >
                              {ingredient}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    {success && <div className="text-green-500 text-sm text-center">{success}</div>}

                    <div className="flex space-x-3">
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? "保存中..." : "保存"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 bg-transparent"
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                )}


              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
