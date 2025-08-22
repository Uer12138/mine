"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 检查是否已登录，如果已登录则跳转到dashboard
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      router.push("/dashboard")
    }
  }, [router])

  const handleGoToAuth = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8DADC] to-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">轻茶纪</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            你的健康奶茶顾问，也是懂你快乐的知己。科学拆解每一杯奶茶的热量，温柔引导健康选择。
          </p>
          <Button 
            onClick={handleGoToAuth}
            className="bg-[#A8DADC] hover:bg-[#96CED1] text-gray-800 text-lg px-8 py-6 rounded-full shadow-lg transition-all hover:scale-105"
          >
            开始我的奶茶健康之旅
          </Button>
        </div>

        {/* Main Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">为什么选择轻茶纪？</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden border-2 border-[#A8DADC] shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-[#A8DADC]/10 pb-2">
                <div className="text-4xl mb-2 text-center">🧮</div>
                <CardTitle className="text-xl text-center">精准热量计算</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600">
                  轻茶纪能精确计算各种奶茶的热量构成，包括基底茶、糖分、奶制品和各种配料，让你清楚了解每一口的热量来源。
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 border-[#A8DADC] shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-[#A8DADC]/10 pb-2">
                <div className="text-4xl mb-2 text-center">⭐</div>
                <CardTitle className="text-xl text-center">个性化推荐</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600">
                  基于你的身体数据、甜度偏好和常喝的奶茶品牌，轻茶纪会智能推荐更健康的奶茶选择，满足口味的同时兼顾健康。
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 border-[#A8DADC] shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-[#A8DADC]/10 pb-2">
                <div className="text-4xl mb-2 text-center">🎯</div>
                <CardTitle className="text-xl text-center">健康任务系统</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600">
                  轻茶纪提供循序渐进的健康任务，帮助你逐步改善奶茶消费习惯，实现健康与享受的平衡。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="flex flex-col md:flex-row items-center p-6 border-2 border-[#A8DADC] shadow-lg">
            <div className="text-5xl mr-4 mb-4 md:mb-0">📊</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">消费记录追踪</h3>
              <p className="text-gray-600">记录并分析你的奶茶消费习惯，查看热量摄入趋势，帮助你做出更明智的选择。</p>
            </div>
          </Card>

          <Card className="flex flex-col md:flex-row items-center p-6 border-2 border-[#A8DADC] shadow-lg">
            <div className="text-5xl mr-4 mb-4 md:mb-0">🏆</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">成就系统</h3>
              <p className="text-gray-600">完成健康目标获得成就徽章，让健康生活更有成就感和乐趣。</p>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">准备好开始你的健康奶茶之旅了吗？</h2>
          <Button 
            onClick={handleGoToAuth}
            className="bg-[#A8DADC] hover:bg-[#96CED1] text-gray-800 text-lg px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105"
          >
            立即加入轻茶纪
          </Button>
        </div>
      </div>
    </div>
  )
}
