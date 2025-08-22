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
  const [showBrandSearch, setShowBrandSearch] = useState(false)
  const [inputMode, setInputMode] = useState<'search' | 'custom'>('custom')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  // 初始化编辑模式的数据
  useEffect(() => {
    if (editingRecord) {
      setCustomName(editingRecord.drinkName || '')
      setCupSize(editingRecord.cupSize || 'medium')
      setSugarLevel(editingRecord.sugarLevel || 50)
      setMood(editingRecord.mood || '')
      setNotes(editingRecord.notes || '')
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
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const finalDrinkName = customName
      const estimatedCalories = 200 // 自定义奶茶默认200卡路里
      
      const recordData = {
        id: editingRecord?.id || Date.now().toString(),
        drinkName: finalDrinkName,
        brand: '自定义',
        calories: estimatedCalories,
        cupSize,
        sugarLevel: getSugarLevelName(sugarLevel),
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

      // 否则使用原有的保存逻辑
      // 尝试保存到数据库
      try {
        const userId = await getCurrentUserIdClient()
        const teaRecord = {
          user_id: userId,
          tea_product_id: undefined,
          custom_name: customName,
          tea_name: recordData.drinkName,
          size: cupSize,
          sweetness_level: recordData.sugarLevel,
          toppings: [],
          estimated_calories: recordData.calories,
          mood: mood || undefined,
          notes: notes || undefined,
          recorded_at: new Date().toISOString()
        }
        
        const savedRecord = await saveTeaRecord(teaRecord)
        if (savedRecord) {
          console.log('Record saved to database:', savedRecord)
          setSaveMessage('记录已成功保存到数据库！')
          setTimeout(() => {
            setIsSaving(false)
            onClose()
          }, 1500)
          return
        }
      } catch (error) {
        console.error('Failed to save to database, falling back to localStorage:', error)
        setSaveMessage('数据库保存失败，使用本地存储...')
      }
      
      // 如果数据库保存失败或未连接，使用localStorage
      const existingRecords = JSON.parse(localStorage.getItem('teaRecords') || '[]')
      let updatedRecords
      
      if (editingRecord) {
        // 编辑模式：更新现有记录
        updatedRecords = existingRecords.map((record: any) => 
          record.id === editingRecord.id ? recordData : record
        )
      } else {
        // 新增模式：添加新记录
        updatedRecords = [recordData, ...existingRecords]
      }
      
      localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
      
      setSaveMessage(editingRecord ? '记录已更新！' : '记录已保存到本地存储！')
      setTimeout(() => {
        setIsSaving(false)
        onClose()
      }, 1500)
      
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

            {selectedDrink && (
              <div>
                <h3 className="font-medium mb-3 mt-6">选择杯型</h3>
                <CupSizeSelector
                  value={cupSize}
                  onChange={(size) => setCupSize(size)}
                />
              </div>
            )}

            {selectedDrink && (
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
