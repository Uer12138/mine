"use client"

import { useState, useEffect } from "react"
import { X, Heart, Smile, Frown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import CupSizeSelector from './cup-size-selector'
import SugarLevelCalculator from './sugar-level-calculator'
import BrandSearch from './brand-search'
import { saveTeaRecord, TeaProduct } from '@/lib/tea-database'
import { getCurrentUserIdClient } from '@/lib/supabase'
import { addTeaRecord, updateTeaRecord } from '@/lib/user-data-sync'

interface RecordEntryProps {
  onClose: () => void
  editingRecord?: any
  onSave?: (record: any) => void
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

export default function RecordEntry({ onClose, editingRecord, onSave }: RecordEntryProps) {
  const [customName, setCustomName] = useState("")
  const [selectedDrink, setSelectedDrink] = useState<MilkTeaProduct | null>(null)
  const [cupSize, setCupSize] = useState<"small" | "medium" | "large">("medium")
  const [sugarLevel, setSugarLevel] = useState(50)
  const [mood, setMood] = useState("")
  const [notes, setNotes] = useState("")
  const [calories, setCalories] = useState<number | ''>(0)
  const [isManualCalories, setIsManualCalories] = useState(false)
  const [showBrandSearch, setShowBrandSearch] = useState(false)
  const [inputMode, setInputMode] = useState<'search' | 'custom'>('custom')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [selectedToppings, setSelectedToppings] = useState<{name: string, calories: number}[]>([])

  // 初始化编辑模式的数据
  useEffect(() => {
    if (editingRecord) {
      setCustomName(editingRecord.drinkName || '')
      setCupSize(editingRecord.cupSize || 'medium')
      setSugarLevel(editingRecord.sugarLevel || 50)
      setMood(editingRecord.mood || '')
      setNotes(editingRecord.notes || '')
      setCalories(editingRecord.calories || 0)
      setIsManualCalories(editingRecord.isManualCalories || false)
      setSelectedToppings(editingRecord.toppings || [])
    }
  }, [editingRecord])

  const moods = [
    { key: "happy", label: "开心", icon: <Heart className="w-5 h-5 text-red-500" /> },
    { key: "satisfied", label: "满足", icon: <Smile className="w-5 h-5 text-green-500" /> },
    { key: "neutral", label: "一般", icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { key: "disappointed", label: "失望", icon: <Frown className="w-5 h-5 text-gray-500" /> },
  ]



  const handleSelectDrink = (drink: MilkTeaProduct) => {
    setSelectedDrink(drink)
  }

  const calculateTotalCalories = () => {
    // 如果是手动输入模式，返回手动输入的卡路里
    if (isManualCalories) {
      return typeof calories === 'number' ? calories : 0
    }
    
    // 基础卡路里：如果选择了奶茶产品使用其卡路里，否则使用默认值
    let baseCalories = selectedDrink ? selectedDrink.calories : 200
    
    // 杯型系数
    const sizeMultiplier = {
      small: 0.8,
      medium: 1.0,
      large: 1.3
    }[cupSize] || 1.0
    
    // 糖度系数
    const sugarMultiplier = sugarLevel / 100
    
    // 计算基础卡路里（包含杯型和糖度影响）
    const drinkCalories = Math.round(baseCalories * sizeMultiplier * (0.7 + 0.3 * sugarMultiplier))
    
    // 计算小料卡路里
    const toppingsCalories = selectedToppings.reduce((sum: number, topping: any) => sum + topping.calories, 0)
    
    // 总卡路里
    const totalCalories = drinkCalories + toppingsCalories
    
    // 如果不是手动模式，自动更新calories状态
    if (!isManualCalories && calories !== totalCalories) {
      setCalories(totalCalories)
    }
    
    return totalCalories
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const finalDrinkName = customName
      const estimatedCalories = 200 // 自定义奶茶默认200卡路里
      
      const recordData = {
        id: editingRecord?.id || Date.now().toString(),
        drinkName: finalDrinkName,
        brand: selectedDrink?.brand || '自定义',
        calories: calculateTotalCalories(),
        isManualCalories,
        cupSize,
        sugarLevel: getSugarLevelName(sugarLevel),
        toppings: selectedToppings,
        mood,
        notes,
        date: editingRecord?.date || new Date().toISOString().split('T')[0],
        timestamp: editingRecord?.timestamp || new Date().toISOString()
      }

      // 如果有onSave回调，使用它来处理保存逻辑
      if (onSave) {
        onSave(recordData)
        setSaveMessage(editingRecord ? '记录已更新！' : '记录已保存！')
        setTimeout(() => {
          setIsSaving(false)
          onClose()
        }, 1500)
        return
      }

      // 否则使用新的数据同步逻辑
      const userId = await getCurrentUserIdClient()
      
      const teaRecordData = {
        user_id: userId,
        tea_product_id: null, // 手动记录不关联具体产品ID
        custom_name: selectedDrink ? undefined : customName,
        tea_name: recordData.drinkName,
        brand: recordData.brand,
        size: cupSize,
        sweetness_level: sugarLevel.toString(),
        toppings: selectedToppings.map((t: any) => t.name),
        estimated_calories: recordData.calories,
        mood: mood || undefined,
        notes: notes || undefined,
        recorded_at: new Date().toISOString()
      }
      
      try {
        const userId = await getCurrentUserIdClient()
        let result
        
        if (editingRecord) {
          // 更新现有记录
          result = await updateTeaRecord(editingRecord.id, userId, teaRecordData)
        } else {
          // 添加新记录
          result = await addTeaRecord(teaRecordData)
        }
        
        if (result.success) {
          setSaveMessage(editingRecord ? '记录已更新！' : '记录已成功保存！')
        } else {
          setSaveMessage(editingRecord ? '记录已更新到本地存储！' : '记录已保存到本地存储！')
        }
        
        setTimeout(() => {
          setIsSaving(false)
          onClose()
        }, 1500)
        
      } catch (error) {
        console.error('保存记录失败:', error)
        setSaveMessage('保存失败，请重试')
        setIsSaving(false)
      }
      
    } catch (error) {
      console.error('保存失败:', error)
      setSaveMessage('保存失败，请重试')
      setIsSaving(false)
    }
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
                  setCustomName(product.name)
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
              <div className="mb-3">
                <h3 className="font-medium">奶茶名称</h3>
              </div>
              <div className="space-y-4">
                {/* 自定义模式 */}
                <div>
                  <Input
                    placeholder="输入自定义奶茶名称（如：自制珍珠奶茶、星巴克焦糖玛奇朵等）"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    className="border-mint/30"
                    autoComplete="off"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    inputMode="text"
                    lang="zh-CN"
                  />
                </div>
              </div>


            </div>

            <div>
              <Button
                onClick={() => setShowBrandSearch(true)}
                className="w-full border-mint/30 bg-transparent hover:bg-mint/5"
              >
                {selectedDrink ? `已选择: ${selectedDrink?.name}` : "选择奶茶"}
              </Button>
            </div>

            {selectedDrink && (
              <Card className="border-mint/20 bg-mint/5 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedDrink.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedDrink.brand}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-mint-dark">{calculateTotalCalories() || 0}kcal</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="font-medium mb-3 mt-6">选择杯型</h3>
              <CupSizeSelector
                value={cupSize}
                onChange={(size) => setCupSize(size)}
              />
            </div>

            <div>
              <h3 className="font-medium mb-3 mt-6">选择糖度</h3>
              <SugarLevelCalculator
                value={sugarLevel}
                onChange={(level) => setSugarLevel(level)}
                cupSize={cupSize}
              />
            </div>

            <div>
              <h3 className="font-medium mb-3 mt-6">添加小料</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: '珍珠', calories: 50 },
                  { name: '椰果', calories: 30 },
                  { name: '布丁', calories: 80 },
                  { name: '红豆', calories: 60 },
                  { name: '仙草', calories: 20 },
                  { name: '芋圆', calories: 70 }
                ].map((topping) => (
                  <button
                    key={topping.name}
                    type="button"
                    onClick={() => {
                      const isSelected = selectedToppings.some(t => t.name === topping.name)
                      if (isSelected) {
                        setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name))
                      } else {
                        setSelectedToppings([...selectedToppings, topping])
                      }
                    }}
                    className={`p-2 rounded-lg border-2 text-sm transition-all ${
                      selectedToppings.some(t => t.name === topping.name)
                        ? "border-mint bg-mint/10 text-mint-dark"
                        : "border-gray-200 hover:border-mint/50"
                    }`}
                  >
                    {topping.name}
                    <div className="text-xs text-gray-500">+{topping.calories}kcal</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 mt-6">卡路里设置</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualCalories(false)
                      setCalories(calculateTotalCalories())
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      !isManualCalories 
                        ? "border-mint bg-mint/10 text-mint-dark" 
                        : "border-gray-200 hover:border-mint/50"
                    }`}
                  >
                    智能计算
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualCalories(true)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      isManualCalories 
                        ? "border-mint bg-mint/10 text-mint-dark" 
                        : "border-gray-200 hover:border-mint/50"
                    }`}
                  >
                    手动输入
                  </button>
                </div>
                
                {isManualCalories ? (
                  <div>
                    <Input
                      type="number"
                      placeholder="请输入卡路里数值"
                      value={calories}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value)
                        setCalories(value)
                      }}
                      className="border-mint/30"
                      min="0"
                      max="2000"
                    />
                    <p className="text-xs text-gray-500 mt-1">手动输入卡路里数值（0-2000 kcal）</p>
                  </div>
                ) : (
                  <div className="p-3 bg-mint/5 rounded-lg border border-mint/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">智能计算结果：</span>
                      <span className="font-bold text-mint-dark">{calculateTotalCalories()} kcal</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>基础奶茶（{cupSize === 'small' ? '小杯' : cupSize === 'medium' ? '中杯' : '大杯'}，{getSugarLevelName(sugarLevel)}）：</span>
                        <span>{Math.round((selectedDrink ? selectedDrink.calories : 200) * (cupSize === 'small' ? 0.8 : cupSize === 'large' ? 1.3 : 1.0) * (0.7 + 0.3 * sugarLevel / 100))} kcal</span>
                      </div>
                      {selectedToppings.length > 0 && (
                        <div className="flex justify-between">
                          <span>小料（{selectedToppings.map((t: any) => t.name).join('、')}）：</span>
                          <span>+{selectedToppings.reduce((sum: number, t: any) => sum + t.calories, 0)} kcal</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                disabled={isSaving || !customName.trim()}
                className="flex-1 bg-mint hover:bg-mint-dark text-white"
              >
                {isSaving ? '保存中...' : '完成记录'}
              </Button>
              
              {saveMessage && (
                <div className={`mt-2 p-2 rounded text-sm text-center ${
                  saveMessage.includes('失败') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
