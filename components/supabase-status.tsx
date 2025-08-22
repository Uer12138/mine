"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { checkSupabaseConnection } from "@/lib/supabase"

export function SupabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection()
        setConnectionStatus(isConnected ? "connected" : "disconnected")

        if (!isConnected) {
          setError("未检测到Supabase配置，当前使用本地存储")
        }
      } catch (err) {
        setConnectionStatus("disconnected")
        setError("连接检查失败：" + (err as Error).message)
      }
    }

    checkConnection()
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "checking":
        return "检查连接中..."
      case "connected":
        return "已成功连接云端数据"
      case "disconnected":
        return "使用本地存储"
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "checking":
        return "secondary"
      case "connected":
        return "default"
      case "disconnected":
        return "secondary"
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">数据存储状态</span>
          </div>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusText()}
          </Badge>
        </div>

        {connectionStatus === "disconnected" && error && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>{error}</p>
            <p className="mt-1">�� 提示：要启用云端同步，请在项目设置中添加Supabase集成</p>
          </div>
        )}

        {connectionStatus === "connected" && (
          <div className="mt-2 text-xs text-green-600">✨ 您的任务进度将自动同步到云端，可在任何设备上访问</div>
        )}
      </CardContent>
    </Card>
  )
}
