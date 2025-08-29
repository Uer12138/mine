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
import { updateUserInfo, initializeTeaCalorieTasks } from "@/lib/auth"

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    sweetness_preference: "medium",
  })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formValid, setFormValid] = useState(false)
  const router = useRouter()
  
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

  useEffect(() => {
    // 检查是否有临时用户ID
    const tempUserId = localStorage.getItem("tempUserId")
    if (!tempUserId) {
      router.push("/auth/login")
    }
  }, [router])
  
  // 监听表单数据变化，验证表单
  useEffect(() => {
    const isValid = true // 移除必填字段验证
    setFormValid(isValid)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const tempUserId = localStorage.getItem("tempUserId")
    if (!tempUserId) {
      setError("用户会话已过期，请重新登录")
      setIsLoading(false)
      return
    }

    // 移除身高体重年龄验证

    try {
      // 更新用户信息
      const updateResult = await updateUserInfo(tempUserId, {
        sweetness_preference: formData.sweetness_preference,
        favorite_brands: selectedBrands,
        disliked_ingredients: dislikedIngredients
      })

      if (!updateResult.success) {
        throw new Error(updateResult.error)
      }

      // 初始化用户任务
      const initResult = await initializeTeaCalorieTasks(tempUserId)
      if (!initResult.success) {
        throw new Error(initResult.error)
      }

      // 清除临时用户ID，设置正式用户
      localStorage.removeItem("tempUserId")
      localStorage.setItem("currentUser", JSON.stringify(updateResult.user))

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "设置过程中出现错误")
    } finally {
      setIsLoading(false)
    }
  }
  
  // 处理品牌选择
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    )
  }
  
  // 处理不喜小料选择
  const handleIngredientToggle = (ingredient: string) => {
    setDislikedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient) 
        : [...prev, ingredient]
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teacal-mint/20 to-teacal-cream">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">完善个人信息</CardTitle>
          <CardDescription className="text-gray-600">
            设置您的奶茶偏好，开始健康的奶茶之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sweetness">甜度偏好</Label>
              <Select
                value={formData.sweetness_preference}
                onValueChange={(value) => setFormData({ ...formData, sweetness_preference: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择甜度偏好" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低甜 (0-30%)</SelectItem>
                  <SelectItem value="medium">中甜 (30-70%)</SelectItem>
                  <SelectItem value="high">高甜 (70-100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>不喜欢的小料（可多选）</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {commonIngredients.map((ingredient) => (
                  <div key={ingredient} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`ingredient-${ingredient}`} 
                      checked={dislikedIngredients.includes(ingredient)}
                      onCheckedChange={() => handleIngredientToggle(ingredient)}
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
            
            <div className="space-y-2">
              <Label>常喝的奶茶品牌（可多选）</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {teaBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`brand-${brand}`} 
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => handleBrandToggle(brand)}
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

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg rounded-lg shadow-lg transition-all" 
                disabled={isLoading || !formValid}
              >
                {isLoading ? "设置中..." : formValid ? "确认" : "请填写所有必填信息"}
              </Button>
              {!formValid && (
                <p className="text-amber-600 text-sm text-center mt-2">请填写所有带 * 的必填项后再提交</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
