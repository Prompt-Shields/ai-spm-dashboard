import type { Metadata } from 'next'
import './globals.css'
import { DemoWrapper } from '@/components/demo-wrapper'

export const metadata: Metadata = {
  title: 'AIMaps — AI Use Case Governance',
  description: 'Map your organisation\'s AI use cases to risks, owners, and compliance frameworks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <DemoWrapper />
        <main className="max-w-screen-xl mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
