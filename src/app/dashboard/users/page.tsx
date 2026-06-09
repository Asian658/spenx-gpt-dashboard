'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface StoredUser {
  username: string
  password: string
  email?: string
  role?: string
  status?: string
  created?: string
}

const USERS_KEY = 'spenx-users'

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function EditableCell({ value, onSave, options }: { value: string; onSave: (v: string) => void; options?: string[] }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:bg-amber-50 hover:text-amber-700 px-1 -mx-1 rounded transition-colors"
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
        className="px-1 py-0.5 rounded border border-amber-300 text-sm bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
        autoFocus
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    )
  }

  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { onSave(draft); setEditing(false) }}
      onKeyDown={(e) => { if (e.key === 'Enter') { onSave(draft); setEditing(false) } }}
      className="px-1 py-0.5 rounded border border-amber-300 text-sm bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
      autoFocus
    />
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<StoredUser[]>([])
  const [mounted, setMounted] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: '用户' })

  useEffect(() => {
    setUsers(loadUsers())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveUsers(users)
  }, [users, mounted])

  function handleAdd() {
    if (!newUser.username || !newUser.password) return
    setUsers([
      ...users,
      {
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        created: new Date().toISOString().split('T')[0],
      },
    ])
    setNewUser({ username: '', password: '', email: '', role: '用户' })
    setShowAdd(false)
  }

  function handleDelete(username: string) {
    setUsers(users.filter((u) => u.username !== username))
  }

  function updateUser(username: string, field: string, value: string) {
    setUsers(users.map((u) => (u.username === username ? { ...u, [field]: value } : u)))
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">用户管理</h1>
          <p className="text-sm text-zinc-500 mt-1">管理注册用户（数据同步至登录系统）</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加用户
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="font-semibold text-zinc-900 text-sm mb-4">新建用户</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-zinc-600 mb-1">用户名</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="用户名"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">密码</label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="登录密码"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">邮箱</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">角色</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              >
                <option>用户</option>
                <option>管理员</option>
                <option>观察者</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
              确认添加
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm hover:bg-zinc-200">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50">
              <th className="text-left py-3 px-5 font-medium">用户名</th>
              <th className="text-left py-3 px-5 font-medium">邮箱</th>
              <th className="text-left py-3 px-5 font-medium">角色</th>
              <th className="text-left py-3 px-5 font-medium">状态</th>
              <th className="text-left py-3 px-5 font-medium">创建时间</th>
              <th className="text-right py-3 px-5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-400">暂无注册用户</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.username} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="py-3 px-5 text-zinc-900 font-medium">
                    <EditableCell value={user.username} onSave={(v) => updateUser(user.username, 'username', v)} />
                  </td>
                  <td className="py-3 px-5 text-zinc-600">
                    <EditableCell value={user.email || '-'} onSave={(v) => updateUser(user.username, 'email', v)} />
                  </td>
                  <td className="py-3 px-5">
                    <EditableCell
                      value={user.role || '用户'}
                      onSave={(v) => updateUser(user.username, 'role', v)}
                      options={['用户', '管理员', '观察者']}
                    />
                  </td>
                  <td className="py-3 px-5">
                    <EditableCell
                      value={user.status === 'active' ? '启用' : '禁用'}
                      onSave={(v) => updateUser(user.username, 'status', v === '启用' ? 'active' : 'disabled')}
                      options={['启用', '禁用']}
                    />
                  </td>
                  <td className="py-3 px-5 text-zinc-500">
                    <EditableCell value={user.created || '-'} onSave={(v) => updateUser(user.username, 'created', v)} />
                  </td>
                  <td className="py-3 px-5 text-right">
                    {user.username !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.username)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
