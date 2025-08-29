'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserIdClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUserDataSync } from '@/hooks/useUserDataSync'

export default function SyncPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { isSyncing, lastSyncTime } = useUserDataSync()

  useEffect(() => {
    const initUser = async () => {
      try {
        const id = await getCurrentUserIdClient()
        if (!id) {
          router.push('/auth/login')
          return
        }
        setUserId(id)
      } catch (error) {
        console.error('Failed to get user ID:', error)
        router.push('/auth/login')
      }
    }

    initUser()
  }, [router])

  const handleSync = async () => {
    if (!userId) return

    setSyncStatus('syncing')
    setErrorMessage('')

    try {
      // 这里可以添加具体的同步逻辑
      // 例如：强制同步用户数据、偏好设置等
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟同步过程
      setSyncStatus('success')
    } catch (error) {
      setSyncStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '同步失败')
    }
  }

  if (!userId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">正在验证用户身份...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">数据同步</h1>
        <p className="text-muted-foreground">
          管理您的数据同步设置，确保您的奶茶记录和偏好设置在所有设备间保持同步。
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>同步状态</CardTitle>
            <CardDescription>
              查看当前的数据同步状态和最后同步时间
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>当前状态:</span>
              <span className={`font-medium ${
                isSyncing ? 'text-blue-600' : 'text-green-600'
              }`}>
                {isSyncing ? '同步中...' : '已同步'}
              </span>
            </div>
            
            {lastSyncTime && (
              <div className="flex items-center justify-between">
                <span>最后同步:</span>
                <span className="text-sm text-muted-foreground">
                  {lastSyncTime.toLocaleString('zh-CN')}
                </span>
              </div>
            )}

            <Button 
              onClick={handleSync} 
              disabled={syncStatus === 'syncing' || isSyncing}
              className="w-full"
            >
              {syncStatus === 'syncing' ? '同步中...' : '立即同步'}
            </Button>
          </CardContent>
        </Card>

        {syncStatus === 'success' && (
          <Alert>
            <AlertDescription>
              数据同步成功！您的所有数据已更新到最新状态。
            </AlertDescription>
          </Alert>
        )}

        {syncStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              同步失败: {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>同步说明</CardTitle>
            <CardDescription>
              了解数据同步的工作原理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• 您的奶茶记录会自动保存到云端</p>
            <p>• 个人偏好设置会在所有设备间同步</p>
            <p>• 预算和目标数据会实时更新</p>
            <p>• 离线时的数据会在下次连接时自动同步</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}