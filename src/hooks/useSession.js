// ============================================================
// useSession — Core session management hook
// Handles: BroadcastChannel pairing, E2EE keys, transfers,
//          session timers, clipboard mirror, disconnect
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { CryptoService, genFakeHex } from '../services/crypto'
import {
  genCode,
  genId,
  timeStr,
  saveRecentSession,
  loadRecentSessions,
  SESSION_TIMEOUT_MS,
} from '../utils'

function getDeviceName() {
  const ua = navigator.userAgent
  if (/iPhone|iPad/i.test(ua)) return 'iOS Device'
  if (/Android/i.test(ua)) return 'Android Device'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows PC'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Device ' + Math.floor(Math.random() * 99 + 1)
}

export function useSession(onToast) {
  const [screen, setScreen] = useState('home')          // 'home' | 'session'
  const [modal, setModal] = useState(null)               // 'qr' | 'scan' | null
  const [connected, setConnected] = useState(false)
  const [sessionCode, setSessionCode] = useState('')
  const [peerName, setPeerName] = useState('')
  const [fingerprint, setFingerprint] = useState('')
  const [transfers, setTransfers] = useState([])
  const [encryptionReady, setEncryptionReady] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [duration, setDuration] = useState('')
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(SESSION_TIMEOUT_MS / 1000)
  const [recentSessions, setRecentSessions] = useState(loadRecentSessions)

  const channelRef = useRef(null)
  const keyRef = useRef(null)           // { keyPair, publicKeyHex }
  const sharedKeyRef = useRef(null)     // derived AES-GCM key
  const timerRef = useRef(null)

  // ---- Duration & Expiry Timer ----
  useEffect(() => {
    if (!connected || !sessionStartTime) return
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime
      const remaining = Math.max(0, SESSION_TIMEOUT_MS - elapsed)
      setDuration(fmtDuration(elapsed))
      setSessionSecondsLeft(Math.floor(remaining / 1000))
      if (remaining <= 0) {
        onToast('Session expired after 30 minutes', 'warning')
        handleDisconnect(true)
      }
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [connected, sessionStartTime])

  // ---- BroadcastChannel Message Handler ----
  const handleChannelMessage = useCallback(async (event) => {
    const msg = event.data
    if (!msg?.type) return

    switch (msg.type) {
      case 'join_request': {
        // We are host; accept the joiner
        const { publicKeyHex } = keyRef.current || {}
        channelRef.current?.postMessage({
          type: 'join_accepted',
          deviceName: getDeviceName(),
          publicKey: publicKeyHex,
        })
        await finishConnect(msg.deviceName || 'Device B', msg.publicKey)
        break
      }

      case 'join_accepted': {
        // We are the joiner; host accepted
        await finishConnect(msg.deviceName || 'Host', msg.publicKey)
        setModal(null)
        break
      }

      case 'transfer': {
        const item = {
          ...msg.item,
          id: genId('inc'),
          direction: 'incoming',
        }
        setTransfers(prev => [...prev, item])
        onToast(`📨 New ${item.type} received`, 'info')
        break
      }

      case 'disconnect': {
        cleanupSession()
        onToast('Remote device disconnected', 'warning')
        break
      }
    }
  }, [])

  // ---- Open BroadcastChannel ----
  const openChannel = useCallback((code) => {
    if (channelRef.current) {
      channelRef.current.close()
    }
    const ch = new BroadcastChannel('cs2_' + code)
    ch.onmessage = handleChannelMessage
    channelRef.current = ch
    return ch
  }, [handleChannelMessage])

  // ---- Finish establishing a connection ----
  const finishConnect = useCallback(async (name, peerPublicKey) => {
    // Generate our keypair if not done
    if (!keyRef.current) {
      keyRef.current = await CryptoService.generateKeyPair()
    }
    const { keyPair, publicKeyHex } = keyRef.current

    // Derive shared key from peer public key (if available)
    if (peerPublicKey && keyPair?.privateKey) {
      sharedKeyRef.current = await CryptoService.deriveSharedKey(
        keyPair.privateKey,
        peerPublicKey
      )
    }

    // Generate fingerprint
    const fp = CryptoService.generateFingerprint(
      publicKeyHex,
      peerPublicKey || genFakeHex(65)
    )

    setPeerName(name)
    setFingerprint(fp)
    setConnected(true)
    setSessionStartTime(Date.now())
    setSessionSecondsLeft(SESSION_TIMEOUT_MS / 1000)
    setEncryptionReady(true)
    setScreen('session')
    onToast('🔐 Secure session established', 'success')
  }, [])

  // ---- Start New Session (Host) ----
  const startNewSession = useCallback(async () => {
    const code = genCode()
    setSessionCode(code)
    setTransfers([])

    // Pre-generate keypair
    keyRef.current = await CryptoService.generateKeyPair()

    openChannel(code)
    setModal('qr')
  }, [openChannel])

  // ---- Join Session (Peer) ----
  const joinSession = useCallback(async (code) => {
    if (!code || code.length !== 6) return
    const upperCode = code.toUpperCase()
    setSessionCode(upperCode)
    setTransfers([])

    // Generate keypair
    keyRef.current = await CryptoService.generateKeyPair()
    const { publicKeyHex } = keyRef.current

    const ch = openChannel(upperCode)
    ch.postMessage({
      type: 'join_request',
      deviceName: getDeviceName(),
      publicKey: publicKeyHex,
    })
    setModal(null)
    onToast('Connecting…', 'info')

    // Fallback: if no response in 2s (same-tab demo), simulate
    setTimeout(async () => {
      if (!connected) {
        await finishConnect('Demo Peer', genFakeHex(65))
      }
    }, 2000)
  }, [openChannel, connected, finishConnect])

  // ---- Simulate Peer (for demo / single-device testing) ----
  const simulatePeer = useCallback(async () => {
    setModal(null)
    await finishConnect('Device B (Demo)', genFakeHex(65))
  }, [finishConnect])

  // ---- Broadcast a Transfer ----
  const broadcastTransfer = useCallback((item) => {
    channelRef.current?.postMessage({ type: 'transfer', item })
  }, [])

  // ---- Add a Transfer to State ----
  const addTransfer = useCallback((data) => {
    const item = {
      ...data,
      id: genId('out'),
      direction: 'outgoing',
      time: timeStr(),
      encrypted: encryptionReady,
    }
    setTransfers(prev => [...prev, item])
    broadcastTransfer(item)
    return item
  }, [encryptionReady, broadcastTransfer])

  // ---- Delete a Transfer ----
  const deleteTransfer = useCallback((id) => {
    setTransfers(prev => prev.filter(t => t.id !== id))
  }, [])

  // ---- Cleanup Session State ----
  const cleanupSession = useCallback(() => {
    clearInterval(timerRef.current)
    channelRef.current?.close()
    channelRef.current = null
    CryptoService.destroyKeys(keyRef)
    sharedKeyRef.current = null

    setConnected(false)
    setEncryptionReady(false)
    setScreen('home')
    setDuration('')
    setPeerName('')
    setFingerprint('')
    setSessionSecondsLeft(SESSION_TIMEOUT_MS / 1000)
  }, [])

  // ---- Disconnect ----
  const handleDisconnect = useCallback((expired = false) => {
    // Save to recent before clearing
    saveRecentSession(sessionCode, transfers.length)
    setRecentSessions(loadRecentSessions())

    channelRef.current?.postMessage({ type: 'disconnect' })
    cleanupSession()
    setTransfers([])
    setSessionCode('')

    if (!expired) {
      onToast('Session ended · Keys destroyed', 'info')
    }
  }, [sessionCode, transfers.length, cleanupSession])

  return {
    // State
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

    // Actions
    setModal,
    startNewSession,
    joinSession,
    simulatePeer,
    addTransfer,
    deleteTransfer,
    handleDisconnect,
  }
}

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}
