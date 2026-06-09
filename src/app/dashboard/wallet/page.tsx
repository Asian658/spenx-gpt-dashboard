'use client'

import { useState } from 'react'
import { Plus, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useDashboard } from '@/lib/dashboard-store'

export default function WalletPage() {
  const { state, dispatch } = useDashboard()
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('支付宝')

  const monthlySpend = state.transactions
    .filter((tx) => tx.type === '消费')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  function handleRecharge() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    dispatch({ type: 'ADD_RECHARGE', amount: amt, method })
    setAmount('')
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">钱包</h1>
          <p className="text-sm text-zinc-500 mt-1">管理余额和支付方式</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          充值
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">账户充值</h3>
          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="充值金额"
              className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            >
              <option>支付宝</option>
              <option>微信支付</option>
              <option>银行转账</option>
              <option>PayPal</option>
            </select>
            <button
              onClick={handleRecharge}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
            >
              确认充值
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm hover:bg-zinc-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-zinc-200 p-5">
          <div className="text-xs text-zinc-500 mb-1">当前余额</div>
          <div className="text-3xl font-bold text-zinc-900">${state.balance.toFixed(2)}</div>
          <div className="text-xs text-zinc-400 mt-1">≈ ¥{(state.balance * 7.2).toFixed(2)} CNY</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="text-xs text-zinc-500 mb-1">本月消费</div>
          <div className="text-3xl font-bold text-zinc-900">${monthlySpend.toFixed(2)}</div>
          <div className="text-xs text-zinc-400 mt-1">{state.transactions.filter((tx) => tx.type === '消费').length} 笔交易</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">支付方式</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-900">Visa •••• 8892</div>
              <div className="text-xs text-zinc-500">到期 12/27</div>
            </div>
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full font-medium">默认</span>
          </div>
          <button className="w-full py-2.5 border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors">
            + 添加支付方式
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">交易记录</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {state.transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  {tx.type === '充值' ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900">{tx.desc}</div>
                  <div className="text-xs text-zinc-400">{tx.date}</div>
                </div>
              </div>
              <span className={`text-sm font-semibold ${tx.type === '充值' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                {tx.type === '充值' ? '+' : ''}{tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
