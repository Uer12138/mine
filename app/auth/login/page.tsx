"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginUser, clearOldUserData } from "@/lib/auth"
import { getUserProfile, loadBudgetData, getTeaRecords } from "@/lib/user-data-sync"
import { getCurrentUserIdClient } from "@/lib/supabase"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsClearData, setNeedsClearData] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setNeedsClearData(false)
    setDebugInfo("")

    try {
      // 检查用户是否存在
      const users = JSON.parse(localStorage.getItem("teacal_users") || "[]")
      const userExists = users.find((u: any) => u.username === username)
      
      if (userExists) {
        setDebugInfo(`欢迎回来，${username}！正在验证您的身份...`)
      } else {
        setDebugInfo(`正在验证用户 ${username}...`)
      }

      const result = await loginUser(username, password)

      if (result.success) {
        // 存储用户信息到localStorage
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        setDebugInfo(`欢迎回来，${username}！登录成功，正在加载您的数据...`)
        
        // 从数据库加载用户数据
        try {
          const userId = result.user.id
          
          // 加载用户资料
          const profileResult = await getUserProfile(userId)
          if (profileResult.success && profileResult.data) {
            // 将数据库中的用户资料同步到localStorage
            const existingUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
            const updatedUser = {
              ...existingUser,
              ...profileResult.data,
              id: userId // 确保ID正确
            }
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          }
          
          // 加载预算数据
          const budget = await loadBudgetData(userId)
          // loadBudgetData 函数已经会自动同步到localStorage
          
          // 预加载奶茶记录（可选，提升用户体验）
          await getTeaRecords(userId, 10) // 只加载最近10条记录
          
          setDebugInfo(`数据加载完成，正在跳转到主页...`)
        } catch (error) {
          console.error('Failed to load user data from database:', error)
          setDebugInfo(`数据加载遇到问题，但不影响使用，正在跳转...`)
        }
        
        // 跳转到主页
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000) // 给用户一点时间看到加载信息
      } else {
        // 如果用户存在但密码错误，显示友好的错误信息
        if (userExists) {
          setError("密码不正确，请重新输入")
          setDebugInfo(`${username}，请检查您的密码是否正确`)
        } else {
          setError("用户名或密码错误")
          setDebugInfo(`用户 ${username} 不存在，请检查用户名或前往注册`)
        }
      }
    } catch (err) {
      setError("登录失败，请重试")
      console.error("登录错误:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearData = () => {
    clearOldUserData()
    setNeedsClearData(false)
    setError("")
    setUsername("")
    setPassword("")
    setDebugInfo("")
    alert("旧数据已清除，请重新注册账户")
    router.push("/auth/register")
  }

  const handleDebug = () => {
    const users = JSON.parse(localStorage.getItem("teacal_users") || "[]")
    const currentUser = localStorage.getItem("currentUser")
    
    const debugText = `
调试信息:
- 存储的用户数量: ${users.length}
- 用户名列表: ${users.map((u: any) => u.username).join(", ") || "无"}
- 当前登录状态: ${currentUser ? "已登录" : "未登录"}
- 当前输入用户名: ${username}
    `.trim()
    
    setDebugInfo(debugText)
    console.log("调试信息:", debugText)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">欢迎回来</CardTitle>
          <CardDescription className="text-gray-600">登录您的奶茶卡路里管理账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {debugInfo && (
              <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg whitespace-pre-line">
                {debugInfo}
              </div>
            )}

            {needsClearData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800 mb-3">检测到数据格式不兼容，这可能是由于系统更新导致的。</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearData}
                  className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100 bg-transparent"
                >
                  清除旧数据并重新注册
                </Button>
              </div>
            )}

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDebug}
                className="px-3"
                title="调试信息"
              >
                🔍
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账户？{" "}
              <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
