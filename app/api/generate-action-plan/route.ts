import { type NextRequest, NextResponse } from "next/server"

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions"
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""

// 小敖生成行动计划的系统提示词
const ACTION_PLAN_SYSTEM_PROMPT = `你是"小敖"，轻茶纪网站的AI伙伴，专门为18-30岁年轻女性用户提供奶茶健康管理相关的行动建议。

你的任务是根据用户的挑战目标，生成3-5个具体可执行的行动项。

你的角色特点：
- 积极心理学和认知行为疗法（CBT）专家
- 性格温暖、耐心，有同理心
- 专注于奶茶健康管理

行动计划生成原则：
1. 先认可用户的挑战目标，表达理解和支持
2. 识别可能的困难和拖延原因
3. 将大目标拆解成3-5个���体的小行动
4. 每个行动项要具体、可衡量、容易执行
5. 按优先级排序（high/medium/low）

请严格按照以下JSON格式返回，不要包含任何其他文字：
{
  "actionItems": [
    {
      "id": "action-1",
      "title": "行动项标题",
      "description": "详细描述这个行动项的具体做法和预期效果",
      "priority": "high"
    }
  ]
}

优先级说明：
- high: 最重要的基础行动，必须先完成
- medium: 重要的进阶行动，在基础行动后执行
- low: 建议的补充行动，有助于长期坚持`

export async function POST(request: NextRequest) {
  try {
    console.log("=== 生成行动计划 API 调用开始 ===")
    console.log("时间:", new Date().toISOString())

    const requestBody = await request.json()
    const { challenge, userId } = requestBody

    console.log("请求参数:")
    console.log("- 挑战标题:", challenge?.title)
    console.log("- 挑战描述:", challenge?.description)
    console.log("- 用户备注:", challenge?.notes)
    console.log("- 用户ID:", userId)

    if (!challenge?.title) {
      console.log("错误: 挑战信息不完整")
      return NextResponse.json({ error: "挑战信息不完整" }, { status: 400 })
    }

    // 构建用户提示词
    let userPrompt = `用户的挑战目标：${challenge.title}`
    if (challenge.description) {
      userPrompt += `\n详细描述：${challenge.description}`
    }
    if (challenge.notes) {
      userPrompt += `\n个人备注：${challenge.notes}`
    }
    userPrompt += `\n\n请为这个挑战生成3-5个具体可执行的行动项，帮助用户逐步实现目标。`

    const messages = [
      { role: "system", content: ACTION_PLAN_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]

    console.log("构建的消息数组长度:", messages.length)

    const requestPayload = {
      model: "deepseek-ai/DeepSeek-V3",
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
      stream: true,
    }

    console.log("发送到DeepSeek的请求:")
    console.log("- URL:", DEEPSEEK_API_URL)
    console.log("- Model:", requestPayload.model)

    // 调用DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    })

    console.log("DeepSeek API 响应状态:", response.status)

    if (!response.ok) {
      let errorText = ""
      try {
        errorText = await response.text()
        console.log("错误响应内容:", errorText)
      } catch (e) {
        console.log("无法读取��误响应内容:", e)
      }

      return NextResponse.json({ error: "AI服务暂时不可用，请稍后重试" }, { status: 500 })
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No reader available from response")
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullContent = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  // 处理完整的响应内容
                  console.log("AI完整响应:", fullContent)

                  try {
                    // 尝试解析JSON
                    const jsonMatch = fullContent.match(/\{[\s\S]*\}/)
                    if (jsonMatch) {
                      const actionPlan = JSON.parse(jsonMatch[0])
                      console.log("解析的行动计划:", actionPlan)

                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(actionPlan)}\n\n`))
                    } else {
                      // 如果无法解析JSON，提供备用计划
                      console.log("无法解析JSON，使用备用计划")
                      const fallbackPlan = {
                        actionItems: [
                          {
                            id: "action-1",
                            title: "记录当前习惯",
                            description: "连续3天记录你的奶茶消费情况，了解现状是改变的第一步",
                            priority: "high",
                          },
                          {
                            id: "action-2",
                            title: "设定小目标",
                            description: "从你的挑战中选择一个最容易实现的小改变开始",
                            priority: "medium",
                          },
                          {
                            id: "action-3",
                            title: "寻找支持",
                            description: "告诉朋友你的目标，获得他们的理解和支持",
                            priority: "low",
                          },
                        ],
                      }

                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallbackPlan)}\n\n`))
                    }
                  } catch (parseError) {
                    console.error("解析响应失败:", parseError)
                    // 提供备用计划
                    const fallbackPlan = {
                      actionItems: [
                        {
                          id: "action-1",
                          title: "开始记录",
                          description: "记录你的奶茶消费习惯，这是制定计划的基础",
                          priority: "high",
                        },
                        {
                          id: "action-2",
                          title: "小步改变",
                          description: "选择一个小的改变开始，比如减少一点糖分",
                          priority: "medium",
                        },
                      ],
                    }

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallbackPlan)}\n\n`))
                  }

                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    fullContent += content
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("流式处理错误:", error)
          controller.close()
        }
      },
    })

    console.log("返回流式响应")
    console.log("=== 生成行动计划 API 调用结束 ===")

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("=== 生成行动计划 API 发生异常 ===")
    console.error("错误:", error)

    return NextResponse.json({ error: "生成行动计划失败，请稍后重试" }, { status: 500 })
  }
}
