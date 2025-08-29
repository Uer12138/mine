"use client"

import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// 简单的错误边界组件
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Calculator page error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>出错了</CardTitle>
            </CardHeader>
            <CardContent>
              <p>计算器页面加载时发生错误。</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
import { Calculator, ChevronDown, ChevronUp, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

import BrandSearch from "@/components/brand-search"
import IngredientSelector from "@/components/ingredient-selector"
import { getCurrentUserIdClient } from "@/lib/supabase"
import { addTeaRecord } from "@/lib/user-data-sync"


export default function CalculatorPage() {
  const router = useRouter()
  const [drinkCalories, setDrinkCalories] = useState(0);
  const [ingredientsCalories, setIngredientsCalories] = useState(0);
  // 总热量通过基础热量和配料热量计算得出，无需单独存储
  const totalCalories = drinkCalories + ingredientsCalories;
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({})
  const [selectedDrink, setSelectedDrink] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCalorieTableExpanded, setIsCalorieTableExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // 计算配料总热量
  const calculateIngredientsCalories = () => {
    return Object.entries(selectedIngredients).reduce((total, [name, amount]) => {
      const ingredientData = {
        珍珠: 2.34, // per gram
        // 这里的热量数据会被ingredients数组中的数据覆盖
        椰果: 0.4,
        芋圆: 2.0,
        红豆: 2.38,
        布丁: 1.5,
        仙草: 0.3,
        西米: 1.2,
        芋泥: 0.88,
        波霸: 0.72,
        小珍珠: 0.7,
        茶冻: 0.52,
        栀子冻: 0.58,
        椰奶冻: 1.54,
        仙草冻: 0.96,
        青稞: 1.44,
        西米明珠: 1.58,
        益禾布丁: 1.2,
        益禾红豆: 0.9,
        益禾椰果: 0.78,
        冻冻: 0.54,
        多肉晶球: 0.7,
        益禾仙草: 0.8,
        益禾珍珠: 2.2,
        葡萄果肉: 0.5,
        芝士奶盖: 2.4,
        马蹄爆爆珠: 0.72,
        马蹄丸子: 0.68,
        西柚粒: 0.3,
        血糯米: 2.2,
        奶冻: 1.2,
        沪上冻冻: 0.56,
        厚芋泥: 1.84,
        小多肉: 0.5,
        谷谷茶金砖: 0.9,
        米麻薯: 2.78,
        黑糖波波: 3.2,
        大多肉: 0.6,
        沪上芝士奶盖: 3.4,
      }
      return total + (ingredientData[name as keyof typeof ingredientData] || 0) * amount
    }, 0)
  }

  // 保存当前选择到记录
  const handleSaveToRecord = async () => {
    if (!selectedDrink) {
      alert('请先选择一款奶茶')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const userId = await getCurrentUserIdClient()
      
      const teaRecordData = {
        user_id: userId,
        tea_product_id: null, // 热量计算器中的奶茶不关联具体产品ID
        tea_name: selectedDrink.name,
        brand: selectedDrink.brand,
        size: 'medium', // 默认中杯
        sweetness_level: '50', // 默认半糖
        toppings: Object.keys(selectedIngredients), // 直接使用数组而不是字符串
        estimated_calories: totalCalories,
        notes: `热量计算器保存：${selectedDrink.name} + ${Object.keys(selectedIngredients).join('、')}`,
        recorded_at: new Date().toISOString()
      }
      
      const result = await addTeaRecord(teaRecordData)
      
      if (result.success) {
        setSaveMessage('已成功保存到我的记录！')
        alert(`已将「${selectedDrink.name}」保存到我的记录中！\n总热量：${totalCalories} kcal`)
      } else {
        setSaveMessage('已保存到本地记录！')
        alert(`已将「${selectedDrink.name}」保存到本地记录中！\n总热量：${totalCalories} kcal`)
      }
      
    } catch (error) {
      console.error('保存记录失败:', error)
      alert('保存失败，请重试')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  // 计算运动消耗时间（假设每消耗100kcal需要跑步10分钟）
  const calculateExerciseTime = (calories: number) => {
    return calories > 0 ? Math.round(calories / 10) : 0;
  }

  // 只在组件初始化时运行一次
  useEffect(() => {
    setDrinkCalories(0);
    setIngredientsCalories(0);
  }, [])

  // 自动计算热量
  useEffect(() => {
    if (selectedDrink || Object.keys(selectedIngredients).length > 0) {
      // 计算奶茶基础热量
      const drinkCal = selectedDrink?.calories || 0;
      setDrinkCalories(drinkCal);
      // 计算配料总热量
      const ingredientsCal = calculateIngredientsCalories();
      setIngredientsCalories(ingredientsCal);
    }
  }, [selectedDrink, selectedIngredients])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-mint/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4 w-full">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                  onClick={() => router.push("/dashboard")}
                >
                  <span className="hidden sm:inline">← 返回首页</span>
                  <span className="sm:hidden">← 首页</span>
                </Button>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-1 justify-center sm:justify-start">
                  <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-mint" />
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">热量查询</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* 奶茶搜索模块 */}
              <BrandSearch
                selectedIngredients={selectedIngredients}
                onIngredientsChange={setSelectedIngredients}
                onDrinkSelect={(drink) => {
                  setSelectedDrink(drink);
                }}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
              />
              
              {/* 添加配料模块 */}
              <Card className="border-mint/20">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">添加配料</CardTitle>
                  <CardDescription className="text-sm sm:text-base">选择你喜欢的配料，点击加号添加用量</CardDescription>
                </CardHeader>
                <CardContent>
                  <IngredientSelector selectedIngredients={selectedIngredients} onChange={setSelectedIngredients} />
                  
                  {/* 配料总热量显示 */}
                  {Object.keys(selectedIngredients).length > 0 && (
                    <div className="mt-4 p-3 bg-mint/10 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm sm:text-base">配料总热量:</span>
                        <span className="font-bold text-mint-dark text-sm sm:text-base">
                          {ingredientsCalories.toFixed(0)} kcal
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 总热量显示和保存按钮 */}
              {selectedDrink && (
                <Card className="border-mint/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {selectedDrink.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedDrink.brand} • 总热量: <span className="font-bold text-mint-dark">{totalCalories} kcal</span>
                        </p>
                        {Object.keys(selectedIngredients).length > 0 && (
                          <p className="text-xs text-gray-500">
                            配料: {Object.keys(selectedIngredients).join('、')}
                          </p>
                        )}
                        {saveMessage && (
                          <p className="text-sm text-green-600 mt-2">{saveMessage}</p>
                        )}
                      </div>
                      <Button 
                        onClick={handleSaveToRecord}
                        disabled={isSaving}
                        className="bg-mint hover:bg-mint-dark text-white px-6 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? '保存中...' : '保存到记录'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>


          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
