import { useRef } from 'react'
import Icon from './Icon.jsx'

const SECURITY_FEATURES = [
  ['🔐', 'AES-256-GCM Encrypted'],
  ['⏱', '30-min session timeout'],
  ['👁', 'No server-side storage'],
  ['🔑', 'Ephemeral ECDH keys'],
  ['🌐', 'WebRTC peer-to-peer'],
  ['🚫', 'No account required'],
]

function FeatureCard({ icon, title, desc, action, actionLabel, secondaryAction, secondaryLabel, accentColor = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '30px 26px',
      cursor: 'pointer',
      transition: 'all 0.22s',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = accentColor
      e.currentTarget.style.transform = 'translateY(-3px)'
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    onClick={action}
    >
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 20 }}>{desc}</p>

      <button
        onClick={e => { e.stopPropagation(); action() }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          width: '100%', padding: '10px', borderRadius: 'var(--r-sm)',
          background: accentColor, color: 'white', border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font)',
          boxShadow: `0 2px 10px ${accentColor}44`,
          marginBottom: secondaryAction ? 10 : 0,
          transition: 'all 0.15s',
        }}
      >
        {actionLabel}
      </button>

      {secondaryAction && (
        <div
          onClick={e => { e.stopPropagation(); secondaryAction() }}
          style={{ cursor: 'pointer' }}
        >
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export default function HomeScreen({ onNewSession, onJoinSession, recentSessions }) {
  const codeRef = useRef(null)

  const joinWithCode = () => {
    const code = codeRef.current?.value?.trim().toUpperCase()
    if (code?.length === 6) onJoinSession(code)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: 'calc(100vh - 60px)', padding: '56px 20px 40px',
      animation: 'fadeUp 0.4s ease',
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 99,
          background: 'var(--green-light)',
          border: '1px solid rgba(163,190,140,0.4)',
          fontSize: 11, fontWeight: 600, color: '#3d6b2a',
          marginBottom: 22, letterSpacing: '0.01em',
        }}>
          <Icon name="shield" size={11} />
          End-to-end encrypted · No login · No permanent storage
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800, letterSpacing: '-0.05em',
          color: 'var(--text)', lineHeight: 1.08, marginBottom: 16,
        }}>
          Secure transfer,<br />
          <span style={{ color: 'var(--accent)' }}>instant connection.</span>
        </h1>

        <p style={{
          fontSize: 14, color: 'var(--text2)', maxWidth: 460, margin: '0 auto',
          lineHeight: 1.75, fontWeight: 400,
        }}>
          A temporary device bridge. Pair in seconds via QR, share anything end-to-end encrypted —
          sessions expire automatically, keys are destroyed on disconnect.
        </p>
      </div>

      {/* Action Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18, width: '100%', maxWidth: 680, marginBottom: 44,
      }}>
        {/* Start Session */}
        <FeatureCard
          icon="📡"
          title="Start Session"
          desc="Generate a QR code. Your second device scans it to create a secure, encrypted bridge. Keys never leave your device."
          actionLabel={<><Icon name="zap" size={14} /> New Session</>}
          action={onNewSession}
          accentColor="var(--accent)"
        />

        {/* Join Session */}
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '30px 26px',
          transition: 'all 0.22s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ fontSize: 32, marginBottom: 16 }}>📷</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Join Session</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 18 }}>
            Scan a QR code from a host device, or enter the 6-character session code to connect securely.
          </p>

          <button
            onClick={() => onJoinSession()}
            style={{
              width: '100%', padding: 10, borderRadius: 'var(--r-sm)',
              background: 'rgba(143,188,187,0.15)',
              border: '1px solid rgba(143,188,187,0.35)',
              color: '#2d6462', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              marginBottom: 10,
              transition: 'all 0.15s',
            }}
          >
            📷 Scan QR Code
          </button>

          <div style={{ display: 'flex', gap: 7 }}>
            <input
              ref={codeRef}
              placeholder="ABC123"
              maxLength={6}
              onInput={e => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')}
              onKeyDown={e => e.key === 'Enter' && joinWithCode()}
              style={{
                flex: 1, padding: '9px 13px',
                fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '0.18em',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
                background: 'var(--surface2)', color: 'var(--accent)', fontWeight: 600,
                outline: 'none', textAlign: 'center',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={joinWithCode}
              style={{
                padding: '9px 16px', borderRadius: 'var(--r-sm)',
                background: 'var(--accent)', color: 'white', border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font)',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}
            >
              <Icon name="link" size={13} /> Join
            </button>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: 44, maxWidth: 680,
      }}>
        {SECURITY_FEATURES.map(([icon, label]) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--text2)', fontWeight: 500,
          }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div style={{ width: '100%', maxWidth: 680 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>
            Recent Sessions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {recentSessions.slice(0, 4).map((s, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '10px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="link" size={13} style={{ color: 'var(--text3)' }} />
                  <div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                      {s.code}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
                      {s.date} · {s.count} item{s.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 99,
                  background: 'var(--red-light)', color: 'var(--red)', fontWeight: 600,
                }}>
                  Expired
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
