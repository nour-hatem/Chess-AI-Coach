import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chess Coach AI',
  description: 'Personal AI-powered chess game analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-bone font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
