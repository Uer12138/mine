"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, RefreshCw, Check, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface ActionItem {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
}

interface Challenge {
  title: string
  description: string
  notes: string
  createdAt: string
}

export default function ActionPlanPage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [generationComplete, setGenerationComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const challengeData = localStorage.getItem("current_challenge")
    if (!challengeData) {
      router.push("/challenge/new")
      return
    }

    const parsedChallenge = JSON.parse(challengeData)
    setChallenge(parsedChallenge)

    // 自动生成行动计划
    generateActionPlan(parsedChallenge)
  }, [router])

  const generateActionPlan = async (challengeData: Challenge) => {
    setIsGenerating(true)
    setActionItems([])
    setGenerationComplete(false)

    try {
      const response = await fetch("/api/generate-action-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challenge: challengeData,
          userId: getCurrentUserId(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No reader available")
      }

      const accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.actionItems) {
                setActionItems(data.actionItems)
                setGenerationComplete(true)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("生成行动计划失败:", error)
      // 提供备用的行动计划
      setActionItems([
        {
          id: "fallback-1",
          title: "记录当前奶茶消费习惯",
          description: "连续3天记录你的奶茶消费情况，包括品牌、糖分、配料等",
          priority: "high",
        },
        {
          id: "fallback-2",
          title: "尝试减少糖分",
          description: "下次点奶茶时，选择比平时少一个糖分等级的选项",
          priority: "medium",
        },
        {
          id: "fallback-3",
          title: "寻找替代方案",
          description: "研究低热量的奶茶配料选择，如椰果替代珍珠",
          priority: "low",
        },
      ])
      setGenerationComplete(true)
    } finally {
      setIsGenerating(false)
      setIsInitialLoad(false)
    }
  }

  const getCurrentUserId = () => {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user).id : null
  }

  const handleConfirm = () => {
    // 将行动计划保存到健康任务中
    const existingTasks = JSON.parse(localStorage.getItem("teacal-health-tasks") || "[]")

    const newTasks = actionItems.map((item, index) => ({
      id: `challenge-${Date.now()}-${index}`,
      title: item.title,
      description: item.description,
      stage: item.priority === "high" ? "初级" : item.priority === "medium" ? "中级" : "高级",
      completed: false,
    }))

    const updatedTasks = [...existingTasks, ...newTasks]
    localStorage.setItem("teacal-health-tasks", JSON.stringify(updatedTasks))

    // 清除当前挑战数据
    localStorage.removeItem("current_challenge")

    // 跳转到健康任务页面
    router.push("/health-tasks")
  }

  const handleRegenerate = () => {
    if (challenge) {
      generateActionPlan(challenge)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "优先"
      case "medium":
        return "重要"
      case "low":
        return "建议"
      default:
        return "普通"
    }
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/challenge/new")}
              className="border-mint/30 text-mint hover:bg-mint/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 行动计划</h1>
            <p className="text-gray-600">小敖为你量身定制的专属计划</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 挑战信息 */}
        <Card className="mb-6 border-mint/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-mint/10 to-mint/5">
            <CardTitle className="text-mint-dark">你的挑战</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{challenge.title}</h3>
            {challenge.description && <p className="text-gray-600 mb-2">{challenge.description}</p>}
            {challenge.notes && <p className="text-sm text-gray-500 italic">备注：{challenge.notes}</p>}
          </CardContent>
        </Card>

        {/* 行动计划 */}
        <Card className="border-mint/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-mint/10 to-mint/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-mint-dark">
                <Sparkles className="w-6 h-6" />
                小敖的行动建议
              </CardTitle>
              {generationComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="border-mint/30 text-mint hover:bg-mint/10 bg-transparent"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
                  重新生成
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isGenerating && isInitialLoad ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">小敖正在为你制定专属计划...</p>
                <p className="text-sm text-gray-500">这可能需要几秒钟时间</p>
              </div>
            ) : actionItems.length > 0 ? (
              <div className="space-y-4">
                {actionItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-mint/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800 flex-1">
                        {index + 1}. {item.title}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(item.priority)}`}
                      >
                        {getPriorityText(item.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}

                {generationComplete && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-mint/5 p-4 rounded-lg border border-mint/20 mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-mint mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-mint-dark">
                          <p className="font-medium mb-1">小敖的温馨提醒</p>
                          <p>
                            这些行动项是根据你的挑战目标精心设计的。建议按优先级顺序执行，
                            每完成一项就给自己一个小奖励。记住，改变需要时间，对自己耐心一点哦！
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleConfirm} className="flex-1 bg-mint hover:bg-mint-dark text-white py-3">
                        <Check className="w-5 h-5 mr-2" />
                        确认计划并添加到任务列表
                      </Button>
                      <Link href="/health-tasks">
                        <Button variant="outline" className="border-mint/30 text-mint hover:bg-mint/10 bg-transparent">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          查看任务列表
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">暂无行动计划</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
