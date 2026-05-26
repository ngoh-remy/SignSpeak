import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import translations from '../translations'
import {
  Camera, CpuIcon, ClipboardList, Play, Square,
  History, X, TrendingUp, Trash2, Volume2
} from 'lucide-react'
import Navbar from './Navbar'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

// Gesture translations EN → FR
const gestureMap = {
  'help' : 'aide',
  'go'   : 'aller',
  'drink': 'boire',
  'yes'  : 'oui',
  'no'   : 'non'
}

function Dashboard({ theme, toggleTheme, lang, toggleLang }) {
  const [isStreaming,  setIsStreaming]  = useState(false)
  const [prediction,   setPrediction]  = useState(null)
  const [confidence,   setConfidence]  = useState(null)
  const [history,      setHistory]     = useState([])
  const [status,       setStatus]      = useState('')
  const [username,     setUsername]    = useState('')
  const [showHistory,  setShowHistory] = useState(false)
  const [stats,        setStats]       = useState(null)
  const [suggestions,  setSuggestions] = useState([])
  const [sentence,     setSentence]    = useState([])

  // ── Refs (no re-render, always current in async/interval) ──────────
  const videoRef        = useRef(null)
  const streamRef       = useRef(null)
  const frameBufferRef  = useRef([])   // 💡 REF not state — avoids stale closures
  const isAnalyzingRef  = useRef(false)// 💡 REF not state — avoids stale closures
  const langRef         = useRef(lang)
  langRef.current = lang               // Always reflects latest lang

  const navigate = useNavigate()
  const t        = translations[lang] || translations['en']

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'Guest')
    setStatus(lang === 'fr' ? 'Prêt' : 'Ready')
    const token = localStorage.getItem('token')
    if (token) fetchHistory(token)
  }, [lang])

  // Attach stream to video element after isStreaming=true causes re-render
  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isStreaming])

  const fetchHistory = async (token) => {
    const t = token || localStorage.getItem('token')
    if (!t) return
    try {
      const res = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${t}` }
      })
      setHistory(res.data.history    || [])
      setStats(res.data.stats        || null)
      setSuggestions(res.data.suggestions || [])
    } catch (err) {
      console.error('History fetch failed:', err)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
        // 💡 facingMode: 'user' ensures front camera on mobile
      })
      streamRef.current      = stream
      frameBufferRef.current = []
      isAnalyzingRef.current = false
      setIsStreaming(true)
      setStatus(t.webcamActive)
    } catch (err) {
      // 💡 Better error messages for mobile
      if (err.name === 'NotAllowedError') {
        setStatus(lang === 'fr' ? 'Permission caméra refusée' : 'Camera permission denied')
      } else if (err.name === 'NotFoundError') {
        setStatus(lang === 'fr' ? 'Aucune caméra trouvée' : 'No camera found on this device')
      } else {
        setStatus(t.cameraError)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    streamRef.current      = null
    frameBufferRef.current = []
    isAnalyzingRef.current = false
    setIsStreaming(false)
    setStatus(t.webcamInactive)
  }

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return
    const currentLang  = langRef.current
    const translated   = currentLang === 'fr' ? (gestureMap[text.toLowerCase()] || text) : text
    window.speechSynthesis.cancel()
    const utterance    = new SpeechSynthesisUtterance(translated)
    utterance.lang     = currentLang === 'fr' ? 'fr-FR' : 'en-US'
    utterance.rate     = 0.9
    utterance.volume   = 1.0
    window.speechSynthesis.speak(utterance)
  }, [])

  // ── Frame Capture ───────────────────────────────────────────────────
  const captureFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState < 2 || isAnalyzingRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width  = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    // ✅ CRITICAL FIX: Horizontal flip to match training data orientation!
    // cv2.flip(frame, 1) was applied during recording — we must mirror here too
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(videoRef.current, -64, 0, 64, 64)
    ctx.restore()

    const base64Frame = canvas.toDataURL('image/png').split(',')[1]
    if (!base64Frame) return

    frameBufferRef.current.push(base64Frame)
    const count = frameBufferRef.current.length
    setStatus(`${langRef.current === 'fr' ? 'Enregistrement' : 'Recording'}: ${count}/30`)

    if (count >= 30) {
      const frames = [...frameBufferRef.current]
      frameBufferRef.current = []
      isAnalyzingRef.current = true
      sendFrames(frames)
    }
  }, []) // 💡 Empty deps — only uses refs which are always current

  // ── Send 30 frames to Flask ─────────────────────────────────────────
  const sendFrames = async (frames) => {
    const token       = localStorage.getItem('token') // Always fresh!
    const currentLang = langRef.current
    const tCurrent    = translations[currentLang] || translations['en']

    if (!token) {
      // 💡 Non-authenticated users get a clear message instead of error
      setStatus(currentLang === 'fr'
        ? 'Connectez-vous pour traduire les gestes !'
        : 'Please log in to translate gestures!')
      isAnalyzingRef.current = false
      return
    }

    try {
      setStatus(tCurrent.loading)
      const response = await axios.post(
        `${API}/predict`,
        { frames },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )

      const detected = response.data.gesture
      if (detected) {
        setPrediction(detected)
        setConfidence(response.data.confidence)
        setSentence(prev => [...prev, detected.toLowerCase()])
        speak(detected)
        fetchHistory(token)
        setStatus(tCurrent.detectedGesture || 'Gesture Detected!')
      }
    } catch (err) {
      const errStatus = err.response?.status
      if (errStatus === 401 || errStatus === 422) {
        // 💡 Token expired or invalid — clear and redirect
        localStorage.clear()
        setStatus(currentLang === 'fr'
          ? 'Session expirée — Reconnectez-vous'
          : 'Session expired — Please log in again')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setStatus(tCurrent.error)
      }
    } finally {
      isAnalyzingRef.current = false
    }
  }

  // ── Capture interval ────────────────────────────────────────────────
  useEffect(() => {
    if (!isStreaming) return
    // 💡 200ms interval = ~5fps, 30 frames = 6 seconds per prediction cycle
    const interval = setInterval(captureFrame, 200)
    return () => clearInterval(interval)
  }, [isStreaming, captureFrame])

  const handleLogout = () => {
    localStorage.clear()
    stopCamera()
    navigate('/')
  }

  return (
    <div className="app-container">
      <Navbar
        theme={theme} toggleTheme={toggleTheme}
        lang={lang}   toggleLang={toggleLang}
        onLogout={handleLogout}
      />

      <div className="workspace-layout">

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Camera Card */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{t.dashboardTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              {t.welcomeUser}{username}. {t.translationDesc}
            </p>

            <div style={{ width: '100%', height: '340px', background: 'var(--bg-darker)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isStreaming ? (
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Camera size={40} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem' }}>{t.webcamInactive}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flex: 1 }}>
                {t.webcamStatus}: {status}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {localStorage.getItem('token') && (
                  <button className="btn-base btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => setShowHistory(true)}>
                    <History size={14} />
                    {lang === 'fr' ? 'Statistiques' : 'Analytics'}
                  </button>
                )}
                <button className="btn-base btn-purple" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={isStreaming ? stopCamera : startCamera}>
                  {isStreaming
                    ? <><Square size={14} /> {t.stopCamera}</>
                    : <><Play   size={14} /> {t.startCamera}</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Sentence Builder */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1rem' }}>{t.constructedSentence}</h3>
                {sentence.length > 0 && (
                  <button className="btn-base btn-outline" style={{ padding: '4px 10px', color: '#8b5cf6' }} onClick={() => speak(sentence.join(' '))}>
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-base btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSentence(p => p.slice(0, -1))}>
                  {lang === 'fr' ? 'Annuler' : 'Undo'}
                </button>
                <button className="btn-base btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSentence([])}>
                  <Trash2 size={12} /> {t.clearText}
                </button>
              </div>
            </div>

            <div className="sentence-box">
              {sentence.length > 0 ? (
                sentence.map((w, i) => {
                  const display = lang === 'fr' ? (gestureMap[w] || w) : w
                  return <span key={i} className="word-pill">{display}</span>
                })
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.noGestures}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Current Detection */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>
              <CpuIcon size={14} /> {t.liveFeed}
            </div>
            {prediction ? (
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '4px' }}>
                  {(lang === 'fr' ? (gestureMap[prediction.toLowerCase()] || prediction) : prediction).toUpperCase()}
                </div>
                <div style={{ color: '#34d399', fontSize: '0.85rem' }}>
                  {t.confidence}: {confidence}%
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                {localStorage.getItem('token')
                  ? t.noGestures
                  : (lang === 'fr' ? 'Connectez-vous pour traduire' : 'Log in to translate gestures')}
              </span>
            )}
          </div>

          {/* History List */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px' }}>
              <ClipboardList size={14} /> {t.historyLog}
            </div>
            {localStorage.getItem('token') ? (
              history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {history.slice(0, 5).map((h, i) => {
                    const displayGesture = lang === 'fr'
                      ? (gestureMap[h.gesture?.toLowerCase()] || h.gesture)
                      : h.gesture
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-darker)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{displayGesture}</span>
                        <span style={{ color: '#8b5cf6' }}>{h.confidence}%</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.noHistory}</p>
              )
            ) : (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: '12px' }}>
                  {lang === 'fr' ? 'Connectez-vous pour voir votre historique' : 'Log in to see your history'}
                </p>
                <button className="btn-base btn-purple" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
                  {t.login}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ANALYTICS MODAL ── */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setShowHistory(false)}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp style={{ color: '#8b5cf6' }} />
              {lang === 'fr' ? 'Historique & Analyses' : 'History & Analytics'}
            </h2>

            {stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: lang === 'fr' ? 'Total' : 'Total',                         value: stats.total,        color: 'var(--text-main)' },
                    { label: lang === 'fr' ? "Aujourd'hui" : 'Today',                   value: stats.today,        color: '#8b5cf6' },
                    { label: lang === 'fr' ? 'Confiance Moy.' : 'Avg Confidence',       value: `${stats.avg_conf}%`, color: '#34d399' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-darker)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>{s.label}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#c084fc', marginBottom: '10px', fontWeight: '700' }}>
                      💡 {lang === 'fr' ? 'SUGGESTIONS DU JOUR' : 'DAILY SUGGESTIONS'}
                    </h4>
                    {suggestions.map((g, i) => (
                      <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                        🤚 {lang === 'fr'
                          ? `Pratiquez "${gestureMap[g] || g}" — pas utilisé récemment`
                          : `Practice "${g}" — not used recently`}
                      </p>
                    ))}
                  </div>
                )}

                {/* Recent detections */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    {lang === 'fr' ? 'Détections Récentes' : 'Recent Detections'}
                  </h4>
                  {history.slice(0, 10).map((h, i) => {
                    const g = lang === 'fr' ? (gestureMap[h.gesture?.toLowerCase()] || h.gesture) : h.gesture
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-darker)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{g}</span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ color: '#8b5cf6' }}>{h.confidence}%</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>{t.noHistory}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard