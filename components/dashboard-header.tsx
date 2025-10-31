import { Bell, Download, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

export function DashboardHeader() {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-10">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-4RfIBiQHygOHhOOA6a7WIu3XjbYUMj.png"
                  alt="Prompt Shields Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2A2A2A]">Prompt Shields</h1>
                <p className="text-sm font-medium text-gray-600">AI Security Posture Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Bell className="h-5 w-5 text-[#2A2A2A]" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Download className="h-5 w-5 text-[#2A2A2A]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export PDF Report</DropdownMenuItem>
                <DropdownMenuItem>Export CSV Data</DropdownMenuItem>
                <DropdownMenuItem>Weekly Digest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Settings className="h-5 w-5 text-[#2A2A2A]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
