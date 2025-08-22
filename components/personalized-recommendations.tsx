"use client"

import { useState, useEffect } from "react"
import { Heart, Star, Coffee, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Recommendation {
  id: string
  name: string
  brand: string
  calories: number
  reason: string
  modifications: string[]
  originalCalories?: number
  category: "perfect" | "optimized" | "alternative"
  matchScore: number
}

interface PersonalizedRecommendationsProps {
  userPreferences?: {
    favoriteBrands: string[]
    minSweetness: number
    dislikedIngredients: string[]
    healthGoals: string[]
  }
}

export default function PersonalizedRecommendations({ userPreferences }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock user preferences if not provided
  const defaultPreferences = {
    favoriteBrands: ["喜茶", "奈雪"],
    minSweetness: 50,
    dislikedIngredients: ["珍珠"],
    healthGoals: ["控制热量摄入", "减少糖分"],
  }

  const prefs = userPreferences || defaultPreferences

  const generateRecommendations = () => {
    setIsLoading(true)

    // Mock recommendation generation based on user preferences
    setTimeout(() => {
      // 根据用户偏好品牌生成智能推荐
      // 添加随机化因子确保每次刷新都有不同结果
      const randomSeed = Math.random()
      const brandRecommendations: { [key: string]: Recommendation[] } = {
        "茶百道": [
          {
            id: "cbd1",
            name: "柠檬茶",
            brand: "茶百道",
            calories: 60,
            originalCalories: 180,
            reason: "酸甜柠檬，清香茶底，低糖配方",
            modifications: ["少糖", "多柠檬片"],
            category: "optimized",
            matchScore: 87
          },
          {
            id: "cbd2",
            name: "招牌奶茶",
            brand: "茶百道",
            calories: 180,
            originalCalories: 350,
            reason: "经典口味，植物奶替代，减少热量",
            modifications: ["植物奶", "半糖", "去小料"],
            category: "alternative",
            matchScore: 78
          },
          {
            id: "cbd3",
            name: "芋泥啵啵茶",
            brand: "茶百道",
            calories: 220,
            originalCalories: 380,
            reason: "香甜芋泥，Q弹珍珠，适量调整更健康",
            modifications: ["芋泥减半", "珍珠减量", "半糖"],
            category: "alternative",
            matchScore: 82
          },
          {
            id: "cbd4",
            name: "桂花乌龙茶",
            brand: "茶百道",
            calories: 35,
            reason: "桂花香气怡人，乌龙茶助消化，几乎零负担",
            modifications: ["微糖"],
            category: "perfect",
            matchScore: 91
          },
          {
            id: "cbd5",
            name: "草莓奶昔",
            brand: "茶百道",
            calories: 260,
            originalCalories: 420,
            reason: "新鲜草莓，低脂奶制作，维C丰富",
            modifications: ["低脂奶", "草莓果肉加量", "减糖"],
            category: "alternative",
            matchScore: 76
          }
        ],
        "奈雪": [
          {
            id: "nx1",
            name: "霸气系列 - 霸气橙子",
            brand: "奈雪",
            calories: 120,
            originalCalories: 280,
            reason: "新鲜橙肉富含维C，去糖减少热量负担",
            modifications: ["去糖", "多加橙肉", "少冰"],
            category: "optimized",
            matchScore: 88
          },
          {
            id: "nx2",
            name: "纯茶系列 - 金桂乌龙茶",
            brand: "奈雪",
            calories: 5,
            reason: "乌龙茶有助代谢，桂花香气怡人，几乎零热量",
            modifications: [],
            category: "perfect",
            matchScore: 96
          },
          {
            id: "nx3",
            name: "霸气系列 - 霸气葡萄",
            brand: "奈雪",
            calories: 140,
            originalCalories: 320,
            reason: "新鲜葡萄粒，抗氧化丰富，减糖更健康",
            modifications: ["半糖", "葡萄粒加量", "去冰"],
            category: "optimized",
            matchScore: 85
          },
          {
            id: "nx4",
            name: "芝士系列 - 芝士莓莓",
            brand: "奈雪",
            calories: 240,
            originalCalories: 450,
            reason: "新鲜草莓配轻芝士，蛋白质丰富",
            modifications: ["轻芝士", "草莓加量", "减糖"],
            category: "alternative",
            matchScore: 79
          },
          {
            id: "nx5",
            name: "纯茶系列 - 茉莉毛尖",
            brand: "奈雪",
            calories: 8,
            reason: "茉莉花香清雅，毛尖茶底清淡，几乎零热量",
            modifications: ["温饮"],
            category: "perfect",
            matchScore: 94
          },
          {
            id: "nx6",
            name: "奶茶系列 - 燕麦拿铁",
            brand: "奈雪",
            calories: 190,
            originalCalories: 340,
            reason: "燕麦奶替代，膳食纤维丰富，更健康",
            modifications: ["燕麦奶", "半糖", "去奶盖"],
            category: "optimized",
            matchScore: 83
          }
        ],
         "一点点": [
           {
             id: "ydd1",
             name: "四季春茶",
             brand: "一点点",
             calories: 25,
             reason: "经典茶底，微糖选择，清香回甘",
             modifications: ["微糖", "去冰"],
             category: "perfect",
             matchScore: 92
           },
           {
             id: "ydd2",
             name: "柠檬蜜茶",
             brand: "一点点",
             calories: 150,
             originalCalories: 280,
             reason: "天然柠檬片，蜂蜜代替糖浆更健康",
             modifications: ["蜂蜜减半", "多加柠檬", "去冰"],
             category: "optimized",
             matchScore: 80
           },
           {
             id: "ydd3",
             name: "红茶拿铁",
             brand: "一点点",
             calories: 200,
             originalCalories: 350,
             reason: "红茶香浓，低脂奶调制，口感顺滑",
             modifications: ["低脂奶", "半糖", "去奶盖"],
             category: "optimized",
             matchScore: 81
           },
           {
             id: "ydd4",
             name: "波霸奶茶",
             brand: "一点点",
             calories: 280,
             originalCalories: 480,
             reason: "经典波霸，适量调整珍珠和糖分",
             modifications: ["珍珠减半", "三分糖", "植物奶"],
             category: "alternative",
             matchScore: 75
           },
           {
             id: "ydd5",
             name: "冬瓜茶",
             brand: "一点点",
             calories: 90,
             originalCalories: 180,
             reason: "冬瓜清热解腻，天然甘甜，低卡选择",
             modifications: ["无糖", "多冰"],
             category: "optimized",
             matchScore: 86
           }
         ],
         "COCO都可": [
           {
             id: "coco1",
             name: "鲜柠檬绿茶",
             brand: "COCO都可",
             calories: 80,
             originalCalories: 200,
             reason: "绿茶抗氧化，新鲜柠檬维C丰富",
             modifications: ["半糖", "多加柠檬"],
             category: "optimized",
             matchScore: 85
           },
           {
             id: "coco2",
             name: "茉香奶茶",
             brand: "COCO都可",
             calories: 160,
             originalCalories: 320,
             reason: "茉莉花茶香气清雅，低脂奶减少负担",
             modifications: ["无糖", "低脂奶", "去珍珠"],
             category: "alternative",
             matchScore: 75
           },
           {
             id: "coco3",
             name: "双响炮",
             brand: "COCO都可",
             calories: 250,
             originalCalories: 420,
             reason: "经典双料组合，适量调整更健康",
             modifications: ["珍珠椰果各减半", "半糖", "低脂奶"],
             category: "alternative",
             matchScore: 77
           },
           {
             id: "coco4",
             name: "百香果绿茶",
             brand: "COCO都可",
             calories: 110,
             originalCalories: 250,
             reason: "百香果酸甜开胃，绿茶清香，维C丰富",
             modifications: ["果肉加量", "微糖", "去冰"],
             category: "optimized",
             matchScore: 84
           },
           {
             id: "coco5",
             name: "奶茶三兄弟",
             brand: "COCO都可",
             calories: 290,
             originalCalories: 500,
             reason: "三种配料丰富口感，调整配比更健康",
             modifications: ["配料各减量", "三分糖", "燕麦奶"],
             category: "alternative",
             matchScore: 73
           }
         ],
         "古茗": [
           {
             id: "gm1",
             name: "柠檬蜂蜜茶",
             brand: "古茗",
             calories: 100,
             originalCalories: 250,
             reason: "天然蜂蜜，新鲜柠檬，健康低卡",
             modifications: ["蜂蜜减量", "加柠檬片"],
             category: "optimized",
             matchScore: 83
           },
           {
             id: "gm2",
             name: "茉莉绿茶",
             brand: "古茗",
             calories: 10,
             reason: "纯茶无添加，茉莉花香清雅",
             modifications: [],
             category: "perfect",
             matchScore: 94
           },
           {
             id: "gm3",
             name: "芋泥波波奶茶",
             brand: "古茗",
             calories: 270,
             originalCalories: 450,
             reason: "香甜芋泥配Q弹波波，适量调整更健康",
             modifications: ["芋泥减量", "波波减半", "半糖"],
             category: "alternative",
             matchScore: 78
           },
           {
             id: "gm4",
             name: "水果茶",
             brand: "古茗",
             calories: 130,
             originalCalories: 280,
             reason: "多种新鲜水果，维生素丰富，天然甜味",
             modifications: ["果肉加量", "无糖", "多冰"],
             category: "optimized",
             matchScore: 87
           },
           {
             id: "gm5",
             name: "烧仙草奶茶",
             brand: "古茗",
             calories: 210,
             originalCalories: 380,
             reason: "烧仙草清热降火，搭配低脂奶更健康",
             modifications: ["烧仙草加量", "低脂奶", "三分糖"],
             category: "optimized",
             matchScore: 80
           }
         ],
         "沪上阿姨": [
           {
             id: "hsay1",
             name: "纤体瓶 - 柠檬茶",
             brand: "沪上阿姨",
             calories: 45,
             reason: "专为控卡设计，柠檬清香，热量极低",
             modifications: [],
             category: "perfect",
             matchScore: 96
           },
           {
             id: "hsay2",
             name: "纤体瓶 - 蜜桃乌龙",
             brand: "沪上阿姨",
             calories: 65,
             reason: "乌龙茶底助代谢，蜜桃香甜，低卡配方",
             modifications: [],
             category: "perfect",
             matchScore: 93
           },
           {
             id: "hsay3",
             name: "血糯米奶茶",
             brand: "沪上阿姨",
             calories: 230,
             originalCalories: 400,
             reason: "血糯米营养丰富，搭配燕麦奶更健康",
             modifications: ["血糯米适量", "燕麦奶", "半糖"],
             category: "alternative",
             matchScore: 81
           },
           {
             id: "hsay4",
             name: "现煮五谷茶",
             brand: "沪上阿姨",
             calories: 85,
             originalCalories: 180,
             reason: "五谷杂粮营养均衡，膳食纤维丰富",
             modifications: ["无糖", "温饮"],
             category: "optimized",
             matchScore: 89
           },
           {
             id: "hsay5",
             name: "手打柠檬茶",
             brand: "沪上阿姨",
             calories: 75,
             originalCalories: 160,
             reason: "手打新鲜柠檬，维C爆棚，酸甜开胃",
             modifications: ["柠檬加量", "微糖", "多冰"],
             category: "optimized",
             matchScore: 88
           },
           {
             id: "hsay6",
             name: "芋圆仙草奶茶",
             brand: "沪上阿姨",
             calories: 260,
             originalCalories: 450,
             reason: "Q弹芋圆配清热仙草，口感丰富",
             modifications: ["芋圆减量", "仙草加量", "低脂奶"],
             category: "alternative",
             matchScore: 76
           }
         ]
       }

       // 根据用户偏好品牌生成推荐
       let mockRecommendations: Recommendation[] = []
      
      if (prefs.favoriteBrands && prefs.favoriteBrands.length > 0) {
        prefs.favoriteBrands.forEach(brand => {
          if (brandRecommendations[brand]) {
            mockRecommendations.push(...brandRecommendations[brand])
          }
        })
      }

      // 如果没有选择品牌或推荐不足，添加通用推荐
      if (mockRecommendations.length < 3) {
        const generalRecs: Recommendation[] = [
          {
            id: "general1",
            name: "柠檬蜂蜜茶",
            brand: "通用推荐",
            calories: 120,
            originalCalories: 280,
            reason: "维生素C丰富，蜂蜜代替白糖更健康",
            modifications: ["减少蜂蜜用量", "添加柠檬片"],
            category: "optimized",
            matchScore: 85
          },
          {
            id: "general2",
            name: "无糖绿茶",
            brand: "通用推荐",
            calories: 0,
            reason: "纯茶底，零热量，抗氧化效果佳",
            modifications: [],
            category: "perfect",
            matchScore: 95
          },
          {
            id: "general3",
            name: "薄荷柠檬茶",
            brand: "通用推荐",
            calories: 45,
            reason: "清新薄荷，提神醒脑，低热量选择",
            modifications: ["无糖", "多冰"],
            category: "perfect",
            matchScore: 90
          },
          {
            id: "general4",
            name: "玫瑰花茶",
            brand: "通用推荐",
            calories: 15,
            reason: "美容养颜，舒缓情绪，几乎零热量",
            modifications: ["温热饮用"],
            category: "perfect",
            matchScore: 88
          },
          {
            id: "general5",
            name: "抹茶拿铁",
            brand: "通用推荐",
            calories: 180,
            originalCalories: 320,
            reason: "抹茶抗氧化，燕麦奶替代更健康",
            modifications: ["燕麦奶", "半糖", "去奶盖"],
            category: "optimized",
            matchScore: 82
          },
          {
            id: "general6",
            name: "红豆奶茶",
            brand: "通用推荐",
            calories: 240,
            originalCalories: 420,
            reason: "红豆富含蛋白质，适量调整更健康",
            modifications: ["红豆减量", "低脂奶", "三分糖"],
            category: "alternative",
            matchScore: 79
          },
          {
            id: "general7",
            name: "椰汁西米露",
            brand: "通用推荐",
            calories: 200,
            originalCalories: 350,
            reason: "椰汁天然香甜，西米Q弹，热带风味",
            modifications: ["椰汁减量", "西米适量", "无糖"],
            category: "optimized",
            matchScore: 80
          },
          {
            id: "general8",
            name: "黑糖珍珠奶茶",
            brand: "通用推荐",
            calories: 290,
            originalCalories: 500,
            reason: "经典黑糖风味，适量调整珍珠和糖分",
            modifications: ["珍珠减半", "黑糖减量", "植物奶"],
            category: "alternative",
            matchScore: 74
          },
          {
            id: "general9",
            name: "水果气泡茶",
            brand: "通用推荐",
            calories: 95,
            originalCalories: 200,
            reason: "气泡清爽，水果维生素丰富，低卡选择",
            modifications: ["果肉加量", "无糖", "多气泡"],
            category: "optimized",
            matchScore: 86
          },
          {
            id: "general10",
            name: "燕麦奶咖啡",
            brand: "通用推荐",
            calories: 150,
            originalCalories: 280,
            reason: "燕麦奶膳食纤维丰富，咖啡提神醒脑",
            modifications: ["燕麦奶", "无糖", "去奶泡"],
            category: "optimized",
            matchScore: 83
          }
        ]
        mockRecommendations.push(...generalRecs)
      }

      // 随机打乱推荐顺序，确保每次刷新都不同
      const shuffleArray = (array: Recommendation[]) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }

      const shuffledRecommendations = shuffleArray(mockRecommendations)
      setRecommendations(shuffledRecommendations.slice(0, 2)) // 最多返回2个推荐
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    generateRecommendations()
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "perfect":
        return "bg-green-100 text-green-800"
      case "optimized":
        return "bg-blue-100 text-blue-800"
      case "alternative":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "perfect":
        return "完美匹配"
      case "optimized":
        return "优化推荐"
      case "alternative":
        return "替代方案"
      default:
        return ""
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "perfect":
        return <Star className="w-4 h-4" />
      case "optimized":
        return <Zap className="w-4 h-4" />
      case "alternative":
        return <Coffee className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Heart className="w-6 h-6 text-mint mr-2" />
            为你推荐
          </h2>
          <p className="text-gray-600 mt-1">基于你的偏好和健康目标的个性化推荐</p>
        </div>
        <Button
          onClick={generateRecommendations}
          disabled={isLoading}
          variant="outline"
          className="border-mint/30 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          刷新推荐
        </Button>
      </div>

      {/* User Preferences Summary */}
      <Card className="border-mint/20 bg-mint/5">
        <CardHeader>
          <CardTitle className="text-lg">你的偏好设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">常喝品牌：</span>
              {prefs.favoriteBrands.join("、")}
            </div>
            <div>
              <span className="font-medium">最低甜度：</span>
              {prefs.minSweetness <= 30 ? "三分糖" : prefs.minSweetness <= 50 ? "五分糖" : "七分糖"}
            </div>
            <div>
              <span className="font-medium">不喜配料：</span>
              {prefs.dislikedIngredients.join("、") || "无"}
            </div>
            <div>
              <span className="font-medium">健康目标：</span>
              {prefs.healthGoals.join("、")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border-mint/20 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    {getCategoryIcon(rec.category)}
                    <span className="ml-2">{rec.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{rec.brand}</Badge>
                    <Badge className={getCategoryColor(rec.category)}>{getCategoryLabel(rec.category)}</Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-mint-dark">{rec.calories}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                  {rec.originalCalories && (
                    <div className="text-xs text-gray-400 line-through">{rec.originalCalories}kcal</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-mint/10 p-3 rounded-lg">
                <p className="text-sm text-mint-dark">💡 {rec.reason}</p>
              </div>

              {rec.modifications.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">优化建议：</h4>
                  <div className="space-y-1">
                    {rec.modifications.map((mod, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded flex items-center">
                        <Zap className="w-3 h-3 text-green-600 mr-1" />
                        {mod}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium ml-1">匹配度 {rec.matchScore}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-mint animate-spin mx-auto mb-4" />
          <p className="text-gray-500">正在为你生成个性化推荐...</p>
        </div>
      )}
    </div>
  )
}
