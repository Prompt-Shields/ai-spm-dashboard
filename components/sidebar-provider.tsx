'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

interface SidebarCtx {
  /** Desktop: is the sidebar collapsed to the icon rail? */
  collapsed: boolean
  /** Mobile (<md): is the off-canvas drawer open? */
  mobileOpen: boolean
  setCollapsed: (c: boolean) => void
  setMobileOpen: (o: boolean) => void
  toggleCollapsed: () => void
}

const Ctx = createContext<SidebarCtx | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Start expanded to avoid SSR/CSR hydration mismatch; the effect below
  // syncs from localStorage on mount.
  const [collapsed, setCollapsedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Read persisted collapse state on the client only.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') setCollapsedState(true)
    } catch {
      /* localStorage may be unavailable (e.g. third-party-cookie blocked) */
    }
  }, [])

  const setCollapsed = useCallback((c: boolean) => {
    setCollapsedState(c)
    try {
      window.localStorage.setItem(STORAGE_KEY, c ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{ collapsed, mobileOpen, setCollapsed, setMobileOpen, toggleCollapsed }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSidebar(): SidebarCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSidebar must be used within SidebarProvider')
  return v
}
