import { NextRequest } from 'next/server'

const BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages'
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) return Response.json({ error: 'API key not configured' }, { status: 500 })

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        messages,
      }),
    })

    const data = await res.json()
    if (!res.ok) return Response.json({ error: data }, { status: res.status })

    const text = data.content?.[0]?.text || ''
    return Response.json({ text })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
