"use client"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface IngredientSelectorProps {
  selectedIngredients: Record<string, number>
  onChange: (ingredients: Record<string, number>) => void
}

const ingredients = [
  { name: "珍珠", caloriePerGram: 2.34, defaultAmount: 50, category: "经典" },
  { name: "椰果", caloriePerGram: 1.5, defaultAmount: 50, category: "低卡" }, // 75kcal/50g
  { name: "芋圆", caloriePerGram: 2.0, defaultAmount: 50, category: "经典" },
  { name: "红豆", caloriePerGram: 2.38, defaultAmount: 50, category: "经典" },
  { name: "布丁", caloriePerGram: 1.5, defaultAmount: 40, category: "特色" },
  { name: "仙草", caloriePerGram: 0.3, defaultAmount: 50, category: "低卡" },
  { name: "西米", caloriePerGram: 0.68, defaultAmount: 50, category: "经典" }, // 34kcal/50g
  { name: "芋泥", caloriePerGram: 0.88, defaultAmount: 50, category: "特色" },
  // 一点点品牌小料
  { name: "波霸", caloriePerGram: 0.72, defaultAmount: 50, category: "经典" }, // 36kcal/50g
  { name: "小珍珠", caloriePerGram: 0.7, defaultAmount: 50, category: "经典" }, // 35kcal/50g
  { name: "茶冻", caloriePerGram: 0.52, defaultAmount: 50, category: "低卡" }, // 26kcal/50g
  { name: "栀子冻", caloriePerGram: 0.58, defaultAmount: 50, category: "低卡" }, // 29kcal/50g
  { name: "椰奶冻", caloriePerGram: 1.54, defaultAmount: 50, category: "特色" }, // 77kcal/50g
  { name: "仙草冻", caloriePerGram: 0.96, defaultAmount: 50, category: "低卡" }, // 48kcal/50g
  // 益禾堂品牌小料
  { name: "青稞", caloriePerGram: 1.44, defaultAmount: 50, category: "经典" }, // 72kcal/50g
  { name: "西米明珠", caloriePerGram: 1.58, defaultAmount: 50, category: "经典" }, // 79kcal/50g
  { name: "益禾布丁", caloriePerGram: 1.2, defaultAmount: 50, category: "特色" }, // 60kcal/50g
  { name: "益禾红豆", caloriePerGram: 0.9, defaultAmount: 50, category: "经典" }, // 45kcal/50g
  { name: "益禾椰果", caloriePerGram: 0.78, defaultAmount: 50, category: "低卡" }, // 39kcal/50g
  { name: "冻冻", caloriePerGram: 0.54, defaultAmount: 50, category: "低卡" }, // 27kcal/50g
  { name: "多肉晶球", caloriePerGram: 0.7, defaultAmount: 50, category: "特色" }, // 35kcal/50g
  { name: "益禾仙草", caloriePerGram: 0.8, defaultAmount: 50, category: "低卡" }, // 40kcal/50g
  { name: "益禾珍珠", caloriePerGram: 2.2, defaultAmount: 50, category: "经典" }, // 110kcal/50g
  { name: "葡萄果肉", caloriePerGram: 0.5, defaultAmount: 50, category: "低卡" }, // 25kcal/50g
  { name: "芝士奶盖", caloriePerGram: 2.4, defaultAmount: 50, category: "特色" }, // 120kcal/50g
  // 沪上阿姨品牌小料
  { name: "马蹄爆爆珠", caloriePerGram: 0.72, defaultAmount: 50, category: "特色" }, // 36kcal/50g
  { name: "马蹄丸子", caloriePerGram: 0.68, defaultAmount: 50, category: "特色" }, // 34kcal/50g
  { name: "西柚粒", caloriePerGram: 0.3, defaultAmount: 50, category: "低卡" }, // 15kcal/50g
  { name: "血糯米", caloriePerGram: 2.2, defaultAmount: 50, category: "经典" }, // 110kcal/50g
  { name: "奶冻", caloriePerGram: 1.2, defaultAmount: 50, category: "特色" }, // 60kcal/50g
  { name: "沪上冻冻", caloriePerGram: 0.56, defaultAmount: 50, category: "低卡" }, // 28kcal/50g
  { name: "厚芋泥", caloriePerGram: 1.84, defaultAmount: 50, category: "特色" }, // 92kcal/50g
  { name: "小多肉", caloriePerGram: 0.5, defaultAmount: 50, category: "低卡" }, // 25kcal/50g
  { name: "谷谷茶金砖", caloriePerGram: 0.9, defaultAmount: 50, category: "特色" }, // 45kcal/50g
  { name: "米麻薯", caloriePerGram: 2.78, defaultAmount: 50, category: "经典" }, // 139kcal/50g
  { name: "黑糖波波", caloriePerGram: 3.2, defaultAmount: 50, category: "经典" }, // 160kcal/50g
  { name: "大多肉", caloriePerGram: 0.6, defaultAmount: 50, category: "低卡" }, // 30kcal/50g
  { name: "沪上芝士奶盖", caloriePerGram: 3.4, defaultAmount: 50, category: "特色" }, // 170kcal/50g
]

export default function IngredientSelector({ selectedIngredients, onChange }: IngredientSelectorProps) {
  const updateIngredient = (name: string, amount: number) => {
    const newIngredients = { ...selectedIngredients }
    if (amount < 0) {
      delete newIngredients[name]
    } else {
      newIngredients[name] = amount
    }
    onChange(newIngredients)
  }

  const addIngredient = (name: string) => {
    // 初始添加时使用量置为0
    updateIngredient(name, 0)
  }

  const removeIngredient = (name: string) => {
    const newIngredients = { ...selectedIngredients }
    delete newIngredients[name]
    onChange(newIngredients)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "低卡":
        return "bg-green-100 text-green-800"
      case "经典":
        return "bg-blue-100 text-blue-800"
      case "特色":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Available Ingredients */}
      <div>
        <h4 className="font-medium mb-3 text-sm sm:text-base">可选配料</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
          {ingredients
            .filter((ingredient) => !selectedIngredients[ingredient.name])
            .map((ingredient) => (
              <button
                key={ingredient.name}
                onClick={() => addIngredient(ingredient.name)}
                className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-mint/50 hover:bg-mint/5 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <span className="font-medium text-xs sm:text-sm truncate flex-1 min-w-0">{ingredient.name}</span>
                  <Badge className={`${getCategoryColor(ingredient.category)} text-xs flex-shrink-0`}>{ingredient.category}</Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(ingredient.caloriePerGram * 10)} kcal/10g
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Selected Ingredients */}
      {Object.keys(selectedIngredients).length > 0 && (
        <div>
          <h4 className="font-medium mb-3 text-sm sm:text-base">已选配料</h4>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(selectedIngredients).map(([name, amount]) => {
              const ingredient = ingredients.find((i) => i.name === name)
              if (!ingredient) return null

              const calories = Math.round(ingredient.caloriePerGram * amount)

              return (
                <div key={name} className="flex items-center justify-between p-2 sm:p-3 bg-mint/5 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <span className="font-medium text-sm sm:text-base truncate">{name}</span>
                    <Badge className={`${getCategoryColor(ingredient.category)} text-xs flex-shrink-0`}>{ingredient.category}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <div className="text-xs sm:text-sm text-mint-dark font-medium">{calories} kcal</div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {amount === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-5 h-5 sm:w-6 sm:h-6 p-0 border-red-300 bg-red-50 hover:bg-red-100 text-red-600"
                          onClick={() => removeIngredient(name)}
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-5 h-5 sm:w-6 sm:h-6 p-0 border-mint/30 bg-transparent"
                          onClick={() => updateIngredient(name, amount - 10)}
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                      )}
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-mono">{amount}g</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-5 h-5 sm:w-6 sm:h-6 p-0 border-mint/30 bg-mint/10 hover:bg-mint/20"
                        onClick={() => updateIngredient(name, amount + 10)}
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Total Ingredient Calories */}
      {Object.keys(selectedIngredients).length > 0 && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-mint/10 to-mint/5 rounded-lg border border-mint/20">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm sm:text-base text-mint-dark">配料总热量</span>
            <span className="text-lg sm:text-xl font-bold text-mint-dark">
              {Object.entries(selectedIngredients).reduce((total, [name, amount]) => {
                const ingredient = ingredients.find((i) => i.name === name)
                return total + (ingredient ? Math.round(ingredient.caloriePerGram * amount) : 0)
              }, 0)} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
