'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface StoredUser {
  username: string
  password: string
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('spenx-users')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem('spenx-users', JSON.stringify(users))
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (document.cookie.includes('token=demo')) {
      router.push('/dashboard')
    }
  }, [router])

  function validate(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin123') return true
    const users = loadUsers()
    return users.some(u => u.username === username && u.password === password)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (validate(username, password)) {
      document.cookie = `spenx-user=${encodeURIComponent(username)};path=/;max-age=86400`
      document.cookie = 'token=demo;path=/;max-age=86400'
      router.push('/dashboard')
    } else {
      setError('用户名或密码错误')
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !password) {
      setError('请填写所有字段')
      return
    }

    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }

    const users = loadUsers()
    if (users.some(u => u.username === username)) {
      setError('用户名已存在')
      return
    }

    if (username === 'admin') {
      setError('该用户名不可用')
      return
    }

    users.push({ username, password })
    saveUsers(users)
    setSuccess('注册成功，请登录')
    setMode('login')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">spenx GPT</h1>
            <p className="text-sm text-zinc-500 mt-2">
              {mode === 'login' ? '登录到管理后台' : '创建新账户'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <p className="text-center text-xs text-zinc-400">
                还没有账户？{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); setSuccess('') }} className="text-zinc-900 font-medium hover:underline">
                  注册
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="输入用户名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="至少 6 位"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="再次输入密码"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                注册
              </button>

              <p className="text-center text-xs text-zinc-400">
                已有账户？{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-zinc-900 font-medium hover:underline">
                  登录
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
