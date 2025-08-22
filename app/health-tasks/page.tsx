"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, Trophy, Target, Zap, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button" // Fixed Button import to use the correct UI component

interface Task {
  id: string
  title: string
  description: string
  stage: "初级" | "中级" | "高级"
  completed: boolean
}

const healthTasks: Task[] = [
  // 初级阶段
  {
    id: "basic-1",
    title: "了解奶茶热量构成",
    description: "学习奶茶中茶底、糖分、配料、奶盖的热量分布，掌握基础知识",
    stage: "初级",
    completed: false,
  },
  {
    id: "basic-2",
    title: "记录一周奶茶消费",
    description: "连续7天记录每次奶茶消费，包括品牌、配料、心情等信息",
    stage: "初级",
    completed: false,
  },
  {
    id: "basic-3",
    title: "尝试减糖选择",
    description: "在下次点奶茶时选择三分糖或五分糖，体验口感差异",
    stage: "初级",
    completed: false,
  },
  {
    id: "basic-4",
    title: "使用热量计算器",
    description: "使用网站的热量计算器，为自己定制一杯低于250kcal的奶茶",
    stage: "初级",
    completed: false,
  },
  {
    id: "basic-5",
    title: "设定每日热量预算",
    description: "根据个人情况设定合理的每日奶茶热量预算（建议200-400kcal）",
    stage: "初级",
    completed: false,
  },

  // 中级阶段
  {
    id: "intermediate-1",
    title: "掌握配料替换技巧",
    description: "学会用椰果替代珍珠、用脱脂奶替代全脂奶等健康替换方法",
    stage: "中级",
    completed: false,
  },
  {
    id: "intermediate-2",
    title: "建立奶茶日记习惯",
    description: "连续30天记录奶茶消费，包括照片、心情、热量等完整信息",
    stage: "中级",
    completed: false,
  },
  {
    id: "intermediate-3",
    title: "探索不同品牌低卡选择",
    description: "在至少3个不同品牌中找到自己喜���的低卡奶茶组合",
    stage: "中级",
    completed: false,
  },
  {
    id: "intermediate-4",
    title: "学会看营养标签",
    description: "能够快速识别奶茶产品的热量、糖分、脂肪含量等关键信息",
    stage: "中级",
    completed: false,
  },
  {
    id: "intermediate-5",
    title: "制定个性化奶茶计划",
    description: "根据个人喜好和健康目标，制定专属的每周奶茶消费计划",
    stage: "中级",
    completed: false,
  },

  // 高级阶段
  {
    id: "advanced-1",
    title: "成为奶茶热量专家",
    description: "能够准确估算任意奶茶组合的热量，误差控制在±20kcal以内",
    stage: "高级",
    completed: false,
  },
  {
    id: "advanced-2",
    title: "帮助他人做健康选择",
    description: "向朋友或家人分享健康奶茶知识，帮助至少3人改善奶茶消费习惯",
    stage: "高级",
    completed: false,
  },
  {
    id: "advanced-3",
    title: "创造个人低卡配方",
    description: "创造并分享至少3个美味的低卡奶茶配方（每杯<200kcal）",
    stage: "高级",
    completed: false,
  },
  {
    id: "advanced-4",
    title: "维持长期健康习惯",
    description: "连续90天保持健康的奶茶消费习惯，平均每日热量控制在目标范围内",
    stage: "高级",
    completed: false,
  },
  {
    id: "advanced-5",
    title: "成为社区贡献者",
    description: "在奶茶健康社区中积极分享经验，获得其他用户的认可和感谢",
    stage: "高级",
    completed: false,
  },
]

export default function HealthTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(healthTasks)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 简化初始化逻辑
    const initializeTasks = () => {
      const savedTasks = localStorage.getItem("teacal-health-tasks")
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks)
          setTasks(parsedTasks)
        } catch (error) {
          console.error("Failed to parse saved tasks:", error)
        }
      }
      setIsLoading(false)
    }

    initializeTasks()
  }, [])

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)
    localStorage.setItem("teacal-health-tasks", JSON.stringify(updatedTasks))
  }

  const getStageProgress = (stage: "初级" | "中级" | "高级") => {
    const stageTasks = tasks.filter((task) => task.stage === stage)
    const completedTasks = stageTasks.filter((task) => task.completed)
    return {
      completed: completedTasks.length,
      total: stageTasks.length,
      percentage: Math.round((completedTasks.length / stageTasks.length) * 100),
    }
  }

  const totalCompleted = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const totalPercentage = Math.round((totalCompleted / totalTasks) * 100)

  const stageIcons = {
    初级: <Target className="w-5 h-5" />,
    中级: <Zap className="w-5 h-5" />,
    高级: <Trophy className="w-5 h-5" />,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto mb-4"></div>
          <p className="text-gray-600">加载健康任务中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative">
            {/* 返回主页按钮 */}
            <div className="absolute left-0 top-0">
              <Link href="/dashboard">
                <Button variant="outline" className="border-mint text-mint hover:bg-mint hover:text-white">
                  <Home className="w-4 h-4 mr-2" />
                  返回主页
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">健康任务列表</h1>
              <p className="text-gray-600">通过完成任务，逐步建立健康的奶茶消费习惯</p>
              <div className="mt-4">
                <Link href="/challenge/new">
                  <Button className="bg-mint hover:bg-mint-dark text-white">
                    <Target className="w-4 h-4 mr-2" />
                    创建新挑战
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 总体进度 */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-mint/20 shadow-sm">
          <div className="text-center mb-4">
            <h2 className="text-2xl text-mint-dark flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6" />
              总体进度
            </h2>
            <p className="text-gray-600">
              已完成 {totalCompleted} / {totalTasks} 个任务
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-mint h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalPercentage}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-mint-dark">{totalPercentage}%</span>
              <p className="text-sm text-gray-600 mt-1">
                {totalPercentage === 100
                  ? "🎉 恭喜！你已经成为奶茶健康管理专家！"
                  : totalPercentage >= 80
                    ? "👏 太棒了！你已经掌握了大部分技能！"
                    : totalPercentage >= 60
                      ? "💪 很好！继续保持这个节奏！"
                      : totalPercentage >= 40
                        ? "🌟 不错的开始！加油继续！"
                        : totalPercentage >= 20
                          ? "🚀 刚刚起步，每一步都很重要！"
                          : "🌱 开始你的健康奶茶之旅吧！"}
              </p>
            </div>
          </div>
        </div>

        {/* 各阶段任务 */}
        {(["初级", "中级", "高级"] as const).map((stage) => {
          const progress = getStageProgress(stage)
          const stageTasks = tasks.filter((task) => task.stage === stage)

          return (
            <div key={stage} className="mb-8 p-6 bg-white rounded-lg border border-mint/20 shadow-sm">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="flex items-center gap-2 text-xl font-semibold">
                    {stageIcons[stage]}
                    {stage}阶段
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">
                    {progress.completed}/{progress.total} 完成
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-mint h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">进度：{progress.percentage}%</p>
                </div>
              </div>
              <div className="space-y-3">
                {stageTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                      task.completed ? "bg-mint/5 border-mint/30" : "bg-white border-gray-200 hover:border-mint/30"
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <button className="mt-0.5 flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-mint" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-mint" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-medium mb-1 ${
                          task.completed ? "text-mint-dark line-through" : "text-gray-800"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className={`text-sm ${task.completed ? "text-gray-500" : "text-gray-600"}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* 鼓励信息 */}
        <div className="p-6 bg-mint/5 rounded-lg border border-mint/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-mint-dark mb-2">💡 小贴士</h3>
            <p className="text-gray-600 text-sm">
              每个任务都是为了帮助你建立更健康的奶茶消费习惯。不用急于求成，
              按照自己的节奏完成就好。记住，享受奶茶的快乐和保持健康并不冲突！
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
