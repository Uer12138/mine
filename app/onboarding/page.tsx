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
    weight: "",
    height: "",
    age: "",
    sweetness_preference: "medium",
  })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
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

  useEffect(() => {
    // 检查是否有临时用户ID
    const tempUserId = localStorage.getItem("tempUserId")
    if (!tempUserId) {
      router.push("/auth/login")
    }
  }, [router])
  
  // 监听表单数据变化，验证表单
  useEffect(() => {
    const isValid = !!formData.weight && !!formData.height && !!formData.age
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

    // 验证表单数据
    if (!formData.weight || !formData.height || !formData.age) {
      setError("请填写所有必填信息")
      setIsLoading(false)
      return
    }

    const weight = Number.parseFloat(formData.weight)
    const height = Number.parseFloat(formData.height)
    const age = Number.parseInt(formData.age)

    if (weight <= 0 || height <= 0 || age <= 0) {
      setError("请输入有效的数值")
      setIsLoading(false)
      return
    }

    try {
      // 更新用户信息
      const updateResult = await updateUserInfo(tempUserId, {
        weight,
        height,
        age,
        sweetness_preference: formData.sweetness_preference,
        favorite_brands: selectedBrands
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teacal-mint/20 to-teacal-cream">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">完善个人信息</CardTitle>
          <CardDescription className="text-gray-600">
            为了为您提供更精准的奶茶热量管理建议，请填写以下信息
            <div className="mt-1 text-xs text-red-500">带 * 的为必填项</div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">体重 (kg) <span className="text-red-500">*</span></Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="请输入体重"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">身高 (cm) <span className="text-red-500">*</span></Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="请输入身高"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">年龄 <span className="text-red-500">*</span></Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="请输入年龄"
                required
                disabled={isLoading}
              />
            </div>

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
