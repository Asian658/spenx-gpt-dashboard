'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot } from 'lucide-react'

interface Msg {
  role: 'user' | 'assistant'
  text: string
}

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    const updated: Msg[] = [...msgs, { role: 'user', text }]
    setMsgs(updated)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map((m) => ({ role: m.role, content: m.text })) }),
      })
      const data = await res.json()
      if (data.error) {
        setMsgs([...updated, { role: 'assistant', text: 'Error: ' + JSON.stringify(data.error) }])
      } else {
        setMsgs([...updated, { role: 'assistant', text: data.text }])
      }
    } catch (e: any) {
      setMsgs([...updated, { role: 'assistant', text: 'Network error: ' + e.message }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-white">
      <div className="px-4 py-3 border-b border-zinc-800 text-center text-sm font-medium text-zinc-400">
        Claude Chat
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {msgs.length === 0 && (
          <div className="text-center text-zinc-500 mt-20">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">发送消息开始对话</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-blue-600 rounded-br-md' : 'bg-zinc-800 rounded-bl-md'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="输入消息..."
            className="flex-1 bg-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-blue-600 rounded-xl px-4 py-2.5 disabled:opacity-40 hover:bg-blue-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
