import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

// ---- QR Matrix Generator ----
function generateQRMatrix(text) {
  const size = 25
  const mat = Array.from({ length: size }, () => Array(size).fill(0))
  // Finder patterns top-left, top-right, bottom-left
  ;[[0, 0], [0, 17], [17, 0]].forEach(([r, c]) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        mat[r + i][c + j] =
          i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4) ? 1 : 0
      }
    }
  })
  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    mat[6][i] = i % 2 === 0 ? 1 : 0
    mat[i][6] = i % 2 === 0 ? 1 : 0
  }
  // Data fill based on text hash
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (mat[r][c] !== 0) continue
      if ((r < 9 && c < 9) || (r < 9 && c > 15) || (r > 15 && c < 9)) continue
      mat[r][c] = ((hash ^ (r * 31 + c * 17)) & 1) ? 1 : 0
      hash = ((hash << 3) ^ (r + c * 7)) | 0
    }
  }
  return mat
}

function QRCode({ value, size = 192 }) {
  const mat = generateQRMatrix(value)
  const n = mat.length
  const cell = size / n
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {mat.flatMap((row, r) =>
        row.map((v, c) =>
          v ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#2E3440" /> : null
        )
      )}
      {/* Logo mark in center */}
      <rect x={size/2 - 14} y={size/2 - 14} width={28} height={28} rx={5} fill="white" />
      <rect x={size/2 - 11} y={size/2 - 11} width={22} height={22} rx={4} fill="#5E81AC" />
      <polygon points={`${size/2+2},${size/2-6} ${size/2-4},${size/2+2} ${size/2+1},${size/2+2} ${size/2-1},${size/2+8} ${size/2+5},${size/2} ${size/2+1},${size/2} ${size/2+2},${size/2-6}`} fill="white" />
    </svg>
  )
}

// ---- Modal Overlay ----
export function ModalOverlay({ children, onClose, maxWidth = 440 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(30,36,51,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: 22,
        padding: '36px 40px',
        width: '100%',
        maxWidth,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        animation: 'fadeUp 0.25s ease',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="x" size={14} />
        </button>
        {children}
      </div>
    </div>
  )
}

// ---- QR Modal ----
export function QRModal({ code, onClose, onSimulatePeer }) {
  const [secondsLeft, setSecondsLeft] = useState(300)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const pct = (secondsLeft / 300) * 100

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>📡</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6, color: 'var(--text)' }}>
          New Session
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>
          Scan on your second device, or enter the code manually
        </p>

        {/* QR */}
        <div style={{
          display: 'inline-flex',
          padding: 16,
          borderRadius: 16,
          background: 'white',
          border: '2px solid var(--border)',
          marginBottom: 20,
          boxShadow: 'var(--shadow)',
        }}>
          <QRCode value={`clipsync://join?code=${code}`} size={192} />
        </div>

        {/* Code */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700,
            letterSpacing: '0.22em', color: 'var(--accent)',
          }}>
            {code}
          </span>
          <button
            onClick={copy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 8, borderRadius: 8, width: 34, height: 34,
              background: copied ? 'var(--green-light)' : 'var(--surface2)',
              border: `1px solid ${copied ? 'rgba(163,190,140,0.4)' : 'var(--border)'}`,
              color: copied ? '#3d6b2a' : 'var(--text2)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Icon name={copied ? 'check' : 'copy'} size={14} />
          </button>
        </div>

        {/* Timer */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 3, background: 'var(--n5)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct > 40 ? 'var(--green)' : 'var(--red)',
              borderRadius: 99,
              transition: 'width 1s linear, background 0.5s',
            }} />
          </div>
          <span style={{
            fontSize: 11, fontFamily: 'var(--mono)',
            color: secondsLeft < 60 ? 'var(--red)' : 'var(--text3)',
            animation: secondsLeft < 60 ? 'countdownPulse 1s infinite' : 'none',
          }}>
            Expires in {m}:{s.toString().padStart(2, '0')}
          </span>
        </div>

        {/* E2E notice */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--green-light)',
          borderRadius: 'var(--r-sm)',
          border: '1px solid rgba(163,190,140,0.3)',
          marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: '#3d6b2a', textAlign: 'left',
        }}>
          <Icon name="shield" size={13} />
          Connection is end-to-end encrypted. Keys exchange on pairing.
        </div>

        {/* Demo button */}
        <button
          onClick={onSimulatePeer}
          style={{
            width: '100%', padding: 11, borderRadius: 'var(--r-sm)',
            background: 'var(--accent)', color: 'white', border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            boxShadow: '0 2px 12px rgba(94,129,172,0.3)',
          }}
        >
          <Icon name="link" size={14} />
          Simulate Peer Connection (Demo)
        </button>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
          Or open in another tab → Join Session → enter code above
        </p>
      </div>
    </ModalOverlay>
  )
}

// ---- Scan Modal ----
export function ScanModal({ onClose, onJoin }) {
  const [code, setCode] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) videoRef.current.srcObject = streamRef.current
      setCameraActive(true)
    } catch {
      setCameraActive(false)
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleJoin = () => {
    if (code.length === 6) onJoin(code)
  }

  return (
    <ModalOverlay onClose={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onClose() }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>📷</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>Join Session</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Point at a QR code or enter the 6-char code</p>

        <div
          onClick={!cameraActive ? startCamera : undefined}
          style={{
            width: 200, height: 200, margin: '0 auto 20px',
            borderRadius: 16, overflow: 'hidden',
            background: cameraActive ? '#000' : 'var(--surface2)',
            border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: cameraActive ? 'default' : 'pointer',
            position: 'relative',
          }}
        >
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
          {cameraActive && (
            <div style={{ position: 'absolute', inset: 16, border: '2px solid rgba(136,192,208,0.8)', borderRadius: 10, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'var(--teal)', animation: 'scanLine 1.5s ease-in-out infinite alternate' }} />
            </div>
          )}
          {!cameraActive && (
            <div style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Icon name="image" size={32} />
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>Tap to activate camera</span>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>— or enter code manually —</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="ABC123"
            style={{
              flex: 1, padding: '10px 14px',
              fontFamily: 'var(--mono)', fontSize: 18, letterSpacing: '0.25em',
              border: '2px solid var(--border)', borderRadius: 'var(--r-sm)',
              background: 'var(--surface2)', color: 'var(--accent)', fontWeight: 600,
              outline: 'none', textAlign: 'center',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={handleJoin}
            style={{
              padding: '10px 18px', borderRadius: 'var(--r-sm)',
              background: code.length === 6 ? 'var(--accent)' : 'var(--border)',
              color: code.length === 6 ? 'white' : 'var(--text3)',
              border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="link" size={14} /> Join
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ---- Confirm Modal ----
export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <ModalOverlay onClose={onCancel} maxWidth={380}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>{danger ? '⚠️' : '💬'}</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 20px', borderRadius: 'var(--r-sm)',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px', borderRadius: 'var(--r-sm)',
              background: danger ? 'var(--red-light)' : 'var(--accent)',
              border: danger ? '1px solid rgba(191,97,106,0.2)' : 'none',
              color: danger ? 'var(--red)' : 'white',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ---- AI Confirm Modal ----
export function AIConfirmModal({ onConfirm, onCancel }) {
  return (
    <ConfirmModal
      title="Send to AI?"
      message="This content will be processed by the Clipboard Assistant. The AI operates only on session content, does not access external data, and outputs are never stored beyond this session."
      confirmLabel="Process with AI"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
