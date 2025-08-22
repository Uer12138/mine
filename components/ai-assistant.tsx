"use client"
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { MessageCircle, X, Send, Sparkles, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Message {
  type: "user" | "assistant"
  content: string
  showTaskLink?: boolean
  isStreaming?: boolean
}

const formatMessage = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>') // Code
    .replace(/\n/g, "<br>") // Line breaks
}

export const AiAssistant = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "assistant",
      content:
        "你好！我是小敖，你的奶茶健康管理伙伴 🌱 我会陪伴你一起面对关于奶茶的小纠结，帮你找到既开心又健康的平衡方式。有什么想聊的吗？",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentRequestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
      loadChatHistory(JSON.parse(user).id)
    }

    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadChatHistory = (userId: string) => {
    const savedHistory = localStorage.getItem(`chat_history_${userId}`)
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      if (history.length > 1) {
        setMessages([messages[0], ...history])
      }
    }
  }

  const saveChatHistory = (newMessages: Message[]) => {
    if (currentUser) {
      const historyToSave = newMessages.slice(1).filter((msg) => !msg.isStreaming)
      localStorage.setItem(`chat_history_${currentUser.id}`, JSON.stringify(historyToSave))
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    if (currentRequestRef.current) {
      currentRequestRef.current.abort()
    }

    const abortController = new AbortController()
    currentRequestRef.current = abortController

    const userMessage = inputValue
    const newMessages = [...messages, { type: "user" as const, content: userMessage }]
    setMessages(newMessages)
    setInputValue("")
    setIsTyping(true)

    const streamingMessage: Message = {
      type: "assistant",
      content: "",
      isStreaming: true,
    }
    setMessages([...newMessages, streamingMessage])

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

    try {
        // 检查用户是否已登录
        if (!currentUser) {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages]
            updatedMessages[updatedMessages.length - 1] = {
              type: "assistant",
              content: "请先登录后再使用AI助手功能哦～",
            }
            return updatedMessages
          })
          setIsTyping(false)
          return
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            userId: currentUser?.id,
            conversationHistory: messages.slice(-10),
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Chat API error:", response.status, errorText)
          throw new Error(`API error! status: ${response.status}, message: ${errorText}`)
        }

      reader = response.body?.getReader() || null
      if (!reader) {
        throw new Error("No reader available")
      }

      let accumulatedContent = ""

      while (true) {
        if (abortController.signal.aborted) {
          break
        }

        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulatedContent += data.content

                setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages]
                  const lastMessage = updatedMessages[updatedMessages.length - 1]
                  if (lastMessage && lastMessage.isStreaming) {
                    lastMessage.content = accumulatedContent
                  }
                  return updatedMessages
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      if (!abortController.signal.aborted) {
        const shouldShowTaskLink =
          accumulatedContent.includes("健康任务") ||
          accumulatedContent.includes("行动计划") ||
          accumulatedContent.includes("任务列表")

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          const lastMessage = updatedMessages[updatedMessages.length - 1]
          if (lastMessage && lastMessage.isStreaming) {
            lastMessage.isStreaming = false
            lastMessage.showTaskLink = shouldShowTaskLink
          }
          saveChatHistory(updatedMessages)
          return updatedMessages
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted")
        return
      }

      console.error("Chat error:", error)
      let errorMessage = "小敖现在有点忙，稍后再和你聊哦～"
      
      if (error instanceof Error) {
        // 网络错误
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "网络连接异常，请检查网络后重试"
        }
        // API认证错误
        else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorMessage = "AI服务认证失败，请联系管理员检查API配置"
        }
        // 请求频率限制
        else if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
          errorMessage = "请求过于频繁，请稍等片刻再试"
        }
        // 服务器错误
        else if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
          errorMessage = "AI服务暂时不可用，请稍后重试"
        }
        // 用户认证错误
        else if (error.message.includes("请先登录")) {
          errorMessage = error.message
        }
        // API配置错误
        else if (error.message.includes("API") && error.message.includes("key")) {
          errorMessage = "AI服务配置异常，请联系管理员"
        }
        // 其他错误
        else {
          errorMessage = `小敖遇到了问题: ${error.message.length > 50 ? error.message.substring(0, 50) + '...' : error.message}`
        }
      }
      
      // 记录详细错误信息用于调试
      console.error("Detailed error info:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = {
          type: "assistant",
          content: errorMessage,
        }
        return updatedMessages
      })
    } finally {
      if (reader) {
        try {
          reader.releaseLock()
        } catch (e) {
          // Reader might already be released
        }
      }

      if (currentRequestRef.current === abortController) {
        currentRequestRef.current = null
      }

      setIsTyping(false)
    }
  }

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question)
  }, [])

  const quickQuestions = useMemo(() => [
    "喝了全糖奶茶好有负罪感",
    "总是控制不住想喝奶茶",
    "想要健康但又舍不得美味",
    "如何坚持低卡奶茶计划？",
    "朋友约奶茶怎么办？",
    "减肥期间可以喝奶茶吗？",
  ], [])

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-mint hover:bg-mint-dark text-white shadow-lg transition-all duration-300 hover:scale-110"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Card className="border-mint/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-mint to-mint-dark text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                小敖 AI 伙伴
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                        message.type === "user"
                          ? "bg-mint text-white rounded-br-sm"
                          : "bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100"
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content),
                        }}
                        className="prose prose-sm max-w-none"
                      />

                      {message.isStreaming && <span className="inline-block w-2 h-4 bg-mint ml-1 animate-pulse"></span>}

                      {message.showTaskLink && message.type === "assistant" && !message.isStreaming && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <Link href="/health-tasks">
                            <Button size="sm" className="bg-mint hover:bg-mint-dark text-white text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              去健康任务页面
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && !messages.some((m) => m.isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 text-gray-800 rounded-lg rounded-bl-sm border border-gray-100 p-3 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-mint rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-mint rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-mint rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-gray-50/50">
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="和小敖聊聊你的想法..."
                    className="flex-1 border-mint/30 focus:border-mint"
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSend}
                    size="sm"
                    className="bg-mint hover:bg-mint-dark text-white"
                    disabled={isTyping || !inputValue.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    快速开始：
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs border-mint/30 text-mint hover:bg-mint/10 bg-white/80 transition-colors"
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isTyping}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
})
