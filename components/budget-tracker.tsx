"use client"

import { useState } from "react"
import { Target, AlertTriangle, Calendar, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function BudgetTracker() {
  return (
    <div className="space-y-6">
      {/* Calorie Information */}
      <Card className="border-mint/20 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Info className="w-5 h-5 text-blue-500 mr-2" />
            卡路里概念说明
          </CardTitle>
          <CardDescription>了解卡路里与健康的关系，帮助你做出更明智的奶茶选择</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>• 卡路里(kcal)是能量的单位，用于衡量食物提供的能量。当你摄入的卡路里超过身体消耗的量时，多余的能量会以脂肪的形式储存起来。</p>
          <p>• 普通成年人每天需要约2000-2500卡路里来维持基本生理功能和日常活动，具体需求因年龄、性别、体重和活动水平而异。</p>
          <p>• 奶茶的卡路里含量差异很大：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>1杯(500ml)无糖茶饮料：约50-100卡路里</li>
            <li>1杯(500ml)低糖奶茶：约200-300卡路里</li>
            <li>1杯(500ml)普通奶茶：约300-500卡路里</li>
            <li>1杯(500ml)加奶盖的奶茶：约500-700卡路里</li>
          </ul>
          <p>• 不同活动消耗300卡路里约需要：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>步行约60分钟（5公里/小时）</li>
            <li>跑步约20分钟（8公里/小时）</li>
            <li>跳绳约15分钟</li>
            <li>游泳约25分钟（自由泳）</li>
            <li>骑自行车约40分钟（15公里/小时）</li>
          </ul>
          <p>• 过量摄入卡路里会导致体重增加，建议每天奶茶摄入不超过当日热量的15%。例如，如果你每天需要2000卡路里，那么每天的奶茶热量最好控制在300卡路里以内。</p>
          <p>• 选择低卡配料可以有效控制奶茶的总热量：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>仙草、冻冻、椰果等配料热量较低（每100g约30-60kcal）</li>
            <li>珍珠、芋圆、红豆等淀粉类配料热量较高（每100g约150-250kcal）</li>
            <li>芝士奶盖、奶油等配料脂肪含量高，热量也较高（每100g约200-300kcal）</li>
          </ul>
          <p>• 糖度选择对热量的影响：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>全糖奶茶比无糖奶茶每杯多出约60-120kcal</li>
            <li>三分糖或五分糖是较好的选择，可以减少约40-80kcal热量</li>
            <li>选择代糖（如赤藓糖醇）可以在不影响口感的前提下降低热量</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
