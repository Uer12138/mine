"use client"

import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface SugarLevelCalculatorProps {
  value: number
  onChange: (value: number) => void
  cupSize: "small" | "medium" | "large"
}

export default function SugarLevelCalculator({ value, onChange, cupSize }: SugarLevelCalculatorProps) {
  const getSugarCalories = (percentage: number) => {
    const baseCalories = {
      small: 80,
      medium: 120,
      large: 160,
    }
    return Math.round((percentage / 100) * baseCalories[cupSize])
  }

  const getSugarGrams = (percentage: number) => {
    const baseGrams = {
      small: 20,
      medium: 30,
      large: 40,
    }
    return Math.round((percentage / 100) * baseGrams[cupSize])
  }

  const getSugarLevelName = (percentage: number) => {
    if (percentage === 0) return "无糖"
    if (percentage <= 30) return "三分糖"
    if (percentage <= 50) return "五分糖"
    if (percentage <= 70) return "七分糖"
    return "全糖"
  }

  const getSugarLevelColor = (percentage: number) => {
    if (percentage === 0) return "bg-green-100 text-green-800"
    if (percentage <= 30) return "bg-green-100 text-green-700"
    if (percentage <= 50) return "bg-yellow-100 text-yellow-700"
    if (percentage <= 70) return "bg-orange-100 text-orange-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge className={getSugarLevelColor(value)}>{getSugarLevelName(value)}</Badge>
        <div className="text-right">
          <div className="font-bold text-mint-dark">{getSugarCalories(value)} kcal</div>
          <div className="text-xs text-gray-500">{getSugarGrams(value)}g 糖</div>
        </div>
      </div>

      <Slider value={[value]} onValueChange={(values) => onChange(values[0])} max={100} step={10} className="w-full" />

      <div className="grid grid-cols-6 gap-2 text-xs">
        {[0, 30, 50, 70, 100].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`p-2 rounded text-center transition-colors ${
              value === level ? "bg-mint text-white" : "bg-gray-100 text-gray-600 hover:bg-mint/20"
            }`}
          >
            <div className="font-medium">{getSugarLevelName(level)}</div>
            <div className="text-xs">{getSugarCalories(level)}kcal</div>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
        <p>
          💡 糖度标准基于 {cupSize === "small" ? "300ml" : cupSize === "medium" ? "500ml" : "700ml"}{" "}
          奶茶，不同品牌可能微调
        </p>
      </div>
    </div>
  )
}
