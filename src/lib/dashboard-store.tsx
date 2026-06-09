'use client'

import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModelInfo {
  name: string
  provider: string
  pricePer1K: number
  context: string
  desc: string
}

export interface ApiRequest {
  id: number
  timestamp: string
  model: string
  tokens: number
  cost: number
  status: 'success' | 'error'
}

export interface BillingRecord {
  id: number
  date: string
  model: string
  tokens: number
  cost: number
  type: string
}

export interface RechargeRecord {
  id: number
  date: string
  amount: number
  method: string
  status: string
}

export interface Transaction {
  id: number
  date: string
  type: '消费' | '充值'
  amount: number
  desc: string
}

export interface ApiKeyItem {
  id: number
  name: string
  key: string
  fullKey: string
  created: string
  lastUsed: string
  permissions: string
}

export interface TimeSeriesPoint {
  label: string
  tokens: number
  calls: number
  cost: number
}

export interface ModelUsageItem {
  model: string
  tokens: number
  pct: number
}

export interface AdminStat {
  key: string
  label: string
  value: string
  editable: boolean
}

export interface DataCategory {
  name: string
  count: string
  size: string
}

export interface DashboardState {
  balance: number
  totalTokensUsed: number
  totalApiCalls: number
  activeModels: number
  isRealTimeActive: boolean
  tickCount: number
  dailyData: TimeSeriesPoint[]
  hourlyData: number[]
  monthlyData: TimeSeriesPoint[]
  tokenTrend: number[]
  apiCallTrend: number[]
  modelUsage: ModelUsageItem[]
  recentRequests: ApiRequest[]
  billingRecords: BillingRecord[]
  rechargeRecords: RechargeRecord[]
  transactions: Transaction[]
  apiKeys: ApiKeyItem[]
  adminStats: AdminStat[]
  dataCategories: DataCategory[]
}

export type DashboardAction =
  | { type: 'TICK' }
  | { type: 'TOGGLE_REALTIME' }
  | { type: 'BURST_TICKS'; count: number }
  | { type: 'ADD_API_KEY'; name: string; permissions: string }
  | { type: 'DELETE_API_KEY'; id: number }
  | { type: 'UPDATE_API_KEY'; id: number; field: string; value: string }
  | { type: 'UPDATE_ADMIN_STAT'; key: string; value: string }
  | { type: 'ADD_RECHARGE'; amount: number; method: string }
  | { type: 'UPDATE_DAILY_DATA'; label: string; field: string; value: string }
  | { type: 'UPDATE_MONTHLY_DATA'; label: string; field: string; value: string }
  | { type: 'UPDATE_BILLING_RECORD'; id: number; field: string; value: string }
  | { type: 'UPDATE_RECHARGE_RECORD'; id: number; field: string; value: string }
  | { type: 'UPDATE_DATA_CATEGORY'; name: string; field: string; value: string }
  | { type: 'UPDATE_HOURLY_DATA'; index: number; value: number }
  | { type: 'UPDATE_MODEL_USAGE'; model: string; field: string; value: string }
  | { type: 'LOAD_STATE'; state: DashboardState }

// ─── Models ───────────────────────────────────────────────────────────────────

export const AVAILABLE_MODELS: ModelInfo[] = [
  { name: 'gpt-4o', provider: 'OpenAI', pricePer1K: 0.0025, context: '128K', desc: '最新多模态旗舰模型' },
  { name: 'gpt-4o-mini', provider: 'OpenAI', pricePer1K: 0.00015, context: '128K', desc: '轻量高效模型' },
  { name: 'gpt-4.1', provider: 'OpenAI', pricePer1K: 0.003, context: '1M', desc: '最新编程优化模型' },
  { name: 'o4-mini', provider: 'OpenAI', pricePer1K: 0.0006, context: '200K', desc: '推理优化轻量模型' },
  { name: 'claude-opus-4', provider: 'Anthropic', pricePer1K: 0.015, context: '200K', desc: '最强推理模型' },
  { name: 'claude-sonnet-4', provider: 'Anthropic', pricePer1K: 0.003, context: '200K', desc: '平衡性能与成本' },
  { name: 'claude-haiku-4.5', provider: 'Anthropic', pricePer1K: 0.0008, context: '200K', desc: '最快响应模型' },
  { name: 'gemini-2.5-pro', provider: 'Google', pricePer1K: 0.00125, context: '1M', desc: 'Google 旗舰模型' },
  { name: 'gemini-2.5-flash', provider: 'Google', pricePer1K: 0.00015, context: '1M', desc: '高速推理模型' },
  { name: 'deepseek-v3', provider: 'DeepSeek', pricePer1K: 0.00027, context: '64K', desc: '高性价比旗舰模型' },
  { name: 'deepseek-r1', provider: 'DeepSeek', pricePer1K: 0.00055, context: '128K', desc: '推理增强模型' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = new Date()
function fmtDate(d: Date = now) { return d.toISOString().split('T')[0] }
function fmtDateTime(d: Date = now) {
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

function randomTokenCount() {
  return Math.floor(Math.random() * 14500) + 500
}

// ─── Initial State ────────────────────────────────────────────────────────────

function createInitialState(): DashboardState {
  const dailyData: TimeSeriesPoint[] = [
    { label: '06/03', tokens: 142000, calls: 980, cost: 3.52 },
    { label: '06/04', tokens: 168000, calls: 1120, cost: 4.18 },
    { label: '06/05', tokens: 195000, calls: 1350, cost: 4.95 },
    { label: '06/06', tokens: 220000, calls: 1520, cost: 5.60 },
    { label: '06/07', tokens: 178000, calls: 1180, cost: 4.42 },
    { label: '06/08', tokens: 156000, calls: 1040, cost: 3.89 },
    { label: '06/09', tokens: 140144, calls: 947, cost: 3.47 },
  ]

  const monthlyData: TimeSeriesPoint[] = [
    { label: '1月', tokens: 2850000, calls: 19500, cost: 85.50 },
    { label: '2月', tokens: 3120000, calls: 22800, cost: 93.60 },
    { label: '3月', tokens: 2980000, calls: 21400, cost: 89.40 },
    { label: '4月', tokens: 3450000, calls: 25100, cost: 103.50 },
    { label: '5月', tokens: 3680000, calls: 26800, cost: 110.40 },
    { label: '6月', tokens: 1199156, calls: 7137, cost: 35.97 },
  ]

  const recentRequests: ApiRequest[] = [
    { id: 1, timestamp: '2026-06-09 14:58:23', model: 'gpt-4o', tokens: 4200, cost: 0.011, status: 'success' },
    { id: 2, timestamp: '2026-06-09 14:56:41', model: 'claude-opus-4', tokens: 8900, cost: 0.134, status: 'success' },
    { id: 3, timestamp: '2026-06-09 14:55:10', model: 'deepseek-v3', tokens: 12000, cost: 0.003, status: 'success' },
    { id: 4, timestamp: '2026-06-09 14:52:05', model: 'gemini-2.5-flash', tokens: 800, cost: 0.0001, status: 'error' },
    { id: 5, timestamp: '2026-06-09 14:48:33', model: 'gpt-4o-mini', tokens: 3200, cost: 0.0005, status: 'success' },
    { id: 6, timestamp: '2026-06-09 14:45:18', model: 'claude-sonnet-4', tokens: 6700, cost: 0.020, status: 'success' },
    { id: 7, timestamp: '2026-06-09 14:40:02', model: 'gpt-4.1', tokens: 15000, cost: 0.045, status: 'success' },
    { id: 8, timestamp: '2026-06-09 14:35:27', model: 'o4-mini', tokens: 2500, cost: 0.002, status: 'success' },
  ]

  const billingRecords: BillingRecord[] = [
    { id: 1, date: '2026-06-09 14:32', model: 'gpt-4o', tokens: 12450, cost: 0.37, type: 'API 调用' },
    { id: 2, date: '2026-06-09 14:28', model: 'claude-opus-4', tokens: 8920, cost: 0.89, type: 'API 调用' },
    { id: 3, date: '2026-06-09 14:15', model: 'gpt-4o-mini', tokens: 3210, cost: 0.03, type: 'API 调用' },
    { id: 4, date: '2026-06-09 13:58', model: 'deepseek-v3', tokens: 25600, cost: 0.12, type: 'API 调用' },
    { id: 5, date: '2026-06-09 13:45', model: 'claude-sonnet-4', tokens: 6780, cost: 0.27, type: 'API 调用' },
    { id: 6, date: '2026-06-09 13:30', model: 'gpt-4o', tokens: 15200, cost: 0.46, type: 'API 调用' },
    { id: 7, date: '2026-06-09 13:12', model: 'gemini-2.5-pro', tokens: 4500, cost: 0.05, type: 'API 调用' },
  ]

  const rechargeRecords: RechargeRecord[] = [
    { id: 1, date: '2026-06-01', amount: 100, method: 'Alipay', status: 'Completed' },
    { id: 2, date: '2026-05-15', amount: 50, method: 'WeChat Pay', status: 'Completed' },
    { id: 3, date: '2026-05-01', amount: 200, method: 'Alipay', status: 'Completed' },
    { id: 4, date: '2026-04-15', amount: 100, method: 'Bank Card', status: 'Completed' },
  ]

  const transactions: Transaction[] = [
    { id: 1, date: '2026-06-09 14:30', type: '消费', amount: -1.73, desc: 'API 调用扣费' },
    { id: 2, date: '2026-06-09 12:15', type: '消费', amount: -0.46, desc: 'API 调用扣费' },
    { id: 3, date: '2026-06-09 10:00', type: '充值', amount: 100, desc: '微信充值' },
    { id: 4, date: '2026-06-08 18:20', type: '消费', amount: -2.15, desc: 'API 调用扣费' },
    { id: 5, date: '2026-06-08 14:00', type: '消费', amount: -0.89, desc: 'API 调用扣费' },
    { id: 6, date: '2026-06-08 09:30', type: '消费', amount: -1.20, desc: 'API 调用扣费' },
    { id: 7, date: '2026-06-07 16:45', type: '消费', amount: -0.37, desc: 'API 调用扣费' },
  ]

  const apiKeys: ApiKeyItem[] = [
    { id: 1, name: 'Production API Key', key: 'sk-pro-••••••••••••••••d8f2', fullKey: 'sk-pro-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6d8f2', created: '2026-06-01', lastUsed: '2 分钟前', permissions: '全部' },
    { id: 2, name: 'Development Key', key: 'sk-dev-••••••••••••••••3a9e', fullKey: 'sk-dev-x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z3a9e', created: '2026-05-15', lastUsed: '3 天前', permissions: '读取' },
  ]

  const adminStats: AdminStat[] = [
    { key: 'total_users', label: '总用户数', value: '128', editable: true },
    { key: 'total_tokens', label: '总 tokens 用量', value: fmtNum(1199156), editable: true },
    { key: 'account_balance', label: '账户余额', value: '$2,448.27', editable: true },
    { key: 'monthly_cost', label: '本月费用', value: '$35.97', editable: true },
    { key: 'active_models', label: '活跃模型数', value: '12', editable: true },
    { key: 'api_calls_today', label: '今日 API 调用', value: '7,137', editable: true },
    { key: 'avg_response_time', label: '平均响应时间', value: '320ms', editable: true },
  ]

  const dataCategories: DataCategory[] = [
    { name: '用户数据', count: '128 条', size: '2.3 MB' },
    { name: 'API 日志', count: '45,200 条', size: '156.8 MB' },
    { name: '账单记录', count: '3,420 条', size: '12.1 MB' },
    { name: '模型配置', count: '308 条', size: '0.8 MB' },
    { name: '系统日志', count: '89,400 条', size: '423.5 MB' },
  ]

  return {
    balance: 2448.27,
    totalTokensUsed: 470898425,
    totalApiCalls: 44754,
    activeModels: 12,
    isRealTimeActive: false,
    tickCount: 0,
    dailyData,
    hourlyData: [12, 8, 5, 3, 2, 4, 7, 11, 15, 18, 20, 22, 19, 17, 21, 23, 24, 20, 16, 14, 18, 22, 20, 15],
    monthlyData,
    tokenTrend: [3100, 3500, 4200, 4500, 3900, 4800, 5100, 4600, 5200, 5500],
    apiCallTrend: [810, 880, 950, 1020, 980, 1150, 1200, 1050, 1300, 1480],
    modelUsage: [
      { model: 'gpt-4o', tokens: 285000, pct: 24 },
      { model: 'claude-opus-4', tokens: 210000, pct: 18 },
      { model: 'deepseek-v3', tokens: 195000, pct: 16 },
      { model: 'gemini-2.5-pro', tokens: 168000, pct: 14 },
      { model: 'claude-sonnet-4', tokens: 142000, pct: 12 },
      { model: 'gpt-4o-mini', tokens: 120000, pct: 10 },
      { model: '其他', tokens: 79156, pct: 6 },
    ],
    recentRequests,
    billingRecords,
    rechargeRecords,
    transactions,
    apiKeys,
    adminStats,
    dataCategories,
  }
}

function createEmptyState(): DashboardState {
  const now = new Date()
  const todayLabel = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`

  return {
    balance: 0,
    totalTokensUsed: 0,
    totalApiCalls: 0,
    activeModels: 0,
    isRealTimeActive: false,
    tickCount: 0,
    dailyData: [{ label: todayLabel, tokens: 0, calls: 0, cost: 0 }],
    hourlyData: Array(24).fill(0),
    monthlyData: [
      { label: '1月', tokens: 0, calls: 0, cost: 0 },
      { label: '2月', tokens: 0, calls: 0, cost: 0 },
      { label: '3月', tokens: 0, calls: 0, cost: 0 },
      { label: '4月', tokens: 0, calls: 0, cost: 0 },
      { label: '5月', tokens: 0, calls: 0, cost: 0 },
      { label: '6月', tokens: 0, calls: 0, cost: 0 },
    ],
    tokenTrend: Array(10).fill(0),
    apiCallTrend: Array(10).fill(0),
    modelUsage: [
      { model: 'gpt-4o', tokens: 0, pct: 0 },
      { model: 'claude-opus-4', tokens: 0, pct: 0 },
      { model: 'deepseek-v3', tokens: 0, pct: 0 },
      { model: 'gemini-2.5-pro', tokens: 0, pct: 0 },
      { model: 'claude-sonnet-4', tokens: 0, pct: 0 },
      { model: 'gpt-4o-mini', tokens: 0, pct: 0 },
      { model: '其他', tokens: 0, pct: 0 },
    ],
    recentRequests: [],
    billingRecords: [],
    rechargeRecords: [],
    transactions: [],
    apiKeys: [],
    adminStats: [
      { key: 'total_users', label: '总用户数', value: '1', editable: true },
      { key: 'total_tokens', label: '总 tokens 用量', value: '0', editable: true },
      { key: 'account_balance', label: '账户余额', value: '$0.00', editable: true },
      { key: 'monthly_cost', label: '本月费用', value: '$0.00', editable: true },
      { key: 'active_models', label: '活跃模型数', value: '0', editable: true },
      { key: 'api_calls_today', label: '今日 API 调用', value: '0', editable: true },
      { key: 'avg_response_time', label: '平均响应时间', value: '0ms', editable: true },
    ],
    dataCategories: [
      { name: '用户数据', count: '1 条', size: '0 KB' },
      { name: 'API 日志', count: '0 条', size: '0 KB' },
      { name: '账单记录', count: '0 条', size: '0 KB' },
      { name: '模型配置', count: '0 条', size: '0 KB' },
      { name: '系统日志', count: '0 条', size: '0 KB' },
    ],
  }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {

    case 'TICK': {
      const model = AVAILABLE_MODELS[Math.floor(Math.random() * AVAILABLE_MODELS.length)]
      const tokens = randomTokenCount()
      const cost = Math.round((tokens / 1000) * model.pricePer1K * 10000) / 10000
      const status: 'success' | 'error' = Math.random() < 0.9 ? 'success' : 'error'
      const ts = fmtDateTime()
      const id = Date.now()
      const newBalance = Math.max(0, Math.round((state.balance - cost) * 100) / 100)
      const newTokens = state.totalTokensUsed + tokens
      const newCalls = state.totalApiCalls + 1

      const newRequest: ApiRequest = { id, timestamp: ts, model: model.name, tokens, cost, status }
      const recentRequests = [newRequest, ...state.recentRequests].slice(0, 50)

      const billingRecords = [{ id, date: ts.slice(0, 16), model: model.name, tokens, cost: Math.round(cost * 100) / 100, type: 'API 调用' }, ...state.billingRecords]

      const transactions: Transaction[] = [{ id, date: ts.slice(0, 16), type: '消费', amount: -Math.round(cost * 100) / 100, desc: 'API 调用扣费' }, ...state.transactions]

      const hour = new Date().getHours()
      const hourlyData = [...state.hourlyData]
      hourlyData[hour] = (hourlyData[hour] || 0) + Math.round(tokens / 1000)

      const todayLabel = fmtDate()
      const dailyData = state.dailyData.map((d) =>
        d.label === todayLabel
          ? { ...d, tokens: d.tokens + tokens, calls: d.calls + 1, cost: Math.round((d.cost + cost) * 100) / 100 }
          : d
      )

      const monthIdx = new Date().getMonth()
      const monthlyData = state.monthlyData.map((m, i) =>
        i === monthIdx
          ? { ...m, tokens: m.tokens + tokens, calls: m.calls + 1, cost: Math.round((m.cost + cost) * 100) / 100 }
          : m
      )

      const totalAllTokens = state.modelUsage.reduce((sum, m) => sum + m.tokens, 0) + tokens
      const modelUsage = state.modelUsage.map((m) => {
        const newT = m.model === model.name ? m.tokens + tokens : m.tokens
        return { ...m, tokens: newT, pct: Math.round((newT / totalAllTokens) * 100) }
      })

      const tokenTrend = [...state.tokenTrend.slice(1), Math.round(tokens / 1000)]
      const apiCallTrend = [...state.apiCallTrend.slice(1), 1]

      const adminStats = state.adminStats.map((s) => {
        if (s.key === 'account_balance') return { ...s, value: `$${newBalance.toFixed(2)}` }
        if (s.key === 'monthly_cost') return { ...s, value: `$${monthlyData[monthIdx].cost.toFixed(2)}` }
        return s
      })

      const dataCategories = state.dataCategories.map((c) => {
        if (c.name === 'API 日志') return { ...c, count: fmtNum(45200 + state.tickCount + 1) + ' 条', size: (156.8 + (state.tickCount + 1) * 0.002).toFixed(1) + ' MB' }
        if (c.name === '账单记录') return { ...c, count: fmtNum(3420 + state.tickCount + 1) + ' 条', size: (12.1 + (state.tickCount + 1) * 0.001).toFixed(1) + ' MB' }
        if (c.name === '系统日志') return { ...c, count: fmtNum(89400 + state.tickCount + 1) + ' 条', size: (423.5 + (state.tickCount + 1) * 0.003).toFixed(1) + ' MB' }
        return c
      })

      return {
        ...state,
        balance: newBalance,
        totalTokensUsed: newTokens,
        totalApiCalls: newCalls,
        activeModels: modelUsage.filter((m) => m.tokens > 0).length,
        tickCount: state.tickCount + 1,
        recentRequests,
        billingRecords,
        transactions,
        hourlyData,
        dailyData,
        monthlyData,
        modelUsage,
        tokenTrend,
        apiCallTrend,
        adminStats,
        dataCategories,
      }
    }

    case 'TOGGLE_REALTIME':
      return { ...state, isRealTimeActive: !state.isRealTimeActive }

    case 'BURST_TICKS': {
      let s = state
      for (let i = 0; i < action.count; i++) {
        s = dashboardReducer(s, { type: 'TICK' })
      }
      return s
    }

    case 'ADD_API_KEY': {
      const id = Date.now()
      const hex = Math.random().toString(16).slice(2, 14) + Math.random().toString(16).slice(2, 14)
      return {
        ...state,
        apiKeys: [...state.apiKeys, {
          id,
          name: action.name,
          key: `sk-new-••••••••••••••••${hex.slice(0, 4)}`,
          fullKey: `sk-new-${hex}`,
          created: fmtDate(),
          lastUsed: '从未',
          permissions: action.permissions,
        }],
      }
    }

    case 'DELETE_API_KEY':
      return { ...state, apiKeys: state.apiKeys.filter((k) => k.id !== action.id) }

    case 'UPDATE_ADMIN_STAT':
      return {
        ...state,
        adminStats: state.adminStats.map((s) =>
          s.key === action.key ? { ...s, value: action.value } : s
        ),
      }

    case 'UPDATE_API_KEY':
      return {
        ...state,
        apiKeys: state.apiKeys.map((k) =>
          k.id === action.id ? { ...k, [action.field]: action.value } : k
        ),
      }

    case 'UPDATE_DAILY_DATA':
      return {
        ...state,
        dailyData: state.dailyData.map((d) =>
          d.label === action.label ? { ...d, [action.field]: action.field === 'cost' ? parseFloat(action.value) || 0 : action.field === 'label' ? action.value : parseInt(action.value) || 0 } : d
        ),
      }

    case 'UPDATE_MONTHLY_DATA':
      return {
        ...state,
        monthlyData: state.monthlyData.map((m) =>
          m.label === action.label ? { ...m, [action.field]: action.field === 'cost' ? parseFloat(action.value) || 0 : action.field === 'label' ? action.value : parseInt(action.value) || 0 } : m
        ),
      }

    case 'UPDATE_BILLING_RECORD':
      return {
        ...state,
        billingRecords: state.billingRecords.map((r) =>
          r.id === action.id ? { ...r, [action.field]: action.field === 'cost' ? parseFloat(action.value) || 0 : action.field === 'tokens' ? parseInt(action.value) || 0 : action.value } : r
        ),
      }

    case 'UPDATE_RECHARGE_RECORD':
      return {
        ...state,
        rechargeRecords: state.rechargeRecords.map((r) =>
          r.id === action.id ? { ...r, [action.field]: action.field === 'amount' ? parseFloat(action.value) || 0 : action.value } : r
        ),
      }

    case 'UPDATE_DATA_CATEGORY':
      return {
        ...state,
        dataCategories: state.dataCategories.map((c) =>
          c.name === action.name ? { ...c, [action.field]: action.value } : c
        ),
      }

    case 'UPDATE_HOURLY_DATA': {
      const hourlyData = [...state.hourlyData]
      hourlyData[action.index] = action.value
      return { ...state, hourlyData }
    }

    case 'UPDATE_MODEL_USAGE':
      return {
        ...state,
        modelUsage: state.modelUsage.map((m) =>
          m.model === action.model ? { ...m, [action.field]: action.field === 'pct' ? parseInt(action.value) || 0 : action.value } : m
        ),
      }

    case 'LOAD_STATE':
      return action.state

    case 'ADD_RECHARGE': {
      const id = Date.now()
      const newBalance = Math.round((state.balance + action.amount) * 100) / 100
      return {
        ...state,
        balance: newBalance,
        rechargeRecords: [{ id, date: fmtDate(), amount: action.amount, method: action.method, status: 'Completed' }, ...state.rechargeRecords],
        transactions: [{ id: id + 1, date: fmtDateTime().slice(0, 16), type: '充值', amount: action.amount, desc: action.method + '充值' }, ...state.transactions],
        adminStats: state.adminStats.map((s) =>
          s.key === 'account_balance' ? { ...s, value: `$${newBalance.toFixed(2)}` } : s
        ),
      }
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DashboardCtx {
  state: DashboardState
  dispatch: Dispatch<DashboardAction>
}

const STORAGE_PREFIX = 'spenx-dash-'

function getCurrentUser(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)spenx-user=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function getStorageKey(): string {
  const user = getCurrentUser()
  return STORAGE_PREFIX + (user || 'anonymous')
}

function loadState(): DashboardState | null {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (raw) return migrateState(JSON.parse(raw))
  } catch {}
  return null
}

function migrateState(state: DashboardState): DashboardState {
  let migrated = false
  const adminStats = state.adminStats.map((s) => {
    if (s.key === 'total_revenue') {
      migrated = true
      return { key: 'account_balance' as const, label: '账户余额', value: `$${state.balance.toFixed(2)}`, editable: true }
    }
    if ((s.key === 'account_balance' || s.key === 'monthly_cost') && s.editable !== true) {
      migrated = true
      return { ...s, editable: true }
    }
    return s
  })
  const hasMonthlyCost = adminStats.some((s) => s.key === 'monthly_cost')
  if (!hasMonthlyCost) {
    migrated = true
    const m = new Date().getMonth()
    const monthlyCost = state.monthlyData[m]?.cost ?? 0
    adminStats.push({ key: 'monthly_cost', label: '本月费用', value: `$${monthlyCost.toFixed(2)}`, editable: true })
  }
  if (migrated) return { ...state, adminStats }
  return state
}

function saveState(state: DashboardState) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state))
  } catch {}
}

const DashboardContext = createContext<DashboardCtx | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, () => {
    const saved = loadState()
    if (saved) return saved
    const user = getCurrentUser()
    return user === 'admin' ? createInitialState() : createEmptyState()
  })

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (!state.isRealTimeActive) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [state.isRealTimeActive])

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
