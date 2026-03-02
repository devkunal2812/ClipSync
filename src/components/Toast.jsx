export default function ToastContainer({ toasts, onRemove }) {
  const typeConfig = {
    success: { borderColor: '#A3BE8C', icon: '✓', iconBg: '#A3BE8C', iconColor: '#2d5a1b' },
    error:   { borderColor: '#BF616A', icon: '✕', iconBg: '#BF616A', iconColor: '#fff' },
    info:    { borderColor: '#5E81AC', icon: 'ℹ', iconBg: '#5E81AC', iconColor: '#fff' },
    warning: { borderColor: '#EBCB8B', icon: '⚠', iconBg: '#EBCB8B', iconColor: '#5a4a1b' },
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const cfg = typeConfig[t.type] || typeConfig.info
        return (
          <div
            key={t.id}
            onClick={() => onRemove(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              color: 'var(--text)',
              padding: '11px 16px',
              borderRadius: 'var(--r-sm)',
              boxShadow: 'var(--shadow-md)',
              maxWidth: 300,
              fontSize: 13,
              fontWeight: 500,
              borderLeft: `3px solid ${cfg.borderColor}`,
              animation: 'toastSlide 0.3s ease',
              cursor: 'pointer',
              pointerEvents: 'all',
              userSelect: 'none',
            }}
          >
            <span style={{
              background: cfg.iconBg,
              color: cfg.iconColor,
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {cfg.icon}
            </span>
            <span style={{ lineHeight: 1.4 }}>{t.msg}</span>
          </div>
        )
      })}
    </div>
  )
}
