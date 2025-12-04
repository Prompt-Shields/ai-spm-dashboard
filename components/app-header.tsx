"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield, Database } from "lucide-react"

export function AppHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Overview", icon: null },
    { href: "/ai-spm", label: "AI-SPM (Security)", icon: Shield },
    { href: "/asset-management", label: "AI Asset Management", icon: Database },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-8 max-w-[1600px] mx-auto">
        <div className="mr-8 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">AI Governance Control Centre</span>
        </div>
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
