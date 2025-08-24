"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Settings, Target, TrendingUp, AlertTriangle } from 'lucide-react'

interface BudgetManagerProps {
  weeklyBudget?: number
  weeklyCalories: number
  onBudgetChange?: (budget: number) => void
}

export default function BudgetManager({ weeklyBudget: initialBudget, weeklyCalories, onBudgetChange }: BudgetManagerProps) {
  const [weeklyBudget, setWeeklyBudget] = useState(initialBudget || 2000) // 默认每周2000卡路里预算
  const [isEditing, setIsEditing] = useState(false)
  const [tempBudget, setTempBudget] = useState(weeklyBudget)

  // 从localStorage加载预算设置
  useEffect(() => {
    const savedBudget = localStorage.getItem('weeklyCalorieBudget')
    if (savedBudget) {
      const budget = parseInt(savedBudget)
      setWeeklyBudget(budget)
      setTempBudget(budget)
    } else if (initialBudget) {
      setWeeklyBudget(initialBudget)
      setTempBudget(initialBudget)
    }
  }, [initialBudget])

  // 保存预算到localStorage
  const saveBudget = () => {
    if (tempBudget > 0 && tempBudget <= 10000) {
      setWeeklyBudget(tempBudget)
      localStorage.setItem('weeklyCalorieBudget', tempBudget.toString())
      setIsEditing(false)
      onBudgetChange?.(tempBudget)
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setTempBudget(weeklyBudget)
    setIsEditing(false)
  }

  // 计算使用百分比
  const usagePercentage = Math.min((weeklyCalories / weeklyBudget) * 100, 100)
  const remainingCalories = weeklyBudget - weeklyCalories

  // 获取状态信息
  const getStatusInfo = () => {
    if (weeklyCalories > weeklyBudget) {
      return {
        status: 'exceeded',
        message: '您本周奶茶卡路里摄入已超预设额度，为了健康管理目标，建议暂停奶茶摄入，优先回归膳食平衡～',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        progressColor: 'bg-red-500',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
      }
    } else if (usagePercentage >= 80) {
      return {
        status: 'warning',
        message: '您本周奶茶卡路里额度已临近阈值，建议后续选择低糖/小份奶茶，保持美味与健康的平衡～',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        progressColor: 'bg-orange-500',
        icon: <TrendingUp className="w-5 h-5 text-orange-500" />
      }
    } else {
      return {
        status: 'good',
        message: '本周奶茶卡路里余额充裕，选杯爱喝的犒劳自己吧～',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        progressColor: 'bg-green-500',
        icon: <Target className="w-5 h-5 text-green-500" />
      }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center space-x-2">
            {statusInfo.icon}
            <span>预算管理</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 预算设置 */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">每周卡路里预算</label>
              <div className="flex space-x-2 mt-1">
                <Input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(Number(e.target.value))}
                  className="flex-1"
                  min="100"
                  max="10000"
                  placeholder="输入预算值"
                />
                <span className="flex items-center text-sm text-gray-500">kcal</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveBudget} size="sm" className="bg-mint hover:bg-mint-dark text-white">
                保存
              </Button>
              <Button onClick={cancelEdit} variant="outline" size="sm">
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            每周预算：<span className="font-bold text-mint-dark">{weeklyBudget} kcal</span>
          </div>
        )}

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">已消耗</span>
            <span className={statusInfo.color}>
              {weeklyCalories} / {weeklyBudget} kcal
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{usagePercentage.toFixed(1)}% 已使用</span>
            <span>
              {remainingCalories > 0 ? `剩余 ${remainingCalories} kcal` : `超出 ${Math.abs(remainingCalories)} kcal`}
            </span>
          </div>
        </div>

        {/* 状态提示 */}
        <div className={`p-3 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
          <p className={`text-sm ${statusInfo.color} leading-relaxed`}>
            {statusInfo.message}
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-mint-dark">{weeklyCalories}</div>
            <div className="text-xs text-gray-500">本周摄入</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-mint-dark">
              {remainingCalories > 0 ? remainingCalories : 0}
            </div>
            <div className="text-xs text-gray-500">剩余额度</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}