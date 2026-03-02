// ============================================================
// Utility Functions
// ============================================================

export const BLOCKED_EXTS = ['exe', 'apk', 'bat', 'sh', 'msi', 'cmd', 'vbs', 'ps1', 'jar', 'dmg', 'scr', 'pif', 'com']
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
export const SESSION_HARD_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours

/**
 * Generate a random 6-character alphanumeric session code.
 * Excludes ambiguous characters (0, O, I, L).
 */
export function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Generate a unique transfer item ID.
 */
export function genId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(1)} GB`
}

/**
 * Format milliseconds to M:SS string.
 */
export function fmtDuration(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

/**
 * Get current time as a short locale string.
 */
export function timeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Get a display emoji for a given file name.
 */
export function getFileIcon(name = '') {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const map = {
    pdf: '📄',
    doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊', csv: '📊',
    ppt: '📑', pptx: '📑',
    zip: '🗜️', rar: '🗜️', '7z': '🗜️', tar: '🗜️', gz: '🗜️',
    mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬', webm: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵',
    txt: '📃', md: '📃', log: '📃',
    js: '⚡', ts: '⚡', jsx: '⚡', tsx: '⚡',
    py: '🐍',
    json: '🔧', xml: '🔧', yaml: '🔧', yml: '🔧',
    svg: '🎨', fig: '🎨',
  }
  return map[ext] || '📁'
}

/**
 * Validate a file before upload.
 * Returns { valid: boolean, error?: string }
 */
export function validateFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''

  if (BLOCKED_EXTS.includes(ext)) {
    return { valid: false, error: `File type .${ext} is blocked for security reasons` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds the 100MB size limit (${formatBytes(file.size)})` }
  }

  if (file.size === 0) {
    return { valid: false, error: 'Cannot share empty files' }
  }

  return { valid: true }
}

/**
 * Read a file as a Data URL (base64).
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Trigger a browser download from a data URL.
 */
export function triggerDownload(dataUrl, fileName) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName || 'download'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Save recent session to localStorage.
 */
export function saveRecentSession(code, itemCount) {
  try {
    const recent = JSON.parse(localStorage.getItem('cs2_recent') || '[]')
    recent.unshift({
      code,
      date: new Date().toLocaleDateString(),
      time: timeStr(),
      count: itemCount,
    })
    localStorage.setItem('cs2_recent', JSON.stringify(recent.slice(0, 5)))
  } catch {
    // localStorage may not be available
  }
}

/**
 * Load recent sessions from localStorage.
 */
export function loadRecentSessions() {
  try {
    return JSON.parse(localStorage.getItem('cs2_recent') || '[]')
  } catch {
    return []
  }
}

/**
 * Simulate an upload progress animation, calling onProgress(pct) during.
 * Calls onComplete() when done.
 */
export function simulateUploadProgress(onProgress, onComplete) {
  let pct = 0
  const interval = setInterval(() => {
    pct += Math.random() * 22
    if (pct >= 100) {
      pct = 100
      clearInterval(interval)
      onProgress(100)
      setTimeout(onComplete, 300)
    } else {
      onProgress(Math.min(pct, 99))
    }
  }, 60)
  return () => clearInterval(interval)
}
