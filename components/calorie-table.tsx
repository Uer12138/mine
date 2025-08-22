"use client"

import { useState } from "react"
import { Info, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Ingredient {
  name: string
  caloriesPer50g: number | string
  commonAmount: number
  calories: number
  description: string
  healthTip: string
  category: "topping" | "milk" | "sweetener"
}

const ingredients: Ingredient[] = [
  {
    name: "珍珠",
    caloriesPer50g: 117,
    commonAmount: 50,
    calories: 117,
    description: "木薯粉为主，添加糖浆增加热量",
    healthTip: "珍珠属于高热量碳水，建议用椰果替代",
    category: "topping",
  },
  {
    name: "芋圆",
    caloriesPer50g: 100,
    commonAmount: 50,
    calories: 100,
    description: "薯类 + 木薯粉 + 糖精",
    healthTip: "相对珍珠热量稍低，但仍属高碳水配料",
    category: "topping",
  },
  {
    name: "西米",
    caloriesPer50g: 60,
    commonAmount: 50,
    calories: 60,
    description: "纯木薯淀粉，精制碳水",
    healthTip: "比珍珠热量低，但营养价值有限",
    category: "topping",
  },
  {
    name: "芋泥",
    caloriesPer50g: 44,
    commonAmount: 50,
    calories: 44,
    description: "芋泥罐头含添加剂及额外糖",
    healthTip: "热量适中，但要注意添加糖含量",
    category: "topping",
  },
  {
    name: "青稞",
    caloriesPer50g: 42,
    commonAmount: 50,
    calories: 42,
    description: "本身健康，浸泡在糖水中增加热量",
    healthTip: "相对健康的选择，富含膳食纤维",
    category: "topping",
  },
  {
    name: "红豆",
    caloriesPer50g: 119,
    commonAmount: 50,
    calories: 119,
    description: "蒸煮时添加糖浆或蔗糖",
    healthTip: "含蛋白质和纤维，但糖分较高",
    category: "topping",
  },
  {
    name: "椰果",
    caloriesPer50g: 20,
    commonAmount: 50,
    calories: 20,
    description: "魔芋 + 明胶，膳食纤维丰富",
    healthTip: "低热量首选！富含膳食纤维，口感Q弹",
    category: "topping",
  },
  {
    name: "马蹄",
    caloriesPer50g: 50,
    commonAmount: 50,
    calories: 50,
    description: "罐头制品可能含添加糖",
    healthTip: "天然清甜，热量适中",
    category: "topping",
  },
  {
    name: "茶冻",
    caloriesPer50g: 30,
    commonAmount: 50,
    calories: 30,
    description: "茶 + 凝固剂，含少量糖",
    healthTip: "低热量选择，保留茶的抗氧化成分",
    category: "topping",
  },
  {
    name: "咖啡冻",
    caloriesPer50g: 56,
    commonAmount: 50,
    calories: 56,
    description: "含咖啡成分及添加糖",
    healthTip: "含咖啡因，下午饮用需注意",
    category: "topping",
  },
  {
    name: "芝士奶盖",
    caloriesPer50g: 326,
    commonAmount: 30,
    calories: 195.6,
    description: "奶油 + 芝士，高脂肪含量",
    healthTip: "热量极高！偶尔享受即可",
    category: "topping",
  },
  {
    name: "全脂牛奶",
    caloriesPer50g: "30（每100ml）",
    commonAmount: 200,
    calories: 120,
    description: "天然脂肪与蛋白质",
    healthTip: "营养丰富，含优质蛋白质",
    category: "milk",
  },
  {
    name: "脱脂牛奶",
    caloriesPer50g: "15（每100ml）",
    commonAmount: 200,
    calories: 60,
    description: "去除脂肪，热量降低",
    healthTip: "低热量选择，蛋白质含量不变",
    category: "milk",
  },
  {
    name: "奶精（植脂末）",
    caloriesPer50g: "250（每100g）",
    commonAmount: 10,
    calories: 50,
    description: "含反式脂肪酸，多种添加剂合成",
    healthTip: "建议选择真牛奶替代",
    category: "milk",
  },
]

export function CalorieTable() {
  const [amounts, setAmounts] = useState<Record<string, number>>(
    ingredients.reduce(
      (acc, ingredient) => ({
        ...acc,
        [ingredient.name]: ingredient.commonAmount,
      }),
      {},
    ),
  )

  const updateAmount = (name: string, newAmount: number) => {
    setAmounts((prev) => ({
      ...prev,
      [name]: Math.max(0, newAmount),
    }))
  }

  const calculateCalories = (ingredient: Ingredient, amount: number) => {
    if (ingredient.category === "milk") {
      return Math.round(
        (amount / 100) *
          (typeof ingredient.caloriesPer50g === "string"
            ? Number.parseInt(ingredient.caloriesPer50g.match(/\d+/)?.[0] || "0")
            : ingredient.caloriesPer50g),
      )
    }
    return Math.round((amount / 50) * (typeof ingredient.caloriesPer50g === "number" ? ingredient.caloriesPer50g : 0))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "topping":
        return "bg-mint/10 text-mint-dark"
      case "milk":
        return "bg-blue-50 text-blue-700"
      case "sweetener":
        return "bg-orange-50 text-orange-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "topping":
        return "配料"
      case "milk":
        return "奶制品"
      case "sweetener":
        return "甜味剂"
      default:
        return "其他"
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-mint/20">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">配料名称</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">每50g热量</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">使用量(g)</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">对应热量</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">详情</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => {
              const currentAmount = amounts[ingredient.name]
              const currentCalories = calculateCalories(ingredient, currentAmount)

              return (
                <tr key={ingredient.name} className="border-b border-gray-100 hover:bg-mint/5">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{ingredient.name}</span>
                      <Badge variant="secondary" className={getCategoryColor(ingredient.category)}>
                        {getCategoryName(ingredient.category)}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className="text-sm font-mono">
                      {typeof ingredient.caloriesPer50g === "number"
                        ? `${ingredient.caloriesPer50g} kcal`
                        : ingredient.caloriesPer50g}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 border-mint/30 bg-transparent"
                        onClick={() => updateAmount(ingredient.name, currentAmount - 10)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-12 text-center font-mono text-sm">{currentAmount}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 border-mint/30 bg-transparent"
                        onClick={() => updateAmount(ingredient.name, currentAmount + 10)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className="font-bold text-mint-dark font-mono">{currentCalories} kcal</span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-mint hover:text-mint-dark">
                          <Info className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <span>{ingredient.name}</span>
                            <Badge className={getCategoryColor(ingredient.category)}>
                              {getCategoryName(ingredient.category)}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription className="text-left space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1">热量来源</h4>
                              <p className="text-sm text-gray-600">{ingredient.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1">健康建议</h4>
                              <p className="text-sm text-mint-dark bg-mint/10 p-2 rounded">💡 {ingredient.healthTip}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded text-xs">
                              <p>
                                <strong>当前用量：</strong>
                                {currentAmount}g
                              </p>
                              <p>
                                <strong>对应热量：</strong>
                                {currentCalories} kcal
                              </p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
