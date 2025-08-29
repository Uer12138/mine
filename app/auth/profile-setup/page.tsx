"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserInfo } from "@/lib/auth"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    sweetness_preference: "medium",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 从localStorage获取当前用户ID
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      if (!currentUser.id) {
        throw new Error("用户信息不存在，请重新登录")
      }

      const result = await updateUserInfo(currentUser.id, {
        sweetness_preference: formData.sweetness_preference,
      })

      if (!result.success) {
        throw new Error(result.error || "更新用户信息失败")
      }

      // 更新localStorage中的用户信息
      const updatedUser = { ...currentUser, ...result.user }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // 跳转到任务列表页面
      router.push("/health-tasks")
    } catch (error) {
      console.error("Profile setup error:", error)
      setError(error instanceof Error ? error.message : "设置失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">完善个人信息</CardTitle>
          <CardDescription className="text-green-600">
            设置您的奶茶偏好，开始健康的奶茶之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sweetness">奶茶甜度偏好</Label>
              <Select
                value={formData.sweetness_preference}
                onValueChange={(value) => setFormData({ ...formData, sweetness_preference: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择您的甜度偏好" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_sugar">无糖</SelectItem>
                  <SelectItem value="low">三分糖</SelectItem>
                  <SelectItem value="medium">五分糖</SelectItem>
                  <SelectItem value="high">七分糖</SelectItem>
                  <SelectItem value="full">全糖</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? "保存中..." : "完成设置"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
