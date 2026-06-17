'use client'
import type { ReactNode } from 'react'
import {
  PanelLeft,
  SquarePen,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Telescope,
  BadgeDollarSign,
  Settings,
  LifeBuoy,
  ChevronDown,
} from 'lucide-react'

// A faithful, static replica of the ChatGPT landing screen used as the front
// surface of the PII Shield demo. Brand/chrome copy is intentionally literal
// English (it mimics a real product UI), not routed through i18n.

function NavItem({
  Icon,
  label,
  active = false,
  onClick,
}: {
  Icon: typeof Search
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm ${
        active ? 'bg-slate-200/70 text-slate-900' : 'text-slate-700 hover:bg-slate-200/50'
      }`}
    >
      <Icon size={17} className="shrink-0 text-slate-500" />
      <span className="truncate">{label}</span>
    </button>
  )
}

export function ChatGptReplica({ children, onNewChat }: { children: ReactNode; onNewChat?: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-[40rem]">
        {/* ── ChatGPT sidebar ── */}
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-50 px-2.5 py-3 md:flex">
          <div className="mb-3 flex items-center justify-between px-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-xs font-bold">✺</div>
            <PanelLeft size={18} className="text-slate-400" />
          </div>
          <nav className="space-y-0.5">
            <NavItem Icon={SquarePen} label="New chat" active onClick={onNewChat} />
            <NavItem Icon={Search} label="Search chats" />
            <NavItem Icon={ImageIcon} label="Images" />
            <NavItem Icon={LayoutGrid} label="Apps" />
            <NavItem Icon={Telescope} label="Deep research" />
          </nav>

          <div className="mt-auto space-y-0.5 border-t border-slate-200 pt-3">
            <NavItem Icon={BadgeDollarSign} label="See plans and pricing" />
            <NavItem Icon={Settings} label="Settings" />
            <NavItem Icon={LifeBuoy} label="Help" />
            <div className="px-1.5 pt-3">
              <div className="text-sm font-semibold text-slate-800">Get responses tailored to you</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Log in to get answers based on saved chats, plus create images and upload files.
              </p>
            </div>
            <div className="px-1 pt-2">
              <button className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100">
                Log in
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main column ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between px-4 py-3">
            <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-base font-semibold text-slate-800 hover:bg-slate-100">
              ChatGPT <ChevronDown size={16} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <button className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800">
                Log in
              </button>
              <button className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100">
                Sign up for free
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4">{children}</div>

          <footer className="px-6 pb-4 pt-2 text-center text-xs text-slate-400">
            ChatGPT is AI. By using it, you agree to our <span className="underline">Terms</span> &{' '}
            <span className="underline">Privacy Policy</span>. Chats may be reviewed and used to improve our AI models.{' '}
            <span className="underline">Learn more</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
