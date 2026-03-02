import { useState } from 'react'
import TransferCard from './TransferCard.jsx'
import Icon from './Icon.jsx'

// ============================================================
// Feed Header with Filters
// ============================================================
export function FeedHeader({ filter, onChange, totalCount }) {
  const filters = ['all', 'text', 'code', 'file', 'image']
  return (
    <div style={{
      padding: '11px 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Transfer Feed</span>
        <span style={{
          display: 'inline-flex', padding: '1px 8px', borderRadius: 99,
          fontSize: 10, fontWeight: 700,
          background: 'var(--accent-light)', color: 'var(--accent)',
        }}>{totalCount}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => onChange(f)}
            style={{
              padding: '4px 10px', borderRadius: 99,
              fontSize: 11, fontWeight: 600,
              border: filter === f ? 'none' : '1px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text3)',
              cursor: 'pointer', fontFamily: 'var(--font)',
              transition: 'all 0.15s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Transfer Feed
// ============================================================
export function TransferFeed({ transfers, filter, onDelete }) {
  const filtered = filter === 'all' ? transfers : transfers.filter(t => t.type === filter)

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: 14,
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'var(--bg)',
    }}>
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14, opacity: 0.45,
          minHeight: 280, textAlign: 'center',
        }}>
          <div style={{ fontSize: 44 }}>🔄</div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
              {transfers.length === 0
                ? 'Connected! Start sharing from the left panel.'
                : 'No items match this filter.'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>
              Shared content appears here in real time.
            </p>
          </div>
        </div>
      )}

      {[...filtered].reverse().map(item => (
        <TransferCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  )
}

// ============================================================
// History Sidebar
// ============================================================
export function HistorySidebar({ open, transfers, onClose }) {
  const [q, setQ] = useState('')

  const filtered = q.trim()
    ? transfers.filter(t => {
        const haystack = (t.content || t.name || t.type || '').toLowerCase()
        return haystack.includes(q.toLowerCase())
      })
    : transfers

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
        />
      )}
      <div style={{
        position: 'fixed',
        right: 0, top: 60, bottom: 0,
        width: 288,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? 'var(--shadow-lg)' : 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '13px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            📋 Session History
          </span>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 7,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text2)', cursor: 'pointer',
            }}
          >
            <Icon name="x" size={13} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Icon
              name="search"
              size={13}
              style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}
            />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search transfers…"
              style={{
                width: '100%', padding: '7px 10px 7px 30px',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
                background: 'var(--surface2)', fontFamily: 'var(--font)',
                fontSize: 12, color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[...filtered].reverse().map(item => {
            const preview = (item.content || item.name || '').slice(0, 55)
            return (
              <div
                key={item.id}
                style={{
                  padding: '9px 12px',
                  border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                  fontSize: 12, cursor: 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                  {item.type} · {item.direction} · {item.time}
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preview || `(${item.type})`}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>
              {q ? 'No matching results' : 'No transfers yet'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text3)' }}>
            <Icon name="shield" size={11} />
            History not stored server-side
          </div>
        </div>
      </div>
    </>
  )
}
