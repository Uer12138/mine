"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Target, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewChallengePage() {
  const [challengeTitle, setChallengeTitle] = useState("")
  const [challengeDescription, setChallengeDescription] = useState("")
  const [challengeNotes, setChallengeNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGeneratePlan = async () => {
    if (!challengeTitle.trim()) {
      alert("请输入挑战标题")
      return
    }

    setIsGenerating(true)

    // 将挑战信息存储到localStorage，然后跳转到行动计划页面
    const challengeData = {
      title: challengeTitle,
      description: challengeDescription,
      notes: challengeNotes,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("current_challenge", JSON.stringify(challengeData))
    router.push("/challenge/action-plan")
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">创建新挑战</h1>
            <p className="text-gray-600">设定你的奶茶健康目标，让小敖为你生成专属行动计划</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-mint/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-mint/10 to-mint/5">
            <CardTitle className="flex items-center gap-2 text-mint-dark">
              <Target className="w-6 h-6" />
              挑战详情
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 挑战标题 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                挑战标题 <span className="text-red-500">*</span>
              </label>
              <Input
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="例如：一周内只喝三分糖及以下的奶茶"
                className="border-mint/30 focus:border-mint"
              />
              <p className="text-xs text-gray-500">简洁明确地描述你的挑战目标</p>
            </div>

            {/* 挑战描述 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">详细描述</label>
              <textarea
                value={challengeDescription}
                onChange={(e) => setChallengeDescription(e.target.value)}
                placeholder="详细说明你的挑战内容，比如具体的时间范围、目标等..."
                className="w-full p-3 border border-mint/30 rounded-md focus:border-mint focus:outline-none resize-none"
                rows={4}
              />
            </div>

            {/* 备注信息 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">个人备注</label>
              <textarea
                value={challengeNotes}
                onChange={(e) => setChallengeNotes(e.target.value)}
                placeholder="分享你的想法、担心或期望，这将帮助小敖为你制定更贴心的计划..."
                className="w-full p-3 border border-mint/30 rounded-md focus:border-mint focus:outline-none resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500">这些信息将帮助AI更好地理解你的需求</p>
            </div>

            {/* 示例挑战 */}
            <div className="bg-mint/5 p-4 rounded-lg border border-mint/20">
              <h4 className="text-sm font-medium text-mint-dark mb-2">💡 挑战示例</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 一个月内把常喝的全糖奶茶换成三分糖</p>
                <p>• 每周喝奶茶不超过3次</p>
                <p>• 尝试用低卡配料替代高热量配料</p>
                <p>• 建立每日奶茶热量记录习惯</p>
              </div>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating || !challengeTitle.trim()}
              className="w-full bg-mint hover:bg-mint-dark text-white py-3 text-base font-medium"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  小敖正在为你制定计划...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  确认并生成计划
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 温馨提示 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">小敖的贴心提醒</p>
              <p>
                设定挑战时，建议选择具体、可衡量的目标。小敖会根据你的情况，
                将大目标拆解成容易执行的小步骤，让你更容易坚持下去哦！
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
