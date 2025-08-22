"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, Database, HardDrive, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import RecordEntry from "@/components/record-entry"
import { getUserTeaRecords, checkTeaDatabaseConnection, deleteTeaRecord, TeaRecord } from '@/lib/tea-database'
import { getCurrentUserIdClient } from '@/lib/supabase'

export default function MyRecordsPage() {
  const router = useRouter()
  const [showRecordEntry, setShowRecordEntry] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [dataSource, setDataSource] = useState<'database' | 'localStorage'>('localStorage')
  const [editingRecord, setEditingRecord] = useState<any>(null)

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

  // 删除记录
  const handleDeleteRecord = async (recordId: string) => {
    try {
      // 从状态中移除记录
      const updatedRecords = records.filter(record => record.id !== recordId)
      setRecords(updatedRecords)

      // 更新本地存储
      localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
      // 清理旧的键名数据
      localStorage.removeItem('milkTeaRecords')

      // 如果连接到数据库，也需要从数据库中删除
      if (isSupabaseConnected) {
        try {
          const userId = await getCurrentUserIdClient()
          await deleteTeaRecord(recordId, userId)
        } catch (error) {
          console.error('删除数据库记录失败:', error)
        }
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

  // 检查数据库连接状态
  useEffect(() => {
    checkTeaDatabaseConnection().then(setIsSupabaseConnected)
  }, [])

  // 加载记录
  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      
      if (isSupabaseConnected) {
        // 尝试从数据库加载记录
        try {
          const userId = await getCurrentUserIdClient()
          const dbRecords = await getUserTeaRecords(userId)
          
          if (dbRecords.length > 0) {
            // 转换数据库记录格式以匹配现有UI
            const formattedRecords = dbRecords.map((record: TeaRecord) => ({
              id: record.id,
              drinkName: record.tea_name,
              brand: (record as any).tea_products?.brand || '未知品牌',
              calories: record.estimated_calories,
              cupSize: record.size,
              sugarLevel: record.sweetness_level,
              mood: record.mood,
              notes: record.notes,
              date: record.recorded_at.split('T')[0],
              timestamp: record.recorded_at
            }))
            
            setRecords(formattedRecords)
            setDataSource('database')
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Failed to load records from database:', error)
        }
      }
      
      // 如果数据库加载失败或未连接，从localStorage加载
      try {
        // 清理旧的键名数据
        localStorage.removeItem('milkTeaRecords')
        
        const savedRecords = localStorage.getItem('teaRecords')
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords))
          setDataSource('localStorage')
        }
      } catch (error) {
        console.error('Failed to load records from localStorage:', error)
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
            <Button onClick={() => setShowRecordEntry(true)} className="bg-mint hover:bg-mint-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              记录奶茶
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
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
                  <Button onClick={() => setShowRecordEntry(true)} className="bg-mint hover:bg-mint-dark text-white">
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
                            <div className="flex items-center mt-2 space-x-2">
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
          onSave={(updatedRecord) => {
            if (editingRecord) {
              // 更新现有记录
              const updatedRecords = records.map(record => 
                record.id === editingRecord.id ? { ...record, ...updatedRecord } : record
              )
              setRecords(updatedRecords)
              localStorage.setItem('teaRecords', JSON.stringify(updatedRecords))
            } else {
              // 添加新记录
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
          }}
        />
      )}
    </div>
  )
}
