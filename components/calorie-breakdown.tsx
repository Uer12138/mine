"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CalorieBreakdownProps {
  cupSize: "small" | "medium" | "large"
  sugarLevel: number
  milkType: string
  ingredients: Record<string, number>
  hasTopping: boolean
}

export default function CalorieBreakdown({
  cupSize,
  sugarLevel,
  milkType,
  ingredients,
  hasTopping,
}: CalorieBreakdownProps) {
  const calculateBreakdown = () => {
    // Base calories
    const baseCalories = {
      small: { "whole-milk": 60, "skim-milk": 30, "plant-milk": 45, creamer: 50 },
      medium: { "whole-milk": 120, "skim-milk": 60, "plant-milk": 90, creamer: 100 },
      large: { "whole-milk": 160, "skim-milk": 80, "plant-milk": 120, creamer: 130 },
    }

    // Sugar calories
    const sugarCalories = {
      small: (sugarLevel / 100) * 80,
      medium: (sugarLevel / 100) * 120,
      large: (sugarLevel / 100) * 160,
    }

    // Ingredient calories
    const ingredientCalories = Object.entries(ingredients).reduce((total, [name, amount]) => {
      const ingredientData = {
        珍珠: 2.34,
        椰果: 0.4,
        芋圆: 2.0,
        红豆: 2.38,
        布丁: 1.5,
        仙草: 0.3,
        西米: 1.2,
        芋泥: 0.88,
      }
      return total + (ingredientData[name as keyof typeof ingredientData] || 0) * amount
    }, 0)

    const base = baseCalories[cupSize][milkType as keyof typeof baseCalories.small] || 0
    const sugar = sugarCalories[cupSize]
    const ingredientsTotal = ingredientCalories
    const topping = hasTopping ? 195 : 0

    return [
      { name: "茶底+奶", value: Math.round(base), color: "#A8DADC" },
      { name: "糖分", value: Math.round(sugar), color: "#F4A261" },
      { name: "配料", value: Math.round(ingredientsTotal), color: "#E76F51" },
      { name: "奶盖", value: Math.round(topping), color: "#E9C46A" },
    ].filter((item) => item.value > 0)
  }

  const data = calculateBreakdown()
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-mint/20">
      <CardHeader>
        <CardTitle className="text-lg">热量构成分析</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kcal`, "热量"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{item.value} kcal</span>
                <span className="text-xs text-gray-500 ml-2">({Math.round((item.value / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
