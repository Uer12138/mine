"use client"

import { useState } from "react"
import { Target, AlertTriangle, Edit2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface BudgetManagerProps {
  weeklyBudget: number
  weeklyCalories: number
  onBudgetChange: (newBudget: number) => void
}

export default function BudgetManager({ weeklyBudget, weeklyCalories, onBudgetChange }: BudgetManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempBudget, setTempBudget] = useState(weeklyBudget.toString())

  const budgetPercentage = Math.min((weeklyCalories / weeklyBudget) * 100, 100)
  const isOverBudget = weeklyCalories > weeklyBudget
  const remainingCalories = weeklyBudget - weeklyCalories

  const handleSaveBudget = () => {
    const newBudget = parseInt(tempBudget)
    if (newBudget > 0) {
      onBudgetChange(newBudget)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setTempBudget(weeklyBudget.toString())
    setIsEditing(false)
  }

  const getBudgetStatus = () => {
    if (isOverBudget) {
      return { color: "text-red-600", bgColor: "bg-red-50", status: "超出预算" }
    } else if (budgetPercentage > 80) {
      return { color: "text-orange-600", bgColor: "bg-orange-50", status: "接近预算" }
    } else {
      return { color: "text-green-600", bgColor: "bg-green-50", status: "预算充足" }
    }
  }

  const statusInfo = getBudgetStatus()

  return (
    <Card className={`border-mint/20 ${statusInfo.bgColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-mint" />
            <CardTitle className="text-lg">本周卡路里预算</CardTitle>
            <Badge variant={isOverBudget ? "destructive" : "secondary"}>
              {statusInfo.status}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-mint hover:text-mint-dark"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          管理你的每周奶茶卡路里摄入量，保持健康的饮食习惯
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 预算设置 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">每周预算:</span>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="w-20 h-8 text-sm"
                min="1"
              />
              <span className="text-sm">kcal</span>
              <Button size="sm" onClick={handleSaveBudget} className="h-8 px-2">
                保存
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 px-2">
                取消
              </Button>
            </div>
          ) : (
            <span className="font-semibold">{weeklyBudget} kcal</span>
          )}
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>已消耗: {weeklyCalories} kcal</span>
            <span className={statusInfo.color}>
              {isOverBudget ? `超出 ${Math.abs(remainingCalories)}` : `剩余 ${remainingCalories}`} kcal
            </span>
          </div>
          <Progress 
            value={budgetPercentage} 
            className="h-2" 
            style={{
              backgroundColor: isOverBudget ? '#fee2e2' : '#f3f4f6'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>{budgetPercentage.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 状态提示 */}
        {isOverBudget && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">
              本周已超出预算 {Math.abs(remainingCalories)} kcal，建议选择低卡奶茶或增加运动量
            </span>
          </div>
        )}

        {/* 建议 */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>💡 小贴士：</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>选择无糖或少糖可减少约60-120kcal</li>
            <li>选择小杯装可减少约100-150kcal</li>
            <li>避免奶盖和高热量配料可减少约200-300kcal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}