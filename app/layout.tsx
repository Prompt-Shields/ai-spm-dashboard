import type { Metadata } from 'next'
import './globals.css'
import { DemoWrapper } from '@/components/demo-wrapper'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/sidebar-provider'
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
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              {/* min-w-0 lets the right pane shrink properly with table/SVG content inside. */}
              <div className="flex-1 flex flex-col min-w-0">
                <DemoWrapper />
                <main className="max-w-screen-xl w-full mx-auto px-4 md:px-6 py-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
