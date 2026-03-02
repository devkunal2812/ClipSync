import { useState } from 'react'
import Icon from './Icon.jsx'
import { AIConfirmModal } from './Modals.jsx'
import { analyzeItem } from '../services/ai.js'
import { formatBytes, getFileIcon, triggerDownload } from '../utils/index.js'

const BADGE_STYLES = {
  text:  { bg: 'rgba(129,161,193,0.12)', color: '#5E81AC' },
  code:  { bg: 'rgba(180,142,173,0.14)', color: '#9a6fad' },
  file:  { bg: 'rgba(208,135,112,0.12)', color: '#c4673c' },
  image: { bg: 'rgba(163,190,140,0.15)', color: '#3d6b2a' },
}

function TypeBadge({ type }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.text
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
      background: s.bg, color: s.color,
    }}>
      {type}
    </span>
  )
}

function ActionBtn({ onClick, children, variant = 'secondary' }) {
  const variants = {
    secondary: { bg: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' },
    teal:      { bg: 'rgba(143,188,187,0.12)', color: '#2d6462', border: '1px solid rgba(143,188,187,0.3)' },
    ghost:     { bg: 'transparent', color: 'var(--text3)', border: '1px solid var(--border)' },
  }
  const v = variants[variant] || variants.secondary
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 11px', borderRadius: 7,
        fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font)', transition: 'all 0.15s',
        background: v.bg, color: v.color, border: v.border,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  )
}

function AIPanel({ loading, result }) {
  if (!loading && !result) return null
  return (
    <div style={{
      marginTop: 12, padding: 12,
      background: 'linear-gradient(135deg, rgba(94,129,172,0.06), rgba(143,188,187,0.08))',
      borderRadius: 'var(--r-sm)',
      border: '1px solid rgba(94,129,172,0.15)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        fontSize: 10, fontWeight: 700, color: 'var(--accent)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        <Icon name="sparkles" size={11} />
        AI Analysis
      </div>
      {loading ? (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[0, 0.15, 0.3].map((d, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
              animation: `pulse 1.2s ${d}s ease-in-out infinite`,
            }} />
          ))}
          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text3)' }}>Analyzing…</span>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {result}
        </div>
      )}
    </div>
  )
}

export default function TransferCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [viewed, setViewed] = useState(false)
  const [showAIConfirm, setShowAIConfirm] = useState(false)
  const [aiLoading, setAILoading] = useState(false)
  const [aiResult, setAIResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // Secure send — viewed state
  if (item.secureSend && viewed) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r)', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        opacity: 0.5,
      }}>
        <Icon name="eye-off" size={13} style={{ color: 'var(--text3)' }} />
        <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
          Content viewed and removed (Secure Send)
        </span>
      </div>
    )
  }

  const copyContent = () => {
    const text = item.content || ''
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    triggerDownload(item.src || item.data, item.name || 'download')
  }

  const openImagePreview = () => {
    if (item.secureSend) setViewed(true)
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(6px);animation:fadeIn 0.2s'
    overlay.innerHTML = `<img src="${item.src}" style="max-width:90vw;max-height:90vh;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,0.5)">`
    overlay.onclick = () => overlay.remove()
    document.body.appendChild(overlay)
  }

  const runAI = async () => {
    setShowAIConfirm(false)
    setAILoading(true)
    setAIResult(null)
    try {
      const result = await analyzeItem(item)
      setAIResult(result)
    } catch (err) {
      setAIResult(`Could not analyze: ${err.message}`)
    }
    setAILoading(false)
  }

  const borderColor = item.direction === 'outgoing' ? 'var(--accent)' : 'var(--teal)'
  const dirLabel = item.direction === 'outgoing' ? '↑ Sent' : '↓ Received'

  return (
    <>
      {showAIConfirm && <AIConfirmModal onConfirm={runAI} onCancel={() => setShowAIConfirm(false)} />}

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 'var(--r)',
        padding: '14px 16px',
        animation: 'cardIn 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <TypeBadge type={item.type} />
            <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>{dirLabel}</span>
            {item.secureSend && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 7px', borderRadius: 99,
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                background: 'rgba(163,190,140,0.12)', color: '#3d6b2a',
              }}>
                <Icon name="eye" size={9} /> Secure
              </span>
            )}
            {item.encrypted && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 7px', borderRadius: 99,
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                background: 'var(--accent-light)', color: 'var(--accent)',
              }}>
                <Icon name="lock" size={9} /> Enc
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>{item.time}</span>
            <button
              onClick={() => onDelete(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 7,
                background: 'none', border: 'none',
                color: 'var(--text3)', cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <Icon name="trash" size={12} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 10 }}>
          {item.type === 'text' && (
            <div style={{
              fontSize: 13, color: 'var(--text)', lineHeight: 1.75,
              maxHeight: expanded ? 'none' : 96, overflow: 'hidden',
              maskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 55%, transparent)',
              WebkitMaskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 55%, transparent)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              cursor: item.secureSend ? 'pointer' : 'default',
            }}
            onClick={() => item.secureSend && setViewed(true)}
            >
              {item.content}
            </div>
          )}

          {item.type === 'code' && (
            <div style={{
              borderRadius: 10, overflow: 'hidden',
              maxHeight: expanded ? 'none' : 120,
              overflow: expanded ? 'visible' : 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 12px',
                background: '#1e2739',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(216,222,233,0.45)' }}>
                  {item.lang || 'code'}
                </span>
              </div>
              <pre style={{
                background: '#1c2333', margin: 0,
                padding: '12px 14px',
                fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 1.8,
                color: '#d8dee9', overflowX: 'auto',
              }}>
                <code>{item.content}</code>
              </pre>
            </div>
          )}

          {item.type === 'image' && (
            <div onClick={openImagePreview} style={{ cursor: 'zoom-in' }}>
              <img
                src={item.src}
                alt={item.name}
                style={{
                  maxWidth: '100%', maxHeight: 180,
                  borderRadius: 8, display: 'block', objectFit: 'contain',
                  border: '1px solid var(--border)',
                }}
              />
              {item.name && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
                  {item.name} · {formatBytes(item.size)}
                </div>
              )}
            </div>
          )}

          {item.type === 'file' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: 'var(--surface2)',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 28 }}>{getFileIcon(item.name)}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {formatBytes(item.size)}{item.mimeType ? ` · ${item.mimeType}` : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {(item.type === 'text' || item.type === 'code') && (
            <ActionBtn onClick={copyContent}>
              <Icon name={copied ? 'check' : 'copy'} size={12} />
              {copied ? 'Copied!' : 'Copy'}
            </ActionBtn>
          )}
          {item.type === 'text' && (
            <ActionBtn onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Collapse' : 'Expand'}
            </ActionBtn>
          )}
          {item.type === 'code' && (
            <ActionBtn onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Collapse' : 'Expand'}
            </ActionBtn>
          )}
          {(item.type === 'file' || item.type === 'image') && (
            <ActionBtn onClick={download} variant="teal">
              <Icon name="download" size={12} />
              Download
            </ActionBtn>
          )}
          <ActionBtn onClick={() => setShowAIConfirm(true)} variant="ghost" style={{ marginLeft: 'auto' }}>
            <Icon name="sparkles" size={12} />
            Smart Actions
          </ActionBtn>
        </div>

        <AIPanel loading={aiLoading} result={aiResult} />
      </div>
    </>
  )
}
