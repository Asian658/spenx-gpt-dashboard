'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [monthlyLimit, setMonthlyLimit] = useState('1000000')
  const [alertThreshold, setAlertThreshold] = useState('80')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">设置</h1>
        <p className="text-sm text-zinc-500 mt-1">管理你的账户和 API 设置</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
          <h3 className="font-semibold text-zinc-900 text-sm">用量限制</h3>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              月度 tokens 上限
            </label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
            <p className="text-xs text-zinc-400 mt-1">达到上限后将自动停止 API 调用</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              用量告警阈值 (%)
            </label>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
            <p className="text-xs text-zinc-400 mt-1">达到月度上限的此百分比时发送告警</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
          <h3 className="font-semibold text-zinc-900 text-sm">修改密码</h3>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              当前密码
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          {saved ? '已保存' : '保存设置'}
        </button>
      </form>
    </div>
  )
}
