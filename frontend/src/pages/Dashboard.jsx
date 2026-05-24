import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/signspeaklogo.svg'
import translations from '../translations'
import { 
  Camera, CpuIcon, ClipboardList, Play, Square, Sun, Moon, LogOut, 
  History, X, TrendingUp, Award, Calendar, Target 
} from 'lucide-react'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

function Dashboard({ theme, toggleTheme, lang, toggleLang }) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [prediction,  setPrediction]  = useState(null)
  const [confidence,  setConfidence]  = useState(null)
  const [history,     setHistory]     = useState([])
  const [status,      setStatus]      = useState('')
  const [username,    setUsername]    = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [stats,       setStats]       = useState(null)
  const [suggestions, setSuggestions] = useState([])

  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const intervalRef = useRef(null)

  const navigate = useNavigate()
  const token    = localStorage.getItem('token')
  const t        = translations[lang]
  const langRef  = useRef(lang)

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  const speakGesture = (word) => {
    const translated = t.gestures[word.toLowerCase()] || word
    const utterance  = new SpeechSynthesisUtterance(translated)
    utterance.rate   = 0.9
    utterance.volume = 1.0
    utterance.lang   = lang === 'fr' ? 'fr-FR' : 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    setUsername(localStorage.getItem('username') || 'User')
    setStatus(t.clickToBegin)
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(response.data.history)
      setStats(response.data.stats)
      setSuggestions(response.data.suggestions)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const startCamera = async () => {
    const unlock = new SpeechSynthesisUtterance('')
    window.speechSynthesis.speak(unlock)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      videoRef.current.srcObject = stream
      streamRef.current = stream
      setIsStreaming(true)
      setStatus(t.cameraActive)
      intervalRef.current = setInterval(captureAndPredict, 6000)
    } catch (err) {
      setStatus(t.cameraError)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsStreaming(false)
    setStatus(t.cameraStopped)
  }

  const captureAndPredict = async () => {
    if (!videoRef.current) return

    const colorCanvas  = document.createElement('canvas')
    colorCanvas.width  = 64
    colorCanvas.height = 64
    const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true })

    const grayCanvas  = document.createElement('canvas')
    grayCanvas.width  = 64
    grayCanvas.height = 64
    const grayCtx = grayCanvas.getContext('2d')

    const frames = []

    for (let i = 0; i < 30; i++) {
      colorCtx.save()
      colorCtx.scale(-1, 1)
      colorCtx.drawImage(videoRef.current, -64, 0, 64, 64)
      colorCtx.restore()

      const imageData = colorCtx.getImageData(0, 0, 64, 64)
      const data      = imageData.data

      for (let j = 0; j < data.length; j += 4) {
        const gray = 0.299*data[j] + 0.587*data[j+1] + 0.114*data[j+2]
        data[j] = data[j+1] = data[j+2] = gray
      }

      grayCtx.putImageData(imageData, 0, 0)
      frames.push(grayCanvas.toDataURL('image/png').split(',')[1])
      await new Promise(r => setTimeout(r, 100))
    }

    try {
      setStatus(t.analyzing)
      const response = await axios.post(
        `${API}/predict`,
        { frames },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const detected = response.data.gesture
      setPrediction(t.gestures[detected.toLowerCase()] || detected)
      setConfidence(response.data.confidence)
      setStatus(t.gestureDetected)
      speakGesture(detected)
      fetchHistory()
    } catch (err) {
      setStatus(t.predictionFailed)
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    stopCamera()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      {/* ── Navbar ── */}
      <div className="navbar">
        <div className="logo-wrapper">
          <div className="logo-circle">
            <img src={logo} alt="SignSpeak" />
          </div>
          <span className="logo-text">{t.appName}</span>
        </div>

        <div className="navbar-right">
          <div className="user-avatar" title={username}>
            {username.charAt(0).toUpperCase()}
          </div>
          <button className="nav-icon-btn" onClick={() => setShowHistory(true)}>
            <History size={14}/>
            <span className="nav-btn-text">{t.history}</span>
          </button>
          <button className="nav-icon-btn" onClick={toggleLang}>
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
          <button className="nav-icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
            <span className="nav-btn-text">{theme === 'dark' ? t.light : t.dark}</span>
          </button>
          <button className="nav-icon-btn" onClick={handleLogout}>
            <LogOut size={14}/>
            <span className="nav-btn-text">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="dashboard-grid">
        {/* LEFT Component Panel — Camera Input Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p className="section-title"><Camera size={14} />{t.liveCamera}</p>
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay muted playsInline
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: isStreaming ? 'block' : 'none', transform: 'scaleX(-1)'
                }}
                onLoadedMetadata={() => videoRef.current.play()}
              />
              {!isStreaming && (
                <div className="camera-placeholder">
                  <Camera size={36} style={{ opacity: 0.6 }} />
                  <span>{t.cameraPlaceholder}</span>
                </div>
              )}
            </div>
            <div className={`status-badge ${isStreaming ? 'active' : ''}`}>{status}</div>
          </div>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={isStreaming ? stopCamera : startCamera}>
            {isStreaming ? <><Square size={14}/> {t.stopCamera}</> : <><Play size={14}/> {t.startCamera}</>}
          </button>
        </div>

        {/* RIGHT Column Components — Prediction Insight Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card prediction-box">
            <p className="section-title" style={{ width: '100%', textAlign: 'left' }}><CpuIcon size={14} />{t.currentDetection}</p>
            {prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: 'auto 0' }}>
                <div className="prediction-gesture">{prediction.toUpperCase()}</div>
                <div className="prediction-confidence">{t.confidence}: {confidence}%</div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${confidence}%` }} />
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', margin: 'auto 0', fontSize: '0.9rem' }}>{t.startCameraMsg}</p>
            )}
          </div>

          <div className="card" style={{ flex: 1 }}>
            <p className="section-title"><ClipboardList size={14} />{t.recentDetections}</p>
            {history.length > 0 ? (
              history.slice(0, 5).map((item, index) => (
                <div className="history-item" key={index}>
                  <span className="history-gesture">{t.gestures[item.gesture.toLowerCase()] || item.gesture}</span>
                  <span className="history-confidence">{item.confidence}%</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.noDetections}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── History Overlay Drawer Slide-out UI ── */}
      {showHistory && <div className="history-overlay" onClick={() => setShowHistory(false)} />}
      <div className={`history-panel ${showHistory ? 'open' : ''}`}>
        <div className="history-panel-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16}/>{t.historyPanel}
          </h2>
          <button className="nav-icon-btn" style={{ padding: '6px' }} onClick={() => setShowHistory(false)}><X size={16}/></button>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <TrendingUp size={16} style={{ color: 'var(--accent)' }}/>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">{t.totalDetections}</div>
            </div>
            <div className="stat-card">
              <Award size={16} style={{ color: '#f59e0b' }}/>
              <div className="stat-value" style={{ textTransform: 'capitalize' }}>
                {t.gestures[stats.most_used?.toLowerCase()] || stats.most_used || '-'}
              </div>
              <div className="stat-label">{t.mostUsed}</div>
            </div>
            <div className="stat-card">
              <Calendar size={16} style={{ color: '#22c55e' }}/>
              <div className="stat-value">{stats.today}</div>
              <div className="stat-label">{t.todayCount}</div>
            </div>
            <div className="stat-card">
              <Target size={16} style={{ color: '#8b5cf6' }}/>
              <div className="stat-value">{stats.avg_conf}%</div>
              <div className="stat-label">{t.avgConfidence}</div>
            </div>
          </div>
        )}

        <div className="panel-section">
          <p className="section-title">{t.suggestions}</p>
          {suggestions.length > 0 ? (
            suggestions.map((gesture, i) => (
              <div className="suggestion-item" key={i}>
                <span>🤚</span>
                <span>
                  {t.suggestionText}{' '}
                  <strong style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {t.gestures[gesture] || gesture}
                  </strong>{' '}
                  — {lang === 'fr' ? 'non pratiqué récemment !' : 'not practiced recently!'}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.noSuggestions}</p>
          )}
        </div>

        <div className="panel-section">
          <p className="section-title">{t.recentHistory}</p>
          {history.length > 0 ? (
            history.map((item, i) => (
              <div className="history-item" key={i}>
                <div>
                  <span className="history-gesture">{t.gestures[item.gesture?.toLowerCase()] || item.gesture}</span>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
                <span className="history-confidence">{item.confidence}%</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.noHistory}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard