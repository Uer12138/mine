"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalorieTable } from "@/components/calorie-table"
import { HotRankings } from "@/components/hot-rankings"
import { AiAssistant } from "@/components/ai-assistant"
import { ChevronDown, ChevronUp } from "lucide-react"


export default function DashboardPage() {
  // 小贴士数据
  const tips = [
    "💡 选择三分糖比全糖可以减少约60-80千卡热量，相当于少跑10分钟步！",
    "💡 用椰果替代珍珠，既有嚼劲又能减少近100千卡热量。",
    "💡 奶茶中的芝士奶盖通常含有较高脂肪，建议选择轻芝士版本。",
    "💡 茶底选择绿茶或乌龙茶，相比奶茶底热量更低。",
    "💡 避免添加额外的糖和炼乳，可以选择天然甜味剂代替。",
    "💡 小杯奶茶比大杯少约100-200千卡热量，适量饮用更健康。",
    "💡 仙草和冻冻是低热量的配料选择，适合控糖人群。",
    "💡 鲜牛奶制作的奶茶比植脂末制作的更健康，但热量可能稍高。",
    "💡 水果茶通常比奶茶热量低，但要注意含糖量。",
    "💡 喝奶茶后可以增加15-30分钟的步行，帮助消耗多余热量。"
  ]
  
  // 状态变量
  const [dailyTip, setDailyTip] = useState(tips[0])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalorieTableCollapsed, setIsCalorieTableCollapsed] = useState(true)
  const [weeklyBudget, setWeeklyBudget] = useState(2000)
  const [weeklyCalories, setWeeklyCalories] = useState(0)
  const router = useRouter()
  
  // 随机选择小贴士
  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length)
    setDailyTip(tips[randomIndex])
  }
  
  // 组件挂载时和每24小时更新小贴士
  useEffect(() => {
    getRandomTip()
    const interval = setInterval(getRandomTip, 24 * 60 * 60 * 1000) // 24小时
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // 检查登录状态
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(JSON.parse(currentUser))
    
    // 加载预算设置
    const savedBudget = localStorage.getItem("weeklyBudget")
    if (savedBudget) {
      setWeeklyBudget(parseInt(savedBudget))
    }
    
    // 计算本周卡路里
    calculateWeeklyCalories()
    
    setIsLoading(false)
  }, [router])

  // 监听记录更新事件
  useEffect(() => {
    const handleRecordUpdate = () => {
      calculateWeeklyCalories()
    }

    // 监听自定义事件
    window.addEventListener('recordUpdated', handleRecordUpdate)
    
    // 监听localStorage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teaRecords') {
        calculateWeeklyCalories()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('recordUpdated', handleRecordUpdate)
      window.removeEventListener('storage', handleRecordUpdate)
    }
  }, [])

  // 计算本周卡路里摄入
  const calculateWeeklyCalories = () => {
    try {
      const savedRecords = localStorage.getItem("teaRecords")
      if (savedRecords) {
        const records = JSON.parse(savedRecords)
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        
        const weeklyRecords = records.filter((record: any) => {
          const recordDate = new Date(record.timestamp)
          return recordDate >= startOfWeek && recordDate <= endOfWeek
        })
        
        const totalCalories = weeklyRecords.reduce((sum: number, record: any) => {
          return sum + (record.calories || 0)
        }, 0)
        
        setWeeklyCalories(totalCalories)
      }
    } catch (error) {
      console.error("计算本周卡路里失败:", error)
    }
  }

  // 处理预算变更
  const handleBudgetChange = (newBudget: number) => {
     setWeeklyBudget(newBudget)
     localStorage.setItem('weeklyCalorieBudget', newBudget.toString())
   }



  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A8DADC] to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8DADC] mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 会被重定向到首页
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8DADC] to-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-800">
                轻茶纪 <span className="text-sm font-normal text-gray-500">TeaCal</span>
              </Link>

            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user.username}</span>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  个人资料
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
              <img 
                src="/tea-logo.svg" 
                alt="轻茶纪 Logo" 
                className="max-w-full max-h-full" 
                style={{objectFit: 'contain'}}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">


          {/* Main Content - Quick Access */}
          <div>
            <Card className="bg-gradient-to-br from-[#A8DADC]/5 to-[#F8F9FA]">
              <CardHeader>
                <CardDescription>选择下方功能开始你的健康奶茶之旅</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/calculator" className="block">
                  <Button variant="outline" className="w-full justify-center p-6 border-2 border-[#A8DADC]">
                    <div className="text-3xl mb-2">🧮</div>
                    <span>热量查询</span>
                  </Button>
                </Link>
                <Link href="/my-records" className="block">
                  <Button variant="outline" className="w-full justify-center p-6 border-2 border-[#A8DADC]">
                    <div className="text-3xl mb-2">📝</div>
                    <span>我的记录</span>
                  </Button>
                </Link>
                <Link href="/recommendations" className="block">
                  <Button variant="outline" className="w-full justify-center p-6 border-2 border-[#A8DADC]">
                    <div className="text-3xl mb-2">⭐</div>
                    <span>个性推荐</span>
                  </Button>
                </Link>
                <Link href="/health-tasks" className="block">
                  <Button variant="outline" className="w-full justify-center p-6 border-2 border-[#A8DADC]">
                    <div className="text-3xl mb-2">🎯</div>
                    <span>健康任务</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            数据基于专业营养成分研究及主流奶茶品牌配料分析，不同制作工艺可能存在 ±10% 误差
          </p>

        </div>
      </footer>

      {/* AI Assistant */}
      <AiAssistant />
    </div>
  )
}
