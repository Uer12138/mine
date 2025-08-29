"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, Database, HardDrive, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import RecordEntry from "@/components/record-entry"
import BudgetManager from "@/components/budget-manager"
import { getUserTeaRecords, checkTeaDatabaseConnection, deleteTeaRecord, TeaRecord } from '@/lib/tea-database'
import { getCurrentUserIdClient } from '@/lib/supabase'
import { getTeaRecords, deleteTeaRecord as deleteTeaRecordSync, syncBudgetData, loadBudgetData, updateTeaRecord as updateTeaRecordSync, addTeaRecord } from '@/lib/user-data-sync'

export default function MyRecordsPage() {
  const router = useRouter()
  const [showRecordEntry, setShowRecordEntry] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [dataSource, setDataSource] = useState<'database' | 'localStorage'>('localStorage')
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [weeklyBudget, setWeeklyBudget] = useState(2000)

  // 辅助函数：格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 辅助函数：获取心情标签
  const getMoodLabel = (moodKey: string) => {
    const moods = {
      happy: '开心',
      relaxed: '放松',
      conflicted: '纠结',
      celebrating: '庆祝'
    }
    return moods[moodKey as keyof typeof moods] || moodKey
  }

  const getSugarLevelName = (level: number) => {
    if (level === 0) return '无'
    if (level <= 30) return '少'
    if (level <= 50) return '半'
    if (level <= 70) return '七分'
    return '全'
  }

  const handleBudgetChange = async (newBudget: number) => {
    setWeeklyBudget(newBudget)
    
    try {
      const userId = await getCurrentUserIdClient()
      if (userId) {
        await syncBudgetData(userId, newBudget)
      } else {
        // 如果没有用户ID，回退到本地存储
        localStorage.setItem('weeklyBudget', newBudget.toString())
      }
    } catch (error) {
      console.error('Failed to sync budget data:', error)
      // 如果同步失败，至少保存到本地
      localStorage.setItem('weeklyBudget', newBudget.toString())
    }
  }

  // 计算本周统计
  const getWeeklyStats = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // 本周开始（周日）
    startOfWeek.setHours(0, 0, 0, 0)
    
    const weeklyRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startOfWeek
    })
    
    const totalCups = weeklyRecords.length
    const totalCalories = weeklyRecords.reduce((sum, record) => {
      return sum + (record.calories || record.estimated_calories || 0)
    }, 0)
    
    return { totalCups, totalCalories }
  }

  const weeklyStats = getWeeklyStats()

  // 删除记录
  const handleDeleteRecord = async (recordId: string) => {
    try {
      const userId = await getCurrentUserIdClient()
      if (!userId) {
        alert('请先登录')
        return
      }
      
      // 使用新的数据同步模块删除记录
      const result = await deleteTeaRecordSync(recordId, userId)
      const success = result.success
      
      if (success) {
        // 从状态中移除记录
        const updatedRecords = records.filter(record => record.id !== recordId)
        setRecords(updatedRecords)
      } else {
        console.error('删除记录失败')
      }
    } catch (error) {
      console.error('删除记录失败:', error)
    }
  }

  // 编辑记录
  const handleEditRecord = (record: any) => {
    setEditingRecord(record)
    setShowRecordEntry(true)
  }

  // 检查数据库连接状态和加载预算设置
  useEffect(() => {
    checkTeaDatabaseConnection().then(setIsSupabaseConnected)
    
    // 加载预算设置
    const loadBudget = async () => {
      try {
        const userId = await getCurrentUserIdClient()
        if (userId) {
          const budget = await loadBudgetData(userId)
          setWeeklyBudget(budget)
        } else {
          // 如果没有用户ID，从本地存储加载
          const savedBudget = localStorage.getItem('weeklyBudget')
          if (savedBudget) {
            setWeeklyBudget(parseInt(savedBudget))
          }
        }
      } catch (error) {
        console.error('Failed to load budget:', error)
        // 如果加载失败，从本地存储加载
        const savedBudget = localStorage.getItem('weeklyBudget')
        if (savedBudget) {
          setWeeklyBudget(parseInt(savedBudget))
        }
      }
    }
    
    loadBudget()
  }, [])

  // 加载记录
  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      
      try {
        const userId = await getCurrentUserIdClient()
        if (!userId) {
          console.log('用户未登录，从localStorage加载记录')
          const localRecords = JSON.parse(localStorage.getItem('teaRecords') || '[]')
          setRecords(localRecords)
          return
        }
        
        const result = await getTeaRecords(userId)
        if (!result.success || !result.data) {
          console.error('获取记录失败:', result.error)
          return
        }
        
        // 转换记录格式以匹配现有UI
        const formattedRecords = result.data.map((record: any) => ({
          id: record.id,
          drinkName: record.tea_name || record.drinkName,
          brand: record.brand || '未知品牌',
          calories: record.estimated_calories || record.calories,
          cupSize: record.size || record.cupSize,
          sugarLevel: record.sweetness_level || record.sugarLevel,
          mood: record.mood,
          notes: record.notes,
          date: record.recorded_at ? record.recorded_at.split('T')[0] : record.date,
          timestamp: record.recorded_at || record.timestamp
        }))
        
        setRecords(formattedRecords)
        setDataSource(formattedRecords.length > 0 ? 'database' : 'localStorage')
        
      } catch (error) {
        console.error('Failed to load records:', error)
        setRecords([])
        setDataSource('localStorage')
      }
      
      setLoading(false)
    }

    loadRecords()
  }, [isSupabaseConnected])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                ← 返回首页
              </Button>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-mint" />
                <h1 className="text-xl font-bold text-gray-800">我的奶茶记录</h1>
              </div>
            </div>
            <Button onClick={() => setShowRecordEntry(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              记录奶茶
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
            {/* Budget Manager - 置顶显示 */}
        <div className="mb-6">
          <BudgetManager 
            weeklyBudget={weeklyBudget}
            weeklyCalories={weeklyStats.totalCalories}
            onBudgetChange={handleBudgetChange}
          />
        </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">记录历史</h2>
              </div>
            </div>

            {/* Recent Records */}
            {loading ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mint"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">暂无奶茶记录</p>
                  <Button onClick={() => setShowRecordEntry(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    立即记录
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {records
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((record) => (
                    <Card key={record.id} className="border-mint/20 hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => handleEditRecord(record)}>
                            <h4 className="font-semibold text-lg">{record.drinkName}</h4>
                            {record.brand && (
                              <p className="text-sm text-gray-500 mb-1">品牌: {record.brand}</p>
                            )}
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-mint-dark">
                                  {record.calories || 0} kcal
                                </span>
                                {record.isManualCalories && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">手动</span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{record.cupSize === 'small' ? '小杯' : record.cupSize === 'medium' ? '中杯' : '大杯'}</span>
                              <span className="text-sm text-gray-500">{record.sugarLevel}糖</span>
                              {record.mood && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                                  {getMoodLabel(record.mood)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right mr-2">
                              <p className="text-sm text-gray-500">
                                {formatDate(record.timestamp)}
                              </p>
                            </div>
                            <div className="flex space-x-1 opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditRecord(record)
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteRecord(record.id)
                                }}
                                className="h-8 w-8 p-1 hover:bg-red-100 rounded-md flex items-center justify-center cursor-pointer"
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded" onClick={() => handleEditRecord(record)}>
                            {record.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
        </div>
      </div>

      {/* Record Entry Modal */}
      {showRecordEntry && (
        <RecordEntry 
          onClose={() => {
            setShowRecordEntry(false)
            setEditingRecord(null)
          }}
          editingRecord={editingRecord}
          onSave={async (updatedRecord) => {
            try {
              const userId = await getCurrentUserIdClient()
              
              if (editingRecord) {
                // 更新现有记录 - 使用数据同步函数
                if (userId) {
                  const teaRecordData = {
                    user_id: userId,
                    tea_name: updatedRecord.drinkName,
                    brand: updatedRecord.brand,
                    size: updatedRecord.cupSize,
                    sweetness_level: updatedRecord.sugarLevel,
                    toppings: updatedRecord.toppings?.map((t: any) => t.name) || [],
                    estimated_calories: updatedRecord.calories,
                    mood: updatedRecord.mood,
                    notes: updatedRecord.notes,
                    recorded_at: updatedRecord.timestamp || new Date().toISOString()
                  }
                  
                  const result = await updateTeaRecordSync(editingRecord.id, userId, teaRecordData)
                  if (result.success) {
                    console.log('记录更新成功')
                  }
                }
                
                // 更新本地状态
                const updatedRecords = records.map(record => 
                  record.id === editingRecord.id ? { ...record, ...updatedRecord } : record
                )
                setRecords(updatedRecords)
                localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
              } else {
                // 添加新记录 - 使用数据同步函数
                const newRecord = {
                  ...updatedRecord,
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString()
                }
                
                if (userId) {
                  const teaRecordData = {
                    user_id: userId,
                    tea_name: updatedRecord.drinkName,
                    brand: updatedRecord.brand,
                    size: updatedRecord.cupSize,
                    sweetness_level: updatedRecord.sugarLevel,
                    toppings: updatedRecord.toppings?.map((t: any) => t.name) || [],
                    estimated_calories: updatedRecord.calories,
                    mood: updatedRecord.mood,
                    notes: updatedRecord.notes,
                    recorded_at: newRecord.timestamp
                  }
                  
                  const result = await addTeaRecord(teaRecordData)
                  if (result.success && result.data && result.data.id) {
                    // 使用数据库返回的ID更新记录
                    newRecord.id = result.data.id as string
                    console.log('记录保存到数据库成功')
                  }
                }
                
                // 更新本地状态
                const updatedRecords = [newRecord, ...records]
                setRecords(updatedRecords)
                localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
              }
              
              setShowRecordEntry(false)
              setEditingRecord(null)
            } catch (error) {
              console.error('保存记录失败:', error)
              // 即使数据库保存失败，也要更新本地状态
              if (editingRecord) {
                const updatedRecords = records.map(record => 
                  record.id === editingRecord.id ? { ...record, ...updatedRecord } : record
                )
                setRecords(updatedRecords)
                localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
              } else {
                const newRecord = {
                  ...updatedRecord,
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString()
                }
                const updatedRecords = [newRecord, ...records]
                setRecords(updatedRecords)
                localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
              }
              
              setShowRecordEntry(false)
              setEditingRecord(null)
            }
          }}
        />
      )}
    </div>
  )
}
