import type { Metadata } from 'next'
import './globals.css'
import { DemoWrapper } from '@/components/demo-wrapper'
import { getLocale, getMessages, getT } from '@/lib/i18n/server'
import { LocaleProvider } from '@/lib/i18n/provider'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: t('common.metaTitle'),
    description: t('common.metaDescription'),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return (
    <html lang={locale}>
      <body className="bg-slate-50 min-h-screen">
        <LocaleProvider locale={locale} messages={messages}>
          <DemoWrapper />
          <main className="max-w-screen-xl mx-auto px-6 py-6">
            {children}
          </main>
        </LocaleProvider>
      </body>
    </html>
  )
}
