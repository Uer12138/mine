"use client"

import { TrendingUp, TrendingDown, Flame } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RankingItem {
  rank: number
  name: string
  brand: string
  calories: number
  trend: "up" | "down" | "stable"
  category: "low" | "medium" | "high"
}

const mockRankings: RankingItem[] = [
  { rank: 1, name: "茉莉花茶", brand: "喜茶", calories: 45, trend: "stable", category: "low" },
  { rank: 2, name: "柠檬蜂蜜茶", brand: "奈雪", calories: 68, trend: "up", category: "low" },
  { rank: 3, name: "乌龙茶", brand: "茶百道", calories: 52, trend: "down", category: "low" },
  { rank: 4, name: "椰果奶茶", brand: "古茗", calories: 156, trend: "up", category: "medium" },
  { rank: 5, name: "红豆奶茶", brand: "蜜雪冰城", calories: 189, trend: "stable", category: "medium" },
]

export function HotRankings() {

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "low":
        return "低卡"
      case "medium":
        return "中卡"
      case "high":
        return "高卡"
      default:
        return ""
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-600" />
      default:
        return <div className="w-3 h-3" />
    }
  }

  return (
    <Card className="border-mint/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Flame className="w-5 h-5 text-orange-500 mr-2" />
          热门低卡奶茶
        </CardTitle>
        <CardDescription>基于用户搜索和热量数据的智能排行</CardDescription>


      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockRankings.map((item) => (
            <div
              key={item.rank}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-mint/30 hover:bg-mint/5 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.rank <= 3 ? "bg-mint text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.rank}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.brand}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Badge>
                    <span className="text-xs text-gray-500 font-mono">{item.calories} kcal</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">{getTrendIcon(item.trend)}</div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4 border-mint/30 text-mint hover:bg-mint/5 bg-transparent">
          查看完整排行榜
        </Button>
      </CardContent>
    </Card>
  )
}
