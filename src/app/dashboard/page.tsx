'use client'

import { useState, useCallback } from 'react'
import { useDashboard } from '@/lib/dashboard-store'

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

function fmtK(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
  return String(n)
}

const chartDates = ['05-31','06-01','06-02','06-03','06-04','06-05','06-06','06-07','06-08','06-09']

// Smooth curve path using quadratic bezier through midpoints
function smoothPath(points: {x:number, y:number}[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`

  let d = `M${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const mx = (curr.x + next.x) / 2
    const my = (curr.y + next.y) / 2

    if (i === 0) {
      d += ` Q${curr.x},${curr.y} ${mx},${my}`
    } else {
      d += ` Q${curr.x},${curr.y} ${mx},${my}`
    }
  }

  d += ` L${points[points.length - 1].x},${points[points.length - 1].y}`
  return d
}

function StockChart({ data, maxY, lineColor, areaId }: { data: number[]; maxY: number; lineColor: string; areaId: string }) {
  const w = 680
  const h = 220
  const padL = 42
  const padR = 40
  const padT = 20
  const padB = 30
  const plotW = w - padL - padR
  const plotH = h - padT - padB

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const points = data.map((v, i) => ({
    x: padL + (i / (data.length - 1)) * plotW,
    y: padT + plotH - (v / maxY) * plotH,
    v,
  }))

  const lineD = smoothPath(points)
  const areaD = lineD + ` L${padL + plotW},${padT + plotH} L${padL},${padT + plotH} Z`

  const yTicks = 5
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const val = Math.round((maxY / (yTicks - 1)) * i)
    const y = padT + plotH - (i / (yTicks - 1)) * plotH
    return { val, y }
  })

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * w
    let closest = 0
    let minDist = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(p.x - mx)
      if (d < minDist) { minDist = d; closest = i }
    })
    if (minDist < 30) setHoverIdx(closest)
    else setHoverIdx(null)
  }, [points])

  const handleLeave = () => setHoverIdx(null)

  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <defs>
        <linearGradient id={`area-${areaId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yLabels.map((t) => (
        <g key={t.val}>
          <line x1={padL} y1={t.y} x2={padL + plotW} y2={t.y} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 3" />
          <text x={padL - 8} y={t.y + 3} textAnchor="end" fontSize="10" fill="#a1a1aa" fontFamily="system-ui">{fmtK(t.val)}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill={`url(#area-${areaId})`} />

      {/* Line */}
      <path d={lineD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Hover vertical line + dot */}
      {hoverPoint && (
        <>
          <line x1={hoverPoint.x} y1={padT} x2={hoverPoint.x} y2={padT + plotH} stroke={lineColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx={hoverPoint.x} cy={hoverPoint.y} r="4" fill="white" stroke={lineColor} strokeWidth="2.5" />
          <rect x={hoverPoint.x - 28} y={hoverPoint.y - 28} width="56" height="20" rx="5" fill={lineColor} />
          <text x={hoverPoint.x} y={hoverPoint.y - 14} textAnchor="middle" fontSize="11" fill="white" fontWeight="600" fontFamily="system-ui">
            {fmtK(hoverPoint.v)}
          </text>
        </>
      )}

      {/* X labels */}
      {chartDates.map((d, i) => {
        if (i % 3 !== 0 && i !== chartDates.length - 1) return null
        const x = padL + (i / (data.length - 1)) * plotW
        return <text key={d} x={x} y={h - 8} textAnchor="middle" fontSize="10" fill="#a1a1aa" fontFamily="system-ui">{d}</text>
      })}
    </svg>
  )
}

export default function DashboardPage() {
  const { state } = useDashboard()

  const dailyAvg = Math.round(state.totalApiCalls / 30)
  const thisMonthCost = state.monthlyData[state.monthlyData.length - 1].cost
  const lastMonthCost = state.monthlyData[state.monthlyData.length - 2].cost
  const costChange = lastMonthCost > 0 ? ((thisMonthCost - lastMonthCost) / lastMonthCost * 100) : 0
  const thisMonthTokens = state.monthlyData[state.monthlyData.length - 1].tokens
  const lastMonthTokens = state.monthlyData[state.monthlyData.length - 2].tokens
  const tokenChange = lastMonthTokens > 0 ? ((thisMonthTokens - lastMonthTokens) / lastMonthTokens * 100) : 0
  const estDays = state.totalApiCalls > 0 ? Math.round(state.balance / (thisMonthCost / 30)) : 0

  const stats = [
    { label: '本月 Token 用量', value: fmtNum(state.totalTokensUsed), change: `较上月 ${tokenChange >= 0 ? '+' : ''}${tokenChange.toFixed(1)}%`, up: tokenChange >= 0 },
    { label: 'API 调用次数', value: fmtNum(state.totalApiCalls), change: `日均 ${fmtNum(dailyAvg)} 次`, up: true },
    { label: '账户余额', value: '$' + state.balance.toFixed(2), change: `预估可用 ${estDays} 天`, up: true },
    { label: '本月费用', value: '$' + thisMonthCost.toFixed(2), change: `较上月 ${costChange >= 0 ? '+' : ''}${costChange.toFixed(1)}%`, up: costChange <= 0 },
  ]

  const maxTrend = Math.max(...state.tokenTrend, 1) * 1.15
  const maxCall = Math.max(...state.apiCallTrend, 1) * 1.15

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">用量概览</h1>
          <p className="text-sm text-zinc-500 mt-1">监控你的 GPT API 消耗情况</p>
        </div>
        {state.isRealTimeActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">实时保护中</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-zinc-900">{s.value}</div>
            <div className={`text-xs mt-0.5 ${s.up ? 'text-emerald-600' : 'text-zinc-500'}`}>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">Token 消耗趋势</h3>
            <p className="text-xs text-zinc-400 mt-0.5">近 10 天</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>最高 <span className="text-zinc-600 font-medium">{fmtK(Math.max(...state.tokenTrend))}</span></span>
            <span>最低 <span className="text-zinc-600 font-medium">{fmtK(Math.min(...state.tokenTrend))}</span></span>
          </div>
        </div>
        <StockChart data={state.tokenTrend} maxY={maxTrend} lineColor="#2563eb" areaId="tokens" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">API 调用次数</h3>
            <p className="text-xs text-zinc-400 mt-0.5">近 10 天</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>最高 <span className="text-zinc-600 font-medium">{Math.max(...state.apiCallTrend)}</span></span>
            <span>最低 <span className="text-zinc-600 font-medium">{Math.min(...state.apiCallTrend)}</span></span>
          </div>
        </div>
        <StockChart data={state.apiCallTrend} maxY={maxCall} lineColor="#f59e0b" areaId="calls" />
      </div>
    </div>
  )
}
