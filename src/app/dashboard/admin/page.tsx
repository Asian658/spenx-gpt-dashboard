'use client'

import { useState } from 'react'
import { useDashboard, AVAILABLE_MODELS } from '@/lib/dashboard-store'
import { Zap, Eye, EyeOff } from 'lucide-react'

const PAYMENT_METHODS = ['Alipay', 'WeChat Pay', 'Bank Card', 'PayPal']

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

function EditableCell({ value, onSave, className = '', type = 'text', options }: { value: string; onSave: (v: string) => void; className?: string; type?: string; options?: string[] }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-amber-50 hover:text-amber-700 px-1 -mx-1 rounded transition-colors ${className}`}
        onClick={() => { setDraft(value); setEditing(true) }}
        title="点击编辑"
      >
        {value}
      </span>
    )
  }

  if (options) {
    return (
      <select
        value={draft}
        onChange={(e) => { onSave(e.target.value); setEditing(false) }}
        onBlur={() => setEditing(false)}
        className="px-1 py-0.5 rounded border border-amber-300 text-sm bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        autoFocus
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { onSave(draft); setEditing(false) }}
      onKeyDown={(e) => { if (e.key === 'Enter') { onSave(draft); setEditing(false) } }}
      className="px-1 py-0.5 rounded border border-amber-300 text-sm bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent w-full"
      autoFocus
    />
  )
}

export default function AdminPage() {
  const { state, dispatch } = useDashboard()
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [copied, setCopied] = useState<number | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())

  function startEdit(key: string, value: string) {
    setEditing(key)
    setEditValue(value)
  }

  function saveEdit(key: string) {
    dispatch({ type: 'UPDATE_ADMIN_STAT', key, value: editValue })
    setEditing(null)
  }

  function toggleKeyVis(id: number) {
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

  const maxHour = Math.max(...state.hourlyData, 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">参数管理</h1>
          <p className="text-sm text-zinc-500 mt-1">管理系统全局参数和实时数据（点击数值直接编辑）</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            实时 tick: <span className="text-zinc-900 font-mono font-bold">{state.tickCount}</span>
          </span>
          <button
            onClick={() => dispatch({ type: 'BURST_TICKS', count: 50 })}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            刷新
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_REALTIME' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              state.isRealTimeActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {state.isRealTimeActive ? '暂停实时' : '启动实时'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">统计参数</h3>
        <div className="grid grid-cols-3 gap-4">
          {state.adminStats.map((stat) => (
            <div key={stat.key} className="border border-zinc-200 rounded-lg p-4">
              <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
              {editing === stat.key ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(stat.key)} className="px-2 py-1 bg-zinc-900 text-white rounded text-xs">保存</button>
                  <button onClick={() => setEditing(null)} className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs">取消</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-zinc-900">{stat.value}</span>
                  {stat.editable && (
                    <button onClick={() => startEdit(stat.key, stat.value)} className="text-xs text-zinc-400 hover:text-zinc-600">编辑</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Categories */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">数据分类概览</h3>
        <div className="space-y-2">
          {state.dataCategories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between py-3 px-4 bg-zinc-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-zinc-900">{cat.name}</span>
                <span className="text-xs text-zinc-500 ml-3">
                  <EditableCell
                    value={cat.count}
                    onSave={(v) => dispatch({ type: 'UPDATE_DATA_CATEGORY', name: cat.name, field: 'count', value: v })}
                  />
                </span>
              </div>
              <span className="text-sm text-zinc-500">
                <EditableCell
                  value={cat.size}
                  onSave={(v) => dispatch({ type: 'UPDATE_DATA_CATEGORY', name: cat.name, field: 'size', value: v })}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Data */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">每日数据</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-2 px-3 font-medium">日期</th>
              <th className="text-right py-2 px-3 font-medium">Tokens</th>
              <th className="text-right py-2 px-3 font-medium">API 调用</th>
              <th className="text-right py-2 px-3 font-medium">费用</th>
            </tr>
          </thead>
          <tbody>
            {state.dailyData.map((d) => (
              <tr key={d.label} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-2 px-3 text-zinc-900 font-medium">
                  <EditableCell value={d.label} onSave={(v) => dispatch({ type: 'UPDATE_DAILY_DATA', label: d.label, field: 'label', value: v })} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-600">
                  <EditableCell value={fmtNum(d.tokens)} onSave={(v) => dispatch({ type: 'UPDATE_DAILY_DATA', label: d.label, field: 'tokens', value: v })} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-600">
                  <EditableCell value={fmtNum(d.calls)} onSave={(v) => dispatch({ type: 'UPDATE_DAILY_DATA', label: d.label, field: 'calls', value: v })} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-900">
                  <EditableCell value={`$${d.cost.toFixed(2)}`} onSave={(v) => dispatch({ type: 'UPDATE_DAILY_DATA', label: d.label, field: 'cost', value: v.replace('$', '') })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hourly Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">每小时数据</h3>
        <div className="flex items-end gap-1 h-32">
          {state.hourlyData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <EditableCell
                value={String(v)}
                onSave={(val) => dispatch({ type: 'UPDATE_HOURLY_DATA', index: i, value: parseInt(val) || 0 })}
                className="text-[9px] text-zinc-400"
              />
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${(v / maxHour) * 100}%`,
                  backgroundColor: v / maxHour > 0.7 ? '#18181b' : v / maxHour > 0.4 ? '#a1a1aa' : '#e4e4e7',
                }}
              />
              <span className="text-[9px] text-zinc-400">{i}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly + Model Distribution */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">月度数据</h3>
          <div className="space-y-1">
            {state.monthlyData.map((m) => (
              <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-zinc-50 text-xs">
                <span className="text-zinc-600 font-medium w-10">
                  <EditableCell value={m.label} onSave={(v) => dispatch({ type: 'UPDATE_MONTHLY_DATA', label: m.label, field: 'label', value: v })} />
                </span>
                <span className="text-zinc-500">
                  <EditableCell value={`${fmtNum(m.tokens)} tokens`} onSave={(v) => dispatch({ type: 'UPDATE_MONTHLY_DATA', label: m.label, field: 'tokens', value: v })} />
                </span>
                <span className="text-zinc-500">
                  <EditableCell value={`${fmtNum(m.calls)} 次`} onSave={(v) => dispatch({ type: 'UPDATE_MONTHLY_DATA', label: m.label, field: 'calls', value: v })} />
                </span>
                <span className="text-zinc-900">
                  <EditableCell value={`$${m.cost.toFixed(2)}`} onSave={(v) => dispatch({ type: 'UPDATE_MONTHLY_DATA', label: m.label, field: 'cost', value: v.replace('$', '') })} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">模型分布</h3>
          <div className="space-y-2.5">
            {state.modelUsage.map((m) => (
              <div key={m.model}>
                <div className="flex justify-between text-xs mb-0.5">
                  <EditableCell value={m.model} onSave={(v) => dispatch({ type: 'UPDATE_MODEL_USAGE', model: m.model, field: 'model', value: v })} className="text-zinc-600" />
                  <EditableCell
                    value={`${m.pct}%`}
                    onSave={(v) => dispatch({ type: 'UPDATE_MODEL_USAGE', model: m.model, field: 'pct', value: v })}
                    className="text-zinc-400"
                  />
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div className="bg-zinc-900 h-2 rounded-full transition-all duration-500" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">最近请求</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-2 px-3 font-medium">时间</th>
              <th className="text-left py-2 px-3 font-medium">模型</th>
              <th className="text-right py-2 px-3 font-medium">Tokens</th>
              <th className="text-right py-2 px-3 font-medium">费用</th>
              <th className="text-center py-2 px-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {state.recentRequests.slice(0, 20).map((r) => (
              <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-2 px-3 text-zinc-600 text-xs">
                  <EditableCell value={r.timestamp} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'timestamp', value: v })} />
                </td>
                <td className="py-2 px-3 text-zinc-900 font-medium text-xs">
                  <EditableCell value={r.model} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'model', value: v })} options={AVAILABLE_MODELS.map(m => m.name)} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-600 text-xs">
                  <EditableCell value={fmtNum(r.tokens)} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'tokens', value: v })} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-900 text-xs">
                  <EditableCell value={`$${r.cost.toFixed(4)}`} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'cost', value: v.replace('$', '') })} />
                </td>
                <td className="py-2 px-3 text-center">
                  <EditableCell
                    value={r.status}
                    onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'status', value: v })}
                    options={['success', 'error']}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing Records */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">账单记录</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-2 px-3 font-medium">时间</th>
              <th className="text-left py-2 px-3 font-medium">模型</th>
              <th className="text-right py-2 px-3 font-medium">Tokens</th>
              <th className="text-right py-2 px-3 font-medium">费用</th>
            </tr>
          </thead>
          <tbody>
            {state.billingRecords.slice(0, 20).map((r) => (
              <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-2 px-3 text-zinc-600 text-xs">
                  <EditableCell value={r.date} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'date', value: v })} />
                </td>
                <td className="py-2 px-3 text-zinc-900 font-medium text-xs">
                  <EditableCell value={r.model} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'model', value: v })} options={AVAILABLE_MODELS.map(m => m.name)} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-600 text-xs">
                  <EditableCell value={fmtNum(r.tokens)} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'tokens', value: v })} />
                </td>
                <td className="py-2 px-3 text-right text-zinc-900 text-xs">
                  <EditableCell value={`$${r.cost.toFixed(2)}`} onSave={(v) => dispatch({ type: 'UPDATE_BILLING_RECORD', id: r.id, field: 'cost', value: v.replace('$', '') })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recharge Records */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">充值记录</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-2 px-3 font-medium">日期</th>
              <th className="text-left py-2 px-3 font-medium">金额</th>
              <th className="text-left py-2 px-3 font-medium">方式</th>
              <th className="text-right py-2 px-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {state.rechargeRecords.map((r) => (
              <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-2 px-3 text-zinc-600 text-xs">
                  <EditableCell value={r.date} onSave={(v) => dispatch({ type: 'UPDATE_RECHARGE_RECORD', id: r.id, field: 'date', value: v })} />
                </td>
                <td className="py-2 px-3 text-zinc-900 font-semibold text-xs">
                  <EditableCell value={`$${r.amount.toFixed(2)}`} onSave={(v) => dispatch({ type: 'UPDATE_RECHARGE_RECORD', id: r.id, field: 'amount', value: v.replace('$', '') })} />
                </td>
                <td className="py-2 px-3 text-zinc-600 text-xs">
                  <EditableCell value={r.method} onSave={(v) => dispatch({ type: 'UPDATE_RECHARGE_RECORD', id: r.id, field: 'method', value: v })} options={PAYMENT_METHODS} />
                </td>
                <td className="py-2 px-3 text-right">
                  <EditableCell value={r.status} onSave={(v) => dispatch({ type: 'UPDATE_RECHARGE_RECORD', id: r.id, field: 'status', value: v })} options={['Completed', 'Processing', 'Failed']} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">API Keys</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-2 px-3 font-medium">名称</th>
              <th className="text-left py-2 px-3 font-medium">Key</th>
              <th className="text-left py-2 px-3 font-medium">权限</th>
              <th className="text-left py-2 px-3 font-medium">创建</th>
              <th className="text-right py-2 px-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {state.apiKeys.map((k) => (
              <tr key={k.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-2 px-3 text-zinc-900 font-medium text-xs">
                  <EditableCell value={k.name} onSave={(v) => dispatch({ type: 'UPDATE_API_KEY', id: k.id, field: 'name', value: v })} />
                </td>
                <td className="py-2 px-3">
                  <code className="text-xs text-zinc-500 font-mono bg-zinc-50 px-1.5 py-0.5 rounded">
                    {visibleKeys.has(k.id) ? k.fullKey : k.key}
                  </code>
                </td>
                <td className="py-2 px-3">
                  <EditableCell value={k.permissions} onSave={(v) => dispatch({ type: 'UPDATE_API_KEY', id: k.id, field: 'permissions', value: v })} />
                </td>
                <td className="py-2 px-3 text-zinc-500 text-xs">
                  <EditableCell value={k.created} onSave={(v) => dispatch({ type: 'UPDATE_API_KEY', id: k.id, field: 'created', value: v })} />
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleKeyVis(k.id)} className="p-1 text-zinc-400 hover:text-zinc-600">
                      {visibleKeys.has(k.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(k.id, k.fullKey)}
                      className="p-1 text-zinc-400 hover:text-zinc-600"
                    >
                      {copied === k.id ? (
                        <span className="text-xs text-emerald-600">已复制</span>
                      ) : (
                        <span className="text-xs">复制</span>
                      )}
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_API_KEY', id: k.id })}
                      className="p-1 text-zinc-400 hover:text-red-500"
                    >
                      <span className="text-xs">删除</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Operations */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="font-semibold text-zinc-900 text-sm mb-4">系统操作</h3>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
            清除缓存
          </button>
          <button className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm hover:bg-zinc-200">
            导出数据
          </button>
          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
            重置系统
          </button>
        </div>
      </div>
    </div>
  )
}
