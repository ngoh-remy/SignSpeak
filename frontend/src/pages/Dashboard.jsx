import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/signspeaklogo.svg'
import { Camera, CpuIcon, ClipboardList, Play, Square, Sun, Moon, LogOut, User } from 'lucide-react'
import translations from '../translations'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

function Dashboard({ theme, toggleTheme, lang, toggleLang }) {
  // 💡 Added lang and toggleLang to props — was missing before!

  const [isStreaming, setIsStreaming] = useState(false)
  const [prediction,  setPrediction]  = useState(null)
  const [confidence,  setConfidence]  = useState(null)
  const [history,     setHistory]     = useState([])
  const [status,      setStatus]      = useState('')
  const [username,    setUsername]    = useState('')

  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const intervalRef = useRef(null)

  const navigate = useNavigate()
  const token    = localStorage.getItem('token')
  const t        = translations[lang]
  const langRef = useRef(lang)
useEffect(() => {
  langRef.current = lang
}, [lang])
// 💡 langRef always holds the CURRENT language value
//    Unlike regular variables captured in closures,
//    refs update immediately — even inside setInterval!
  // 💡 t must be defined BEFORE speakGesture and other functions
  //    because those functions USE t — order matters in JavaScript!

const speakGesture = (word) => {
  const translated = t.gestures[word.toLowerCase()] || word
  console.log('Lang:', lang, '| Speaking:', translated)
  const utterance  = new SpeechSynthesisUtterance(translated)
  utterance.rate   = 0.9
  utterance.volume = 1.0
  // utterance.lang   = 'en-US'
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
      // 💡 Translate gesture for display AND speech
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
  {/* LEFT — Logo only */}
  <div className="logo-wrapper">
    <div className="logo-circle">
      <img src={logo} alt="SignSpeak" />
    </div>
    <span className="logo-text">{t.appName}</span>
  </div>

  {/* RIGHT — Everything else */}
  <div className="navbar-right">

    {/* User initial circle */}
    <div style={{
      width: '34px', height: '34px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: '700', fontSize: '0.9rem',
      flexShrink: 0, cursor: 'default',
      title: username
      // 💡 Shows only the first letter of username
      //    Clean like Google — no text, just the circle
    }}>
      {username.charAt(0).toUpperCase()}
    </div>

    <button className="lang-toggle" onClick={toggleLang}>
      {lang === 'en' ? 'FR' : 'EN'}
    </button>

    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'dark'
        ? <><Sun size={15}/> {t.light}</>
        : <><Moon size={15}/> {t.dark}</>}
    </button>

    <button className="btn-logout" onClick={handleLogout}>
      <LogOut size={15}/>
      {t.logout}
    </button>
  </div>
</div>

      {/* ── Main Grid ── */}
      <div className="dashboard-grid">

        {/* LEFT — Camera */}
        <div className="card">
          <p className="section-title">
            <Camera size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {t.liveCamera}
          </p>

          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay muted playsInline
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: isStreaming ? 'block' : 'none',
                transform: 'scaleX(-1)'
              }}
              onLoadedMetadata={() => videoRef.current.play()}
            />
            {!isStreaming && (
              <div className="camera-placeholder">
                <Camera size={48} color="var(--text-secondary)" />
                <span>{t.cameraPlaceholder}</span>
              </div>
            )}
          </div>

          <div className={`status-badge ${isStreaming ? 'active' : ''}`}>
            {status}
          </div>

          <button
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={isStreaming ? stopCamera : startCamera}
          >
            {isStreaming
              ? <><Square size={16}/> {t.stopCamera}</>
              : <><Play   size={16}/> {t.startCamera}</>}
          </button>
        </div>

        {/* RIGHT — Prediction + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Current Prediction */}
          <div className="card prediction-box">
            <p className="section-title">
              <CpuIcon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {t.currentDetection}
            </p>
            {prediction ? (
              <>
                <div className="prediction-gesture">{prediction.toUpperCase()}</div>
                <div className="prediction-confidence">{t.confidence}: {confidence}%</div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${confidence}%` }} />
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.startCameraMsg}
              </p>
            )}
          </div>

          {/* History */}
          <div className="card" style={{ flex: 1 }}>
            <p className="section-title">
              <ClipboardList size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {t.recentDetections}
            </p>
            {history.length > 0 ? (
              history.slice(0, 8).map((item, index) => (
                <div className="history-item" key={index}>
                  <span className="history-gesture">
                    {t.gestures[item.gesture.toLowerCase()] || item.gesture}
                  </span>
                  <span className="history-confidence">{item.confidence}%</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t.noDetections}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard