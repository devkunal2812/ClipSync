import { useState, useEffect } from 'react'

// Components
import Header from './components/Header.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import SessionPanel from './components/SessionPanel.jsx'
import { FeedHeader, TransferFeed, HistorySidebar } from './components/Feed.jsx'
import { QRModal, ScanModal, ConfirmModal } from './components/Modals.jsx'
import ToastContainer from './components/Toast.jsx'

// Hooks
import { useSession } from './hooks/useSession.js'
import { useToast } from './hooks/useToast.js'

// Utils
import { triggerDownload } from './utils/index.js'

// ============================================================
// Session Timer Banner
// ============================================================
function SessionTimerBanner({ secondsLeft }) {
  if (secondsLeft > 300) return null
  const urgent = secondsLeft < 60
  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '7px 20px',
      background: urgent ? 'rgba(191,97,106,0.08)' : 'rgba(235,203,139,0.14)',
      borderBottom: `1px solid ${urgent ? 'rgba(191,97,106,0.2)' : 'rgba(235,203,139,0.3)'}`,
      fontSize: 12, fontWeight: 600,
      animation: urgent ? 'countdownPulse 1s infinite' : 'none',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span style={{ color: urgent ? 'var(--red)' : '#7a5a1b' }}>
        Session expires in {m}:{s.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

// ============================================================
// App Root
// ============================================================
export default function App() {
  const { toasts, addToast, removeToast } = useToast()
  const [feedFilter, setFeedFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  const {
    screen,
    modal,
    connected,
    sessionCode,
    peerName,
    fingerprint,
    transfers,
    encryptionReady,
    duration,
    sessionSecondsLeft,
    recentSessions,
    setModal,
    startNewSession,
    joinSession,
    simulatePeer,
    addTransfer,
    deleteTransfer,
    handleDisconnect,
  } = useSession(addToast)

  // Share handler — adds to local state and broadcasts
  const handleShare = (data) => {
    addTransfer(data)
    const label = { text: 'Text', code: 'Code', file: 'File', image: 'Image' }[data.type] || 'Content'
    addToast(`⚡ ${label} shared!`, 'success')
  }

  // Copy handler
  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.content || '').catch(() => {})
    addToast('Copied to clipboard!', 'success')
  }

  // Download handler
  const handleDownload = (item) => {
    triggerDownload(item.src || item.data, item.name || 'download')
    addToast('Download started', 'info')
  }

  // Join session handler — either open scan modal or join directly with code
  const handleJoinSession = (code) => {
    if (typeof code === 'string' && code.length === 6) {
      joinSession(code)
    } else {
      setModal('scan')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (sidebarOpen) setSidebarOpen(false)
        if (confirmDisconnect) setConfirmDisconnect(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [sidebarOpen, confirmDisconnect])

  return (
    <>
      <Header
        connected={connected}
        peerName={peerName}
        duration={duration}
        fingerprint={fingerprint}
        onDisconnect={() => setConfirmDisconnect(true)}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
      />

      {connected && <SessionTimerBanner secondsLeft={sessionSecondsLeft} />}

      {/* HOME */}
      {screen === 'home' && (
        <HomeScreen
          onNewSession={startNewSession}
          onJoinSession={handleJoinSession}
          recentSessions={recentSessions}
        />
      )}

      {/* ACTIVE SESSION */}
      {screen === 'session' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
        }}>
          {/* Left: Input Panel */}
          <SessionPanel
            peerName={peerName}
            duration={duration}
            fingerprint={fingerprint}
            encryptionReady={encryptionReady}
            onShare={handleShare}
            onToast={addToast}
          />

          {/* Right: Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FeedHeader
              filter={feedFilter}
              onChange={setFeedFilter}
              totalCount={transfers.filter(t => feedFilter === 'all' || t.type === feedFilter).length}
            />
            <TransferFeed
              transfers={transfers}
              filter={feedFilter}
              onDelete={deleteTransfer}
            />
          </div>
        </div>
      )}

      {/* History Sidebar */}
      <HistorySidebar
        open={sidebarOpen}
        transfers={transfers}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Modals */}
      {modal === 'qr' && (
        <QRModal
          code={sessionCode}
          onClose={() => setModal(null)}
          onSimulatePeer={simulatePeer}
        />
      )}
      {modal === 'scan' && (
        <ScanModal
          onClose={() => setModal(null)}
          onJoin={(code) => { joinSession(code); addToast('Joining session…', 'info') }}
        />
      )}
      {confirmDisconnect && (
        <ConfirmModal
          title="End Session?"
          message="This will disconnect both devices and destroy all encryption keys. Session content will be cleared from memory."
          confirmLabel="Disconnect"
          danger
          onConfirm={() => { setConfirmDisconnect(false); handleDisconnect() }}
          onCancel={() => setConfirmDisconnect(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
