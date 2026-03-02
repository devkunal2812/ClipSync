import { useState } from 'react'
import Icon from './Icon.jsx'

function StatusPill({ connected, peerName, duration }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 'var(--r-full)',
      background: connected ? 'var(--green-light)' : 'var(--surface)',
      border: `1px solid ${connected ? 'rgba(163,190,140,0.4)' : 'var(--border)'}`,
      transition: 'all 0.3s',
      fontSize: 12,
      fontWeight: 600,
    }}>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: connected ? 'var(--green)' : 'var(--text3)',
        animation: connected ? 'pulseDot 2s infinite' : 'none',
        flexShrink: 0,
      }} />
      <span style={{ color: connected ? '#3d6b2a' : 'var(--text2)' }}>
        {connected ? (peerName || 'Connected') : 'No Session'}
      </span>
      {connected && duration && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
          {duration}
        </span>
      )}
    </div>
  )
}

function SecurityBadge({ fingerprint }) {
  const [showFP, setShowFP] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowFP(s => !s)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          borderRadius: 'var(--r-full)',
          background: 'var(--green-light)',
          border: '1px solid rgba(163,190,140,0.35)',
          color: '#3d6b2a',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font)',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        E2E Encrypted
      </button>
      {showFP && fingerprint && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          padding: '12px 14px',
          width: 260,
          boxShadow: 'var(--shadow-md)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Session Fingerprint
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', wordBreak: 'break-all', letterSpacing: '0.06em', marginBottom: 8 }}>
            {fingerprint}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
            Verify this fingerprint with your peer out-of-band to confirm end-to-end encryption.
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header({ connected, peerName, duration, fingerprint, onDisconnect, onToggleSidebar }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--teal) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(94,129,172,0.35)',
        }}>
          <Icon name="zap" size={16} style={{ color: 'white' }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            ClipSync
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: -1 }}>
            v2.0 · Secure
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatusPill connected={connected} peerName={peerName} duration={duration} />
        {connected && <SecurityBadge fingerprint={fingerprint} />}
        {connected && (
          <>
            <button
              onClick={onToggleSidebar}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 8, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text2)', cursor: 'pointer',
              }}
            >
              <Icon name="menu" size={15} />
            </button>
            <button
              onClick={onDisconnect}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--r-sm)',
                background: 'var(--red-light)',
                border: '1px solid rgba(191,97,106,0.2)',
                color: 'var(--red)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </header>
  )
}
