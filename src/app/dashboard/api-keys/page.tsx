'use client'

import { useState } from 'react'
import { Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { useDashboard } from '@/lib/dashboard-store'

export default function ApiKeysPage() {
  const { state, dispatch } = useDashboard()
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPerm, setNewKeyPerm] = useState('读取')

  function toggleVisibility(id: number) {
    const next = new Set(visibleKeys)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setVisibleKeys(next)
  }

  function handleCopy(id: number, fullKey: string) {
    navigator.clipboard.writeText(fullKey)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleAdd() {
    if (!newKeyName.trim()) return
    dispatch({ type: 'ADD_API_KEY', name: newKeyName, permissions: newKeyPerm })
    setNewKeyName('')
    setNewKeyPerm('读取')
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">API Keys</h1>
          <p className="text-sm text-zinc-500 mt-1">管理你的 API 密钥</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          创建 Key
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">新建 API Key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key 名称"
              className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
            <select
              value={newKeyPerm}
              onChange={(e) => setNewKeyPerm(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            >
              <option>读取</option>
              <option>写入</option>
              <option>全部</option>
            </select>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
            >
              创建
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

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-3 px-5 font-medium">名称</th>
              <th className="text-left py-3 px-5 font-medium">Key</th>
              <th className="text-left py-3 px-5 font-medium">权限</th>
              <th className="text-left py-3 px-5 font-medium">创建时间</th>
              <th className="text-left py-3 px-5 font-medium">最近使用</th>
              <th className="text-right py-3 px-5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {state.apiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-3 px-5 text-zinc-900 font-medium">{apiKey.name}</td>
                <td className="py-3 px-5">
                  <code className="text-xs text-zinc-600 font-mono bg-zinc-50 px-2 py-1 rounded">
                    {visibleKeys.has(apiKey.id) ? apiKey.fullKey : apiKey.key}
                  </code>
                </td>
                <td className="py-3 px-5">
                  <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                    {apiKey.permissions}
                  </span>
                </td>
                <td className="py-3 px-5 text-zinc-500">{apiKey.created}</td>
                <td className="py-3 px-5 text-zinc-500">{apiKey.lastUsed}</td>
                <td className="py-3 px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toggleVisibility(apiKey.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                      {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(apiKey.id, apiKey.fullKey)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                      {copied === apiKey.id ? (
                        <span className="text-xs text-emerald-600 font-medium">已复制</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_API_KEY', id: apiKey.id })}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <p className="text-sm text-amber-700">
          请妥善保管你的 API Key，不要在客户端代码中暴露。所有 Key 拥有你账户的完整权限。
        </p>
      </div>
    </div>
  )
}
