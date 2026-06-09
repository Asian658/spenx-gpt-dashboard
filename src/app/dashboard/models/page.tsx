'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const providers = [
  {
    name: 'OpenAI',
    models: [
      { name: 'gpt-4o', desc: '最新多模态旗舰模型', price: '$2.50/$10.00', context: '128K' },
      { name: 'gpt-4o-mini', desc: '轻量高效模型', price: '$0.15/$0.60', context: '128K' },
      { name: 'gpt-4.1', desc: '最新编程优化模型', price: '$3.00/$12.00', context: '1M' },
      { name: 'o4-mini', desc: '推理优化轻量模型', price: '$0.60/$2.40', context: '200K' },
    ],
  },
  {
    name: 'Anthropic',
    models: [
      { name: 'claude-opus-4', desc: '最强推理模型', price: '$15.00/$75.00', context: '200K' },
      { name: 'claude-sonnet-4', desc: '平衡性能与成本', price: '$3.00/$15.00', context: '200K' },
      { name: 'claude-haiku-4.5', desc: '最快响应模型', price: '$0.80/$4.00', context: '200K' },
    ],
  },
  {
    name: 'Google',
    models: [
      { name: 'gemini-2.5-pro', desc: 'Google 旗舰模型', price: '$1.25/$5.00', context: '1M' },
      { name: 'gemini-2.5-flash', desc: '高速推理模型', price: '$0.15/$0.60', context: '1M' },
    ],
  },
  {
    name: 'DeepSeek',
    models: [
      { name: 'deepseek-v3', desc: '高性价比旗舰模型', price: '$0.27/$1.10', context: '64K' },
      { name: 'deepseek-r1', desc: '推理增强模型', price: '$0.55/$2.19', context: '128K' },
    ],
  },
]

export default function ModelsPage() {
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const filtered = providers
    .filter((p) => !selectedProvider || p.name === selectedProvider)
    .map((p) => ({
      ...p,
      models: p.models.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.desc.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((p) => p.models.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">模型广场</h1>
        <p className="text-sm text-zinc-500 mt-1">浏览和管理所有可用 AI 模型</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模型..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedProvider(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedProvider ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            全部
          </button>
          {providers.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedProvider(p.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedProvider === p.name ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((provider) => (
        <div key={provider.name}>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {provider.name}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {provider.models.map((model) => (
              <div
                key={model.name}
                className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-zinc-900 text-sm">{model.name}</h3>
                  <span className="text-[11px] text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">
                    {model.context}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-3">{model.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{model.price}</span>
                  <span className="text-[11px] text-emerald-600 font-medium">可用</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
