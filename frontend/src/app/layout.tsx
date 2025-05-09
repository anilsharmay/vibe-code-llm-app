import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DOS Chat',
  description: 'A DOS-style chat interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 