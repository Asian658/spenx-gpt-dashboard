'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  BarChart3,
  Cpu,
  Wallet,
  Receipt,
  Key,
  Settings,
  Users,
  Shield,
  LogOut,
  Play,
  Pause,
} from 'lucide-react'
import { DashboardProvider, useDashboard } from '@/lib/dashboard-store'

const navItems = [
  { href: '/dashboard', label: '概览', icon: LayoutDashboard },
  { href: '/dashboard/usage', label: '用量统计', icon: BarChart3 },
  { href: '/dashboard/models', label: '模型广场', icon: Cpu },
  { href: '/dashboard/wallet', label: '钱包', icon: Wallet },
  { href: '/dashboard/billing', label: '账单', icon: Receipt },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/settings', label: '设置', icon: Settings },
  { href: '/dashboard/users', label: '用户管理', icon: Users },
  { href: '/dashboard/admin', label: '参数管理', icon: Shield },
]

function RealtimeToggle() {
  const { state, dispatch } = useDashboard()

  return (
    <div className="px-3 py-2">
      <button
        onClick={() => dispatch({ type: 'TOGGLE_REALTIME' })}
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          state.isRealTimeActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700'
        }`}
      >
        <div className="relative">
          <Shield className="w-4 h-4 shrink-0" />
          {state.isRealTimeActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          )}
        </div>
        <span className="flex-1 text-left">实时保护功能</span>
        {state.isRealTimeActive ? (
          <Pause className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Play className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>
      {state.isRealTimeActive && (
        <div className="mt-1.5 px-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-medium">
              运行中 · {state.tickCount} 次
            </span>
            <span className="text-zinc-400">
              余额 ${state.balance.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!document.cookie.includes('token=demo')) {
      router.push('/login')
    }
  }, [router])

  function handleLogout() {
    document.cookie = 'token=;path=/;max-age=0'
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-zinc-50">
      <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-zinc-100">
          <h1 className="text-lg font-bold text-zinc-900">spenx GPT</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <RealtimeToggle />

        <div className="p-3 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
