import { useState } from 'react'
import Icon from './Icon.jsx'
import { TextInputPanel, CodeInputPanel, FileInputPanel } from './InputPanels.jsx'

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'text', label: 'Text', icon: 'text' },
    { id: 'code', label: 'Code', icon: 'code' },
    { id: 'file', label: 'File', icon: 'upload' },
  ]
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '11px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', border: 'none', background: 'none',
            color: active === t.id ? 'var(--accent)' : 'var(--text3)',
            borderBottom: active === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.15s',
            marginBottom: -1,
          }}
        >
          <Icon name={t.icon} size={13} />
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ enabled, onToggle, label, subLabel }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
        background: enabled ? 'rgba(94,129,172,0.05)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
        <Icon name="copy" size={11} style={{ color: enabled ? 'var(--accent)' : 'var(--text3)' }} />
        <span style={{ color: enabled ? 'var(--accent)' : 'var(--text3)', fontWeight: 600 }}>{label}</span>
        {subLabel && <span style={{ color: 'var(--text3)', fontWeight: 400 }}>{subLabel}</span>}
        {enabled && (
          <span style={{
            padding: '1px 6px', borderRadius: 99, fontSize: 9, fontWeight: 700,
            background: 'var(--accent)', color: 'white', textTransform: 'uppercase',
          }}>
            ON
          </span>
        )}
      </div>
      <div style={{
        width: 30, height: 16, borderRadius: 99,
        background: enabled ? 'var(--accent)' : 'rgba(94,129,172,0.2)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: enabled ? 16 : 2,
          width: 12, height: 12, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  )
}

export default function SessionPanel({ peerName, duration, fingerprint, encryptionReady, onShare, onToast }) {
  const [activeTab, setActiveTab] = useState('text')
  const [clipboardMirror, setClipboardMirror] = useState(false)

  // Real clipboard mirror — fires on copy event
  // (useEffect is in App.jsx; this toggle just controls the flag)

  return (
    <div style={{
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0, overflow: 'hidden',
    }}>
      {/* Device info bar */}
      <div style={{
        padding: '11px 16px',
        background: 'var(--surface2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🖥️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{peerName}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Connected · {duration}</div>
          </div>
        </div>
        {fingerprint && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="fingerprint" size={11} style={{ color: 'var(--text3)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)' }}>
              {fingerprint.slice(0, 11)}…
            </span>
          </div>
        )}
      </div>

      {/* Clipboard Mirror toggle */}
      <Toggle
        enabled={clipboardMirror}
        onToggle={() => setClipboardMirror(s => !s)}
        label="Clipboard Mirror"
        subLabel={clipboardMirror ? null : '— auto-sync copies'}
      />

      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Tab panels */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 14 }}>
        {activeTab === 'text' && <TextInputPanel onShare={onShare} />}
        {activeTab === 'code' && <CodeInputPanel onShare={onShare} />}
        {activeTab === 'file' && <FileInputPanel onShare={onShare} onToast={onToast} />}
      </div>

      {/* Encryption status footer */}
      <div style={{
        padding: '9px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface2)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="shield" size={11} style={{ color: encryptionReady ? '#3d6b2a' : 'var(--text3)' }} />
        <span style={{ fontSize: 10, color: encryptionReady ? '#3d6b2a' : 'var(--text3)' }}>
          {encryptionReady ? 'AES-256-GCM encryption active' : 'Establishing encryption…'}
        </span>
      </div>
    </div>
  )
}
