// ============================================================
// AIService — Clipboard Assistant via Anthropic API
// Operates ONLY on session content. Never stores outputs.
// ============================================================

const MODEL = 'claude-sonnet-4-20250514'
const API_URL = '/api/analyze'

/**
 * Build a prompt for the given transfer item type.
 */
function buildPrompt(item) {
  const MAX_CONTENT = 2000

  switch (item.type) {
    case 'text':
      return `Analyze this shared text concisely:
1) One-sentence summary
2) Key points (max 3 bullet points)
3) Suggested actions or uses

Text:
"""
${(item.content || '').slice(0, MAX_CONTENT)}
"""`

    case 'code':
      return `Analyze this ${item.lang || 'code'} snippet concisely:
1) What it does (one sentence)
2) Any bugs, issues, or improvements
3) Code quality notes

Code:
"""
${(item.content || '').slice(0, MAX_CONTENT)}
"""`

    case 'image':
      return `A file named "${item.name}" (${formatBytes(item.size)}) was shared. Based on the filename and file size:
1) Describe what this image likely contains
2) Suggest 2-3 actions the recipient might want to take with it`

    case 'file':
      return `A file named "${item.name}" (${formatBytes(item.size)}, type: ${item.mimeType || 'unknown'}) was shared.
1) Describe what this file likely contains
2) Suggest 2-3 useful actions for this file type`

    default:
      return `Briefly describe this transferred content: ${JSON.stringify(item).slice(0, 500)}`
  }
}

/**
 * Run Smart Actions AI analysis on a transfer item.
 * Returns the AI response string.
 */
export async function analyzeItem(item) {
  const prompt = buildPrompt(item)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system:
        'You are a secure clipboard assistant. You analyze shared content to help users understand and act on it. Be concise, practical, and security-aware. Never request external data.',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content
    ?.filter(c => c.type === 'text')
    .map(c => c.text)
    .join('') || 'No analysis returned.'
}

function formatBytes(b) {
  if (!b) return '0 B'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}
