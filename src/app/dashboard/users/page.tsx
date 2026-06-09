'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const initialUsers = [
  { id: 1, name: 'Admin', email: 'admin@example.com', role: '管理员', status: 'active', created: '2026-01-15' },
  { id: 2, name: '张三', email: 'zhangsan@example.com', role: '用户', status: 'active', created: '2026-03-20' },
  { id: 3, name: '李四', email: 'lisi@example.com', role: '用户', status: 'active', created: '2026-04-10' },
  { id: 4, name: '王五', email: 'wangwu@example.com', role: '观察者', status: 'disabled', created: '2026-05-05' },
]

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '用户' })

  function handleAdd() {
    if (!newUser.name || !newUser.email) return
    setUsers([
      ...users,
      {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        created: new Date().toISOString().split('T')[0],
      },
    ])
    setNewUser({ name: '', email: '', role: '用户' })
    setShowAdd(false)
  }

  function handleDelete(id: number) {
    setUsers(users.filter((u) => u.id !== id))
  }

  function toggleStatus(id: number) {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">用户管理</h1>
          <p className="text-sm text-zinc-500 mt-1">管理系统用户和权限</p>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-600 mb-1">姓名</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="用户名"
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
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
            >
              确认添加
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
              <th className="text-left py-3 px-5 font-medium">用户</th>
              <th className="text-left py-3 px-5 font-medium">邮箱</th>
              <th className="text-left py-3 px-5 font-medium">角色</th>
              <th className="text-left py-3 px-5 font-medium">状态</th>
              <th className="text-left py-3 px-5 font-medium">创建时间</th>
              <th className="text-right py-3 px-5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="py-3 px-5 text-zinc-900 font-medium">{user.name}</td>
                <td className="py-3 px-5 text-zinc-600">{user.email}</td>
                <td className="py-3 px-5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === '管理员' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {user.status === 'active' ? '启用' : '禁用'}
                  </button>
                </td>
                <td className="py-3 px-5 text-zinc-500">{user.created}</td>
                <td className="py-3 px-5 text-right">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
