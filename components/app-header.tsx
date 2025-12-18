"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield, Brain, LayoutDashboard, Eye } from "lucide-react"

export function AppHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/ai-governance", label: "AI Governance", icon: Shield },
    { href: "/ai-visibility", label: "AI Visibility", icon: Eye },
    { href: "/model-risk", label: "Model Risk", icon: Brain },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-14 items-center px-6 max-w-[1400px] mx-auto">
        <Link href="/" className="mr-8 flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">AI Governance</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
