'use client'

import { useState } from 'react'
import { useDashboard } from '@/lib/dashboard-store'

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

export default function UsagePage() {
  const { state } = useDashboard()
  const [period, setPeriod] = useState('6months')

  const maxMonthly = Math.max(...state.monthlyData.map((d) => d.tokens), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">用量统计</h1>
          <p className="text-sm text-zinc-500 mt-1">API Token 使用统计和分析</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        >
          <option value="6months">最近 6 个月</option>
          <option value="12months">最近 12 个月</option>
          <option value="year">今年</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">月度 Token 用量</h3>
        <div className="flex items-end gap-6 h-40 px-4">
          {state.monthlyData.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-500">{fmtNum(m.tokens)}</span>
              <div
                className="w-full max-w-[48px] bg-zinc-900 rounded-t transition-all duration-500"
                style={{ height: `${(m.tokens / maxMonthly) * 100}%` }}
              />
              <span className="text-xs text-zinc-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">模型分布</h3>
          <div className="space-y-3">
            {state.modelUsage.map((m) => (
              <div key={m.model}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600">{m.model}</span>
                  <span className="text-zinc-400">{m.pct}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div
                    className="bg-zinc-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">每日明细</h3>
          <div className="space-y-2">
            {state.dailyData.map((d) => (
              <div key={d.label} className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs">
                <span className="text-zinc-600 font-medium">{d.label}</span>
                <span className="text-zinc-500">{fmtNum(d.tokens)} tokens</span>
                <span className="text-zinc-500">{fmtNum(d.calls)} 次</span>
                <span className="text-zinc-900">${d.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
