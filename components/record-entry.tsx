"use client"

import { useState, useEffect } from "react"
import { X, Heart, Smile, Frown, Star, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { mockProducts } from "@/components/brand-search"
import CupSizeSelector from './cup-size-selector'
import SugarLevelCalculator from './sugar-level-calculator'
import BrandSearch from './brand-search'
import { searchTeaProducts, saveTeaRecord, checkTeaDatabaseConnection, TeaProduct } from '@/lib/tea-database'
import { getCurrentUserIdClient } from '@/lib/supabase'

interface RecordEntryProps {
  onClose: () => void
}

interface MilkTeaProduct {
  id: string
  name: string
  brand: string
  calories: number
  sugar: string
  size: string
  ingredients: string[]
  rating: number
  category: "low" | "medium" | "high"
  image?: string
}

// 将TeaProduct转换为MilkTeaProduct的辅助函数
function convertTeaProduct(product: TeaProduct): MilkTeaProduct {
  return {
    id: product.id.toString(),
    name: product.name,
    brand: product.brand,
    calories: product.base_calories,
    sugar: product.sugar_content,
    size: product.size,
    ingredients: product.ingredients,
    rating: product.rating,
    category: product.category,
    image: product.image_url
  }
}

export default function RecordEntry({ onClose }: RecordEntryProps) {
  const [drinkName, setDrinkName] = useState("")
  const [selectedDrink, setSelectedDrink] = useState<MilkTeaProduct | null>(null)
  const [matchedDrink, setMatchedDrink] = useState<MilkTeaProduct | null>(null)
  const [searchResults, setSearchResults] = useState<MilkTeaProduct[]>([])
  const [cupSize, setCupSize] = useState<"small" | "medium" | "large">("medium")
  const [sugarLevel, setSugarLevel] = useState(50)
  const [mood, setMood] = useState("")
  const [notes, setNotes] = useState("")
  const [showBrandSearch, setShowBrandSearch] = useState(false)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const moods = [
    { key: "happy", label: "开心", icon: <Heart className="w-5 h-5 text-red-500" /> },
    { key: "satisfied", label: "满足", icon: <Smile className="w-5 h-5 text-green-500" /> },
    { key: "neutral", label: "一般", icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { key: "disappointed", label: "失望", icon: <Frown className="w-5 h-5 text-gray-500" /> },
  ]

  // 检查Supabase连接状态
  useEffect(() => {
    checkTeaDatabaseConnection().then(setIsSupabaseConnected)
  }, [])

  // 搜索奶茶产品
  useEffect(() => {
    const searchProducts = async () => {
      if (drinkName.trim()) {
        setIsSearching(true)
        
        let results: MilkTeaProduct[] = []
        
        if (isSupabaseConnected) {
          // 使用数据库搜索
          try {
            const dbResults = await searchTeaProducts(drinkName, 5)
            results = dbResults.map(convertTeaProduct)
          } catch (error) {
            console.error('Database search failed, falling back to mock data:', error)
            // 如果数据库搜索失败，回退到本地数据
            results = mockProducts.filter(product => 
              product.name.toLowerCase().includes(drinkName.toLowerCase()) ||
              product.brand.toLowerCase().includes(drinkName.toLowerCase())
            ).slice(0, 5)
          }
        } else {
          // 使用本地mock数据搜索
          results = mockProducts.filter(product => 
            product.name.toLowerCase().includes(drinkName.toLowerCase()) ||
            product.brand.toLowerCase().includes(drinkName.toLowerCase())
          ).slice(0, 5)
        }
        
        setSearchResults(results)
        
        if (results.length === 1) {
          setMatchedDrink(results[0])
        } else {
          setMatchedDrink(null)
        }
        
        setIsSearching(false)
      } else {
        setSearchResults([])
        setMatchedDrink(null)
      }
    }
    
    searchProducts()
  }, [drinkName, isSupabaseConnected])

  const handleSelectDrink = (drink: MilkTeaProduct) => {
    setSelectedDrink(drink)
    setDrinkName(drink.name)
    setSearchResults([])
    setMatchedDrink(null)
  }

  const calculateTotalCalories = () => {
    if (!selectedDrink) return 0
    
    const sizeMultiplier = {
      small: 0.8,
      medium: 1.0,
      large: 1.3
    }[cupSize] || 1.0
    
    const sugarMultiplier = sugarLevel / 100
    
    return Math.round(selectedDrink.calories * sizeMultiplier * (0.7 + 0.3 * sugarMultiplier))
  }

  const handleSubmit = async () => {
    const recordData = {
      drinkName: selectedDrink?.name || matchedDrink?.name || drinkName,
      brand: selectedDrink?.brand || matchedDrink?.brand || "未知品牌",
      calories: calculateTotalCalories() || matchedDrink?.calories || 0,
      cupSize,
      sugarLevel: getSugarLevelName(sugarLevel),
      mood,
      notes,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    }

    if (isSupabaseConnected) {
      // 尝试保存到数据库
      try {
        const userId = await getCurrentUserIdClient()
        const teaRecord = {
          user_id: userId,
          tea_product_id: selectedDrink ? parseInt(selectedDrink.id) : undefined,
          custom_name: (!selectedDrink && !matchedDrink) ? drinkName : undefined,
          tea_name: recordData.drinkName,
          size: cupSize,
          sweetness_level: recordData.sugarLevel,
          toppings: selectedDrink?.ingredients || matchedDrink?.ingredients || [],
          estimated_calories: recordData.calories,
          mood: mood || undefined,
          notes: notes || undefined,
          recorded_at: new Date().toISOString()
        }
        
        const savedRecord = await saveTeaRecord(teaRecord)
        if (savedRecord) {
          console.log('Record saved to database:', savedRecord)
          onClose()
          return
        }
      } catch (error) {
        console.error('Failed to save to database, falling back to localStorage:', error)
      }
    }
    
    // 如果数据库保存失败或未连接，使用localStorage
    const localRecord = {
      id: Date.now().toString(),
      ...recordData
    }
    
    const existingRecords = JSON.parse(localStorage.getItem('teaRecords') || '[]')
    const updatedRecords = [localRecord, ...existingRecords]
    localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
    
    onClose()
  }

  const getSugarLevelName = (percentage: number) => {
    if (percentage === 0) return "无糖"
    if (percentage <= 30) return "少糖"
    if (percentage <= 70) return "半糖"
    return "全糖"
  }

  return (
    <>
      {showBrandSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">选择奶茶</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowBrandSearch(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <BrandSearch
                onDrinkSelect={(product: MilkTeaProduct) => {
                  setSelectedDrink(product)
                  setDrinkName(product.name)
                  setShowBrandSearch(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">记录奶茶</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">奶茶名称</h3>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    isSupabaseConnected ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-gray-500">
                    {isSupabaseConnected ? '数据库已连接' : '本地模式'}
                  </span>
                </div>
              </div>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
                }`} />
                <Input
                  placeholder={isSupabaseConnected ? "搜索数据库中的奶茶..." : "输入奶茶名称..."}
                  value={drinkName}
                  onChange={(e) => setDrinkName(e.target.value)}
                  className="pl-10 border-mint/30"
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="text-yellow-800">
                    <span className="font-medium">热量参考:</span> {searchResults[0].calories}kcal ({searchResults[0].brand})
                  </p>
                  {searchResults.length > 1 && (
                    <p className="text-yellow-700 mt-1">
                      找到多个匹配结果，请从列表中选择具体的奶茶以获取准确热量
                    </p>
                  )}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto bg-white z-10">
                  {searchResults.map((drink) => (
                    <div
                      key={drink.id}
                      className="p-3 hover:bg-mint/10 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSelectDrink(drink)}
                    >
                      <div>
                        <p className="font-medium">{drink.name}</p>
                        <p className="text-xs text-gray-500">{drink.brand}</p>
                      </div>
                      <div className="font-bold text-mint-dark">{drink.calories}kcal</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Button
                onClick={() => setShowBrandSearch(true)}
                className="w-full border-mint/30 bg-transparent hover:bg-mint/5"
              >
                {selectedDrink || matchedDrink ? `已选择: ${selectedDrink?.name || matchedDrink?.name}` : "选择奶茶"}
              </Button>
            </div>

            {(selectedDrink || matchedDrink) && (
              <Card className="border-mint/20 bg-mint/5 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedDrink?.name || matchedDrink?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedDrink?.brand || matchedDrink?.brand}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-mint-dark">{calculateTotalCalories() || matchedDrink?.calories || 0}kcal</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(selectedDrink || matchedDrink) && (
              <div>
                <h3 className="font-medium mb-3 mt-6">选择杯型</h3>
                <CupSizeSelector
                  value={cupSize}
                  onChange={(size) => setCupSize(size)}
                />
              </div>
            )}

            {(selectedDrink || matchedDrink) && (
              <div>
                <h3 className="font-medium mb-3 mt-6">选择糖度</h3>
                <SugarLevelCalculator
                  value={sugarLevel}
                  onChange={(level) => setSugarLevel(level)}
                  cupSize={cupSize}
                />
              </div>
            )}

            <div>
              <h3 className="font-medium mb-3 mt-6">今天的心情</h3>
              <div className="grid grid-cols-4 gap-3">
                {moods.map((moodOption) => (
                  <button
                    key={moodOption.key}
                    onClick={() => setMood(moodOption.key)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      mood === moodOption.key ? "border-mint bg-mint/10" : "border-gray-200 hover:border-mint/50"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      {moodOption.icon}
                      <span className="text-xs font-medium">{moodOption.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">备注</h3>
              <Textarea
                placeholder="记录今天喝奶茶的感受或特殊情况..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-mint/30"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1 border-mint/30 bg-transparent">
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!drinkName.trim() && !selectedDrink && !matchedDrink}
                className="flex-1 bg-mint hover:bg-mint-dark text-white"
              >
                完成记录
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
