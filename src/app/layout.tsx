import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CAMBOT ANNOTATE · 球赛高光标注系统',
  description: '专业球赛视频高光时刻标注工具',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
