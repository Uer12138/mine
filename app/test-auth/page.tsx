"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [testResult, setTestResult] = useState("")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    const storedUsers = JSON.parse(localStorage.getItem("teacal_users") || "[]")
    const storedCurrentUser = localStorage.getItem("currentUser")

    setUsers(storedUsers)
    setCurrentUser(storedCurrentUser ? JSON.parse(storedCurrentUser) : null)
  }

  const runAuthTest = async () => {
    setTestResult("正在运行认证测试...")

    try {
      // 测试密码哈希函数
      const testPassword = "test123"
      const encoder = new TextEncoder()
      const data = encoder.encode(testPassword)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      const shortHash = hashHex.substring(0, 8)

      let result = `认证测试结果:\n`
      result += `✅ 密码哈希函数正常\n`
      result += `测试密码: ${testPassword}\n`
      result += `生成哈希: ${shortHash}\n`
      result += `哈希长度: ${shortHash.length}\n\n`

      // 测试用户数据
      if (users.length === 0) {
        result += `⚠️ 没有找到用户数据\n`
        result += `建议: 先注册一个用户\n`
      } else {
        result += `✅ 找到 ${users.length} 个用户\n`
        users.forEach((user, index) => {
          result += `用户 ${index + 1}: ${user.username}\n`
          result += `  - ID: ${user.id}\n`
          result += `  - 密码哈希: ${user.password_hash}\n`
          result += `  - 哈希长度: ${user.password_hash?.length || 0}\n`
          result += `  - 创建时间: ${user.created_at}\n`
        })
      }

      // 测试当前登录状态
      if (currentUser) {
        result += `✅ 当前用户已登录: ${currentUser.username}\n`
      } else {
        result += `❌ 当前没有用户登录\n`
      }

      setTestResult(result)
    } catch (error) {
      setTestResult(`测试失败: ${error}`)
    }
  }

  const clearAllData = () => {
    if (confirm("确定要清除所有用户数据吗？这将删除所有注册的用户！")) {
      localStorage.removeItem("teacal_users")
      localStorage.removeItem("currentUser")
      localStorage.removeItem("tempUserId")
      loadUserData()
      setTestResult("所有数据已清除")
    }
  }

  const fixUserData = async () => {
    if (users.length === 0) {
      setTestResult("没有用户数据需要修复")
      return
    }

    setTestResult("正在修复用户数据...")

    try {
      // 检查并修复密码哈希
      const fixedUsers = users.map((user) => {
        if (!user.password_hash || user.password_hash.length !== 8) {
          // 生成一个默认的哈希（实际应用中应该要求用户重新设置密码）
          const defaultHash = "00000000"
          return { ...user, password_hash: defaultHash, updated_at: new Date().toISOString() }
        }
        return user
      })

      localStorage.setItem("teacal_users", JSON.stringify(fixedUsers))
      loadUserData()
      setTestResult("用户数据修复完成")
    } catch (error) {
      setTestResult(`修复失败: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>TeaCal 认证系统测试</CardTitle>
            <CardDescription>测试和诊断认证系统的各项功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button onClick={runAuthTest} variant="default">
                运行认证测试
              </Button>
              <Button onClick={fixUserData} variant="outline">
                修复用户数据
              </Button>
              <Button onClick={clearAllData} variant="destructive">
                清除所有数据
              </Button>
            </div>

            {testResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>用户数据</CardTitle>
              <CardDescription>当前存储的用户信息</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-gray-500">没有用户数据</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={user.id} className="border p-3 rounded-lg">
                      <p>
                        <strong>用户 {index + 1}:</strong> {user.username}
                      </p>
                      <p className="text-sm text-gray-600">ID: {user.id}</p>
                      <p className="text-sm text-gray-600">密码哈希: {user.password_hash}</p>
                      <p className="text-sm text-gray-600">创建时间: {user.created_at}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>当前登录状态</CardTitle>
              <CardDescription>当前登录的用户信息</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="border p-3 rounded-lg">
                  <p>
                    <strong>用户名:</strong> {currentUser.username}
                  </p>
                  <p className="text-sm text-gray-600">ID: {currentUser.id}</p>
                  <p className="text-sm text-gray-600">登录时间: {new Date().toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-gray-500">当前没有用户登录</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用的调试和修复操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">在控制台运行调试命令</h4>
              </div>
              <div>
                <h4 className="font-medium mb-2">快速修复登录问题</h4>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">使用说明</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>点击"运行认证测试"检查系统状态</li>
                <li>如果发现问题，点击"修复用户数据"</li>
                <li>在浏览器控制台运行调试命令获取详细信息</li>
                <li>如果问题严重，可以清除所有数据重新开始</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
