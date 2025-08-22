import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans_SC } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-sc",
})

export const metadata: Metadata = {
  title: "轻茶纪 TeaCal - 你的健康奶茶顾问",
  description: "科学拆解奶茶热量，温柔引导健康选择。帮你在享受奶茶的同时轻松掌控热量摄入，找到喝得开心又无负担的平衡。",
  keywords: "奶茶热量,健康奶茶,热量计算,奶茶配料,健康管理",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable} antialiased`}>
      <body className="font-sans bg-cream text-gray-800">{children}</body>
    </html>
  )
}
