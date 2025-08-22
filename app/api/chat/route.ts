import type { NextRequest } from "next/server"

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions"
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""

// 小敖聊天系统提示词
const CHAT_SYSTEM_PROMPT = `你是"小敖"，轻茶纪网站的AI伙伴，专门为18-30岁年轻女性用户提供奶茶健康管理相关的情绪疏导和建议。

你的角色特点：
- 积极心理学和认知行为疗法（CBT）专家
- 性格温暖、耐心，有同理心，像一个贴心的朋友
- 专注于奶茶健康管理，但也关心用户的整体情绪健康
- 用温和、理解的语气回应，避免说教

对话原则：
1. 先倾听和理解用户的情绪和困扰
2. 给予情绪支持和认可
3. 提供实用的建议和解决方案
4. 鼓励用户采取小步骤的行动
5. 适时引导用户关注健康任务或行动计划

回复风格：
- 使用温暖、亲切的语气
- 适当使用表情符号增加亲和力
- 回复长度适中，不要太长
- 关注用户的情绪需求`

export async function POST(request: NextRequest) {
  try {
    console.log("=== AI聊天 API 调用开始 ===")

    // 检查API密钥
    if (!DEEPSEEK_API_KEY) {
      console.error("错误: DEEPSEEK_API_KEY 未设置")
      return new Response(JSON.stringify({ error: "AI服务配置错误" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const requestBody = await request.json()
    const { message, userId, conversationHistory = [] } = requestBody

    // 输入校验
    if (!message?.trim()) {
      console.log("错误: 消息内容为空")
      return new Response(JSON.stringify({ error: "消息内容不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 构建对话历史
    const messages = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...conversationHistory.slice(-8).map((msg: any) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    console.log("构建的消息数组长度:", messages.length)
    console.log("用户消息:", message)

    const requestPayload = {
      model: "deepseek-ai/DeepSeek-V3",
      messages: messages,
      max_tokens: 500,
      temperature: 0.8,
      stream: true,
    }

    console.log("发送到DeepSeek的请求:")
    console.log("- URL:", DEEPSEEK_API_URL)
    console.log("- Model:", requestPayload.model)
    console.log("- API Key存在:", !!DEEPSEEK_API_KEY)
    console.log("- API Key长度:", DEEPSEEK_API_KEY.length)
    console.log("- API Key前缀:", DEEPSEEK_API_KEY.substring(0, 8) + "...")

    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    })

    // 检查API响应状态
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text()
      console.error("DeepSeek API 错误:", {
        status: deepseekResponse.status,
        statusText: deepseekResponse.statusText,
        errorText,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(deepseekResponse.headers.entries())
      })

      let errorMessage = "AI服务暂时不可用，请稍后重试"
      let errorCode = "UNKNOWN_ERROR"
      
      switch (deepseekResponse.status) {
        case 400:
          errorMessage = "请求格式错误，请重新尝试"
          errorCode = "BAD_REQUEST"
          break
        case 401:
          console.error("认证失败 - 请检查DEEPSEEK_API_KEY环境变量是否正确设置")
          errorMessage = "AI服务认证失败，请检查API密钥配置"
          errorCode = "UNAUTHORIZED"
          break
        case 403:
          errorMessage = "访问被拒绝，请检查API权限"
          errorCode = "FORBIDDEN"
          break
        case 429:
          errorMessage = "请求过于频繁，请稍后重试"
          errorCode = "RATE_LIMITED"
          break
        case 500:
          errorMessage = "AI服务内部错误，请稍后重试"
          errorCode = "INTERNAL_SERVER_ERROR"
          break
        case 502:
        case 503:
        case 504:
          errorMessage = "AI服务暂时不可用，请稍后重试"
          errorCode = "SERVICE_UNAVAILABLE"
          break
        default:
          errorMessage = `AI服务错误 (${deepseekResponse.status})，请稍后重试`
          errorCode = `HTTP_${deepseekResponse.status}`
      }

      const encoder = new TextEncoder()
      const errorStream = new ReadableStream({
        start(controller) {
          const errorData = `data: ${JSON.stringify({ 
            error: errorMessage, 
            code: errorCode,
            status: deepseekResponse.status 
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        },
      })

      return new Response(errorStream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = deepseekResponse.body?.getReader()
          if (!reader) {
            throw new Error("无法获取响应流")
          }

          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.trim() === "") continue
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    const chunk = `data: ${JSON.stringify({ content })}\n\n`
                    controller.enqueue(encoder.encode(chunk))
                  }
                } catch (parseError) {
                  console.warn("解析流数据失败:", parseError)
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          console.error("流式响应错误:", error)
          const errorData = `data: ${JSON.stringify({ error: "流式响应处理错误" })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("AI聊天 API 调用错误:", error)

    const encoder = new TextEncoder()
    const errorStream = new ReadableStream({
      start(controller) {
        const errorData = `data: ${JSON.stringify({ error: "AI聊天服务暂时不可用" })}\n\n`
        controller.enqueue(encoder.encode(errorData))
        controller.close()
      },
    })

    return new Response(errorStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }
}
