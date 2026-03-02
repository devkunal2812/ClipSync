import { useState, useRef } from 'react'
import Icon from './Icon.jsx'
import { validateFile, readFileAsDataURL, simulateUploadProgress } from '../utils/index.js'

// ============================================================
// Shared Styles
// ============================================================
const inputBase = {
  width: '100%',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  padding: '12px 14px',
  fontFamily: 'var(--font)',
  fontSize: 13,
  lineHeight: 1.75,
  color: 'var(--text)',
  background: 'var(--surface2)',
  outline: 'none',
  resize: 'none',
  transition: 'border-color 0.15s, background 0.15s',
}

function ShareBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: 11, borderRadius: 'var(--r-sm)',
        background: 'var(--accent)', color: 'white', border: 'none',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        boxShadow: '0 2px 10px rgba(94,129,172,0.28)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#4f6d93'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  )
}

// ============================================================
// Secure Send Toggle
// ============================================================
export function SecureSendToggle({ enabled, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderRadius: 'var(--r-sm)',
        background: enabled ? 'rgba(163,190,140,0.08)' : 'var(--surface2)',
        border: `1px solid ${enabled ? 'rgba(163,190,140,0.35)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="eye" size={13} style={{ color: enabled ? '#3d6b2a' : 'var(--text3)' }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: enabled ? '#3d6b2a' : 'var(--text2)' }}>
            Secure Send
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>
            Auto-delete after first view
          </div>
        </div>
      </div>
      <div style={{
        width: 34, height: 18, borderRadius: 99, position: 'relative',
        background: enabled ? 'var(--green)' : 'rgba(94,129,172,0.2)',
        transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: enabled ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }} />
      </div>
    </div>
  )
}

// ============================================================
// Text Input Panel
// ============================================================
export function TextInputPanel({ onShare }) {
  const [value, setValue] = useState('')
  const [secureSend, setSecureSend] = useState(false)

  const share = () => {
    if (!value.trim()) return
    onShare({ type: 'text', content: value, secureSend })
    setValue('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, padding: '14px 16px 0' }}>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') share() }}
        placeholder="Paste or type text to share…&#10;Ctrl+Enter to send"
        style={{ ...inputBase, flex: 1, minHeight: 160 }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = '#fff' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface2)' }}
      />
      <SecureSendToggle enabled={secureSend} onToggle={() => setSecureSend(s => !s)} />
      <ShareBtn onClick={share}>
        <Icon name="send" size={14} />
        Share Text
      </ShareBtn>
    </div>
  )
}

// ============================================================
// Code Input Panel
// ============================================================
const LANGS = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java',
  'cpp', 'c', 'csharp', 'html', 'css', 'scss',
  'json', 'yaml', 'toml', 'sql', 'bash', 'shell',
  'markdown', 'plaintext',
]

export function CodeInputPanel({ onShare }) {
  const [code, setCode] = useState('')
  const [lang, setLang] = useState('javascript')
  const [secureSend, setSecureSend] = useState(false)

  const share = () => {
    if (!code.trim()) return
    onShare({ type: 'code', content: code, lang, secureSend })
    setCode('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, padding: '12px 16px 0' }}>
      <select
        value={lang}
        onChange={e => setLang(e.target.value)}
        style={{
          padding: '7px 12px', borderRadius: 'var(--r-sm)',
          border: '1.5px solid var(--border)', background: 'var(--surface2)',
          fontFamily: 'var(--font)', fontSize: 12, color: 'var(--text)',
          cursor: 'pointer', outline: 'none',
        }}
      >
        {LANGS.map(l => (
          <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
        ))}
      </select>

      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') share() }}
        placeholder={`// Paste ${lang} code here…\n// Ctrl+Enter to send`}
        spellCheck={false}
        style={{
          ...inputBase,
          fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.85,
          background: '#1c2333', color: '#d8dee9', border: '1.5px solid rgba(216,222,233,0.1)',
          flex: 1, minHeight: 160,
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(94,129,172,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(216,222,233,0.1)'}
      />

      <SecureSendToggle enabled={secureSend} onToggle={() => setSecureSend(s => !s)} />
      <ShareBtn onClick={share}>
        <Icon name="send" size={14} />
        Share Code
      </ShareBtn>
    </div>
  )
}

// ============================================================
// File Input Panel
// ============================================================
export function FileInputPanel({ onShare, onToast }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState(null)
  const [secureSend, setSecureSend] = useState(false)
  const cancelRef = useRef(null)
  const fileRef = useRef(null)

  const processFile = async (file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      onToast(validation.error, 'error')
      return
    }

    setCurrentFile(file.name)
    setUploading(true)
    setProgress(0)

    cancelRef.current = simulateUploadProgress(
      (pct) => setProgress(pct),
      async () => {
        setUploading(false)
        setCurrentFile(null)
        try {
          const dataUrl = await readFileAsDataURL(file)
          const isImage = file.type.startsWith('image/')
          onShare({
            type: isImage ? 'image' : 'file',
            name: file.name,
            size: file.size,
            mimeType: file.type,
            src: isImage ? dataUrl : null,
            data: !isImage ? dataUrl : null,
            secureSend,
          })
        } catch {
          onToast('Failed to read file', 'error')
        }
      }
    )
  }

  const handleFiles = (files) => {
    Array.from(files).forEach(processFile)
  }

  const cancelUpload = () => {
    if (cancelRef.current) cancelRef.current()
    setUploading(false)
    setProgress(0)
    setCurrentFile(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, padding: '14px 16px 0' }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          flex: 1, minHeight: 160,
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--r)',
          background: dragOver ? 'var(--accent-light)' : 'var(--surface2)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', padding: 20, textAlign: 'center',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
        />
        <div style={{ fontSize: 32, opacity: dragOver ? 1 : 0.4 }}>
          {dragOver ? '📂' : '📁'}
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: dragOver ? 'var(--accent)' : 'var(--text2)' }}>
          {uploading ? `Encrypting ${currentFile}…` : dragOver ? 'Drop to share' : 'Drag & drop or click to browse'}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text3)' }}>
          Images · PDFs · Documents · Text — max 100MB
        </p>
        <p style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600 }}>
          Blocked: .exe .apk .bat .sh .msi .cmd .vbs
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              🔐 Encrypting & preparing…
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
                {Math.round(progress)}%
              </span>
              <button
                onClick={cancelUpload}
                style={{
                  fontSize: 10, color: 'var(--red)', background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div style={{ height: 4, background: 'var(--n5)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--teal))',
              backgroundSize: '200% 100%',
              borderRadius: 99, transition: 'width 0.1s',
              animation: progress < 100 ? 'progressFlow 1.5s linear infinite' : 'none',
            }} />
          </div>
        </div>
      )}

      <SecureSendToggle enabled={secureSend} onToggle={() => setSecureSend(s => !s)} />
    </div>
  )
}
