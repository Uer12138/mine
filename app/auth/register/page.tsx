'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { registerUser } from '@/lib/auth'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugMode, setDebugMode] = useState(false)
  const [detailedError, setDetailedError] = useState('')
  const [environmentStatus, setEnvironmentStatus] = useState<{hasSupabase: boolean, mode: string} | null>(null)
  const router = useRouter()

  // 检查环境状态
  React.useEffect(() => {
    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    setEnvironmentStatus({
      hasSupabase: hasSupabase,
      mode: hasSupabase ? 'database' : 'local'
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      setIsLoading(false)
      return
    }

    try {
      console.log('开始注册流程:', { username, passwordLength: password.length })
      const result = await registerUser(username, password)
      console.log('注册结果:', result)
      
      if (result.success) {
        // 注册成功后跳转到补充信息页面
        localStorage.setItem('tempUserId', result.user.id)
        console.log('注册成功，跳转到onboarding页面')
        router.push('/onboarding')
      } else {
        console.error('注册失败:', result)
        setError(result.error || '注册失败')
        setDetailedError(JSON.stringify(result, null, 2))
      }
    } catch (err) {
      console.error('注册异常:', err)
      setError('注册失败，请重试')
      setDetailedError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">创建账户</CardTitle>
          <CardDescription className="text-gray-600">
            开始您的奶茶卡路里管理之旅
          </CardDescription>
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
                placeholder="请输入密码（至少6位）"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                required
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            {/* 环境状态显示 */}
            {environmentStatus && (
              <div className="text-xs text-gray-500 text-center">
                模式: {environmentStatus.mode === 'database' ? '数据库' : '本地存储'}
                {environmentStatus.mode === 'local' && (
                  <div className="text-yellow-600 mt-1">
                    ⚠️ 当前使用本地存储模式，数据仅保存在浏览器中
                  </div>
                )}
              </div>
            )}
            
            {/* 调试模式按钮（仅开发环境） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className="text-xs"
                >
                  🔍 {debugMode ? '隐藏' : '显示'}调试信息
                </Button>
              </div>
            )}
            
            {/* 调试信息显示 */}
            {debugMode && detailedError && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <div className="font-semibold mb-2">详细错误信息:</div>
                <pre className="whitespace-pre-wrap">{detailedError}</pre>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账户？{' '}
              <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
