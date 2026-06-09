'use client'

import { useState } from 'react'
import { useDashboard } from '@/lib/dashboard-store'

type Tab = 'consumption' | 'recharge'

export default function BillingPage() {
  const { state } = useDashboard()
  const [tab, setTab] = useState<Tab>('consumption')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">账单</h1>
        <p className="text-sm text-zinc-500 mt-1">查看消费记录和充值记录</p>
      </div>

      <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit">
        {([
          ['consumption', '消费记录'],
          ['recharge', '充值记录'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'consumption' ? (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
                <th className="text-left py-3 px-5 font-medium">时间</th>
                <th className="text-left py-3 px-5 font-medium">模型</th>
                <th className="text-right py-3 px-5 font-medium">Tokens</th>
                <th className="text-right py-3 px-5 font-medium">费用</th>
                <th className="text-right py-3 px-5 font-medium">类型</th>
              </tr>
            </thead>
            <tbody>
              {state.billingRecords.map((r) => (
                <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="py-3 px-5 text-zinc-600">{r.date}</td>
                  <td className="py-3 px-5 text-zinc-900 font-medium">{r.model}</td>
                  <td className="py-3 px-5 text-right text-zinc-600">{r.tokens.toLocaleString()}</td>
                  <td className="py-3 px-5 text-right text-zinc-900">${r.cost.toFixed(2)}</td>
                  <td className="py-3 px-5 text-right text-zinc-500">{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
                <th className="text-left py-3 px-5 font-medium">日期</th>
                <th className="text-left py-3 px-5 font-medium">金额</th>
                <th className="text-left py-3 px-5 font-medium">支付方式</th>
                <th className="text-right py-3 px-5 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {state.rechargeRecords.map((r) => (
                <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="py-3 px-5 text-zinc-600">{r.date}</td>
                  <td className="py-3 px-5 text-zinc-900 font-semibold">${r.amount.toFixed(2)}</td>
                  <td className="py-3 px-5 text-zinc-600">{r.method}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded-full font-medium">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
