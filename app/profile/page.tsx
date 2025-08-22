"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserInfo } from "@/lib/auth"

interface User {
  id: string
  username: string
  weight?: number
  height?: number
  age?: number
  sweetness_preference?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    sweetness_preference: "medium",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)
      setFormData({
        weight: userData.weight?.toString() || "",
        height: userData.height?.toString() || "",
        age: userData.age?.toString() || "",
        sweetness_preference: userData.sweetness_preference || "medium",
      })
    } else {
      router.push("/auth/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!user) return

    if (!formData.weight || !formData.height || !formData.age) {
      setError("请填写所有必填字段")
      setIsLoading(false)
      return
    }

    const weight = Number.parseFloat(formData.weight)
    const height = Number.parseFloat(formData.height)
    const age = Number.parseInt(formData.age)

    if (weight <= 0 || height <= 0 || age <= 0) {
      setError("所有数值必须大于0")
      setIsLoading(false)
      return
    }

    try {
      const result = await updateUserInfo(user.id, {
        weight,
        height,
        age,
        sweetness_preference: formData.sweetness_preference,
      })

      if (result.success) {
        const updatedUser = { ...user, ...result.user }
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setSuccess("个人信息���新成功！")
        setIsEditing(false)
      } else {
        setError(result.error || "更新失败")
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
        weight: user.weight?.toString() || "",
        height: user.height?.toString() || "",
        age: user.age?.toString() || "",
        sweetness_preference: user.sweetness_preference || "medium",
      })
    }
    setIsEditing(false)
    setError("")
    setSuccess("")
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>体重</Label>
                      <Input value={user.weight || "未设置"} disabled className="mt-1" />
                    </div>
                    <div>
                      <Label>身高</Label>
                      <Input value={user.height || "未设置"} disabled className="mt-1" />
                    </div>
                    <div>
                      <Label>年龄</Label>
                      <Input value={user.age || "未设置"} disabled className="mt-1" />
                    </div>
                    <div>
                      <Label>甜度偏好</Label>
                      <Input
                        value={
                          user.sweetness_preference === "low"
                            ? "低糖"
                            : user.sweetness_preference === "high"
                              ? "高糖"
                              : "中糖"
                        }
                        disabled
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">体重 (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="请输入体重"
                          required
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">身高 (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="请输入身高"
                          required
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">年龄</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="请输入年龄"
                          required
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
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

                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    编辑信息
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
