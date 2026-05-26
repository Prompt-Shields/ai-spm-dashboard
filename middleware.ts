import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_COOKIE } from '@/lib/i18n/config'
import { resolveLocale } from '@/lib/i18n/resolve'

export function middleware(request: NextRequest) {
  const locale = resolveLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    country: request.headers.get('x-vercel-ip-country'),
    acceptLanguage: request.headers.get('accept-language'),
  })

  // Set on the request too (not just the response) so cookies() sees the
  // resolved locale during THIS request's server render (first visit).
  request.cookies.set(LOCALE_COOKIE, locale)
  const res = NextResponse.next({ request: { headers: request.headers } })
  res.cookies.set(LOCALE_COOKIE, locale, { maxAge: 31536000, sameSite: 'lax', path: '/' })
  return res
}

export const config = {
  // Run on pages; skip static assets and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
