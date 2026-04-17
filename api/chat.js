export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch(e) { return res.status(400).json({ error: 'Invalid JSON' }) }
  }

  // Try Anthropic — buffer the full response first to detect overload errors
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...body, stream: true }),
      })

      // Read the full response body first
      const text = await response.text()

      // Check for overload error in the response body
      if (text.includes('overloaded_error') || text.includes('Overloaded')) {
        console.log('Anthropic overloaded, falling back to OpenAI')
        // Fall through to OpenAI below
      } else if (!response.ok) {
        console.log('Anthropic error:', response.status, text.substring(0, 200))
        // Fall through to OpenAI below
      } else {
        // Success — stream the buffered response back
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.write(text)
        res.end()
        return
      }
    } catch(e) {
      console.log('Anthropic exception:', e.message)
      // Fall through to OpenAI
    }
  }

  // Fallback: OpenAI GPT-4o
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return res.status(503).json({ error: 'AI temporarily unavailable. Please try again shortly.' })
  }

  try {
    const messages = []
    if (body.system) messages.push({ role: 'system', content: body.system })
    for (const msg of (body.messages || [])) {
      if (typeof msg.content === 'string') {
        messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })
      } else if (Array.isArray(msg.content)) {
        const text = msg.content.filter(p => p.type === 'text').map(p => p.text).join('\n')
        if (text) messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: text })
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + openaiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: body.max_tokens || 1000,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(503).json({ error: 'AI temporarily unavailable: ' + errText.substring(0, 200) })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const text = parsed.choices?.[0]?.delta?.content || ''
          if (text) {
            // Emit in Anthropic SSE format so frontend works unchanged
            res.write('data: ' + JSON.stringify({ delta: { text } }) + '\n\n')
          }
        } catch(e) {}
      }
    }
    res.write('data: [DONE]\n\n')
    res.end()
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
