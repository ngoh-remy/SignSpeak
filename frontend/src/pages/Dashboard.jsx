import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/signspeaklogo.svg'
import translations from '../translations'
import { 
  Camera, CpuIcon, ClipboardList, Play, Square, Sun, Moon, LogOut, 
  History, X, TrendingUp, Award, Calendar, Target, RotateCcw, Backspace, Trash2, Volume2
} from 'lucide-react'
import Navbar from './Navbar'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

function Dashboard({ theme, toggleTheme, lang, toggleLang, isAuthenticated, onLogout }) {
  // --- Original Production States ---
  const [isStreaming, setIsStreaming] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('')
  const [username, setUsername] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [stats, setStats] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  // --- New Sentence Feature States ---
  const [sentence, setSentence] = useState([])

  // --- Original Video Core References ---
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const navigate = useRef(useNavigate()).current // Guard against re-render updates
  const token = localStorage.getItem('token')
  const t = translations[lang]
  const langRef = useRef(lang)

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  // --- Original Voice Audio Output Function ---
  const speakGesture = (word) => {
    const translated = t.gestures?.[word.toLowerCase()] || word
    const utterance = new SpeechSynthesisUtterance(translated)
    utterance.rate = 0.9
    utterance.volume = 1.0
    utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  // --- New Multi-Word Sentence Voice Synthesis ---
  const handleSpeakSentence = () => {
    if (sentence.length === 0) return
    const speechText = sentence.join(' ')
    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.rate = 0.9
    utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  // --- Route Verification & Initial Fetch ---
  useEffect(() => {
    // If the app isn't explicitly flagged as authenticated or missing a sandbox fallback, guard it
    if (!token && !onLogout) { 
      navigate('/login')
      return 
    }
    setUsername(localStorage.getItem('username') || 'Guest User')
    setStatus(t.clickToBegin || 'Ready to begin')
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    if (!token) return // Bypass server history hits if in unauthenticated sandbox mode
    try {
      const response = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(response.data.history || [])
      setStats(response.data.stats || null)
      setSuggestions(response.data.suggestions || [])
    } catch (err) {
      console.error('Failed to fetch production historical logs:', err)
    }
  }

  const startCamera = async () => {
    const unlock = new SpeechSynthesisUtterance('')
    window.speechSynthesis.speak(unlock)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      streamRef.current = stream
      setIsStreaming(true)
      setStatus(t.cameraActive || 'Camera Stream Connected')
      intervalRef.current = setInterval(captureAndPredict, 6000)
    } catch (err) {
      setStatus(t.cameraError || 'Failed to initialize camera')
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
    setStatus(t.cameraStopped || 'Camera Stream Terminated')
  }

  // --- Advanced 30-Frame Inversion & Batch Processing Pipeline ---
  const captureAndPredict = async () => {
    if (!videoRef.current) return

    const colorCanvas = document.createElement('canvas')
    colorCanvas.width = 64
    colorCanvas.height = 64
    const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true })

    const grayCanvas = document.createElement('canvas')
    grayCanvas.width = 64
    grayCanvas.height = 64
    const grayCtx = grayCanvas.getContext('2d')

    const frames = []

    // Frame batch processing buffer loop
    for (let i = 0; i < 30; i++) {
      if (!videoRef.current) break
      colorCtx.save()
      colorCtx.scale(-1, 1)
      colorCtx.drawImage(videoRef.current, -64, 0, 64, 64)
      colorCtx.restore()

      const imageData = colorCtx.getImageData(0, 0, 64, 64)
      const data = imageData.data

      // Matrix transformation loop converting pixels to custom ML grayscale
      for (let j = 0; j < data.length; j += 4) {
        const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2]
        data[j] = data[j + 1] = data[j + 2] = gray
      }

      grayCtx.putImageData(imageData, 0, 0)
      frames.push(grayCanvas.toDataURL('image/png').split(',')[1])
      await new Promise(r => setTimeout(r, 100))
    }

    if (frames.length < 30) return

    try {
      setStatus(t.analyzing || 'Processing gestures...')
      const response = await axios.post(
        `${API}/predict`,
        { frames },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      )

      const detected = response.data.gesture
      const resolvedTranslation = t.gestures?.[detected.toLowerCase()] || detected
      
      setPrediction(resolvedTranslation)
      setConfidence(response.data.confidence)
      setStatus(t.gestureDetected || 'Gesture Processed')
      
      // Structural check passing resolved strings into the Sentence Builder array
      setSentence(prev => {
        if (prev[prev.length - 1] !== resolvedTranslation) {
          return [...prev, resolvedTranslation]
        }
        return prev
      })

      speakGesture(detected)
      fetchHistory()
    } catch (err) {
      setStatus(t.predictionFailed || 'Network processing failed')
      console.error(err)
    }
  }

  const handleLogoutClick = () => {
    localStorage.clear()
    stopCamera()
    if (onLogout) onLogout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container" style={{ background: '#070a12', minHeight: '100vh', color: '#fff' }}>
      {/* Universal Sticky Top Navigation Block */}
      <Navbar 
        theme={theme} toggleTheme={toggleTheme} 
        lang={lang} toggleLang={toggleLang} 
        isAuthenticated={!!token} onLogout={handleLogoutClick} 
      />

      {/* Primary Workspace Interface */}
      <div className="dashboard-grid" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Segment: Stream Viewport & Sentence Builder */}
        <div>
          <div className="card" style={{ padding: '24px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '600' }}>
              {t.interpreterTitle || 'Real-Time Sign Interpreter'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem' }}>
              {t.interpreterSubtitle || 'Enable your camera, select voice output, and start gesturing inside the camera box.'}
            </p>

            <div className="video-viewport" style={{ background: '#020617', height: '380px', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay muted playsInline
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: isStreaming ? 'block' : 'none', transform: 'scaleX(-1)'
                }}
                onLoadedMetadata={() => videoRef.current && videoRef.current.play()}
              />
              {!isStreaming && (
                <div style={{ color: '#475569', textAlign: 'center', position: 'absolute' }}>
                  <Camera size={48} style={{ marginBottom: '12px', opacity: 0.6 }} />
                  <div>{t.cameraPlaceholder || 'Webcam stream is disabled.'}</div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <div className={`status-badge ${isStreaming ? 'active' : ''}`} style={{ background: isStreaming ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                {status}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowHistory(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px' }}
                >
                  <History size={14}/>
                  <span>{t.history || 'Metrics'}</span>
                </button>
                <button 
                  className="btn-primary" 
                  onClick={isStreaming ? stopCamera : startCamera}
                  style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isStreaming ? <><Square size={14}/> {t.stopCamera || 'Stop'}</> : <><Play size={14}/> {t.startCamera || 'Start Camera'}</>}
                </button>
              </div>
            </div>
          </div>

          {/* New Feature Container Block: Sentence Translation Builder */}
          <div className="sentence-builder-card" style={{ marginTop: '24px' }}>
            <div className="sentence-builder-header">
              <div className="sentence-builder-title">
                <RotateCcw size={18} className="text-gradient-purple" />
                <span>{t.sentenceBuilderTitle || 'Sentence Translation Builder'}</span>
              </div>
              <div className="sentence-action-row">
                <button className="btn-action-small" onClick={() => setSentence(prev => prev.slice(0, -1))}>
                  <Backspace size={14} />
                  <span>{t.backspace || 'Backspace'}</span>
                </button>
                <button className="btn-action-small" onClick={() => setSentence([])}>
                  <Trash2 size={14} />
                  <span>{t.clear || 'Clear'}</span>
                </button>
              </div>
            </div>

            <div className="sentence-display-box">
              {sentence.length > 0 ? (
                sentence.map((word, idx) => (
                  <span key={idx} className="word-token">{word}</span>
                ))
              ) : (
                <span className="empty-state-text">
                  {t.sentenceEmptyState || 'Awaiting sign combinations to construct full concepts...'}
                </span>
              )}
            </div>

            <div className="sentence-footer">
              <button 
                className="btn-primary" 
                style={{ background: '#8b5cf6' }} 
                onClick={handleSpeakSentence} 
                disabled={sentence.length === 0}
              >
                <Volume2 size={16} />
                <span>{t.speakOutLoud || 'Speak Out Loud'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Segment Column: Production Metrics Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Matrix Output Result Monitor */}
          <div className="card" style={{ padding: '24px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <p className="section-title" style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CpuIcon size={14} />{t.currentDetection || 'Latest Result'}
            </p>
            {prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.02em', marginBottom: '4px' }}>
                  {prediction.toUpperCase()}
                </div>
                <div style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px' }}>
                  {t.confidence || 'Confidence'}: {confidence}%
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', height: '6px', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(90deg, #34d399, #059669)', height: '100%', width: `${confidence}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : (
              <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>
                {t.startCameraMsg || 'Awaiting gesture inputs...'}
              </p>
            )}
          </div>

          {/* Quick Peek Recent Log Stream List */}
          <div className="card" style={{ padding: '24px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', flex: 1 }}>
            <p className="section-title" style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={14} />{t.recentDetections || 'Persistent History'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.length > 0 ? (
                history.slice(0, 5).map((item, index) => (
                  <div className="history-item" key={index} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: '500' }}>{t.gestures?.[item.gesture?.toLowerCase()] || item.gesture}</span>
                    <span style={{ color: '#6366f1' }}>{item.confidence}%</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>
                  {!token ? (t.sandboxDesc || 'Authentication is disabled in local sandbox mode.') : (t.noDetections || 'No recent logs generated.')}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- Production History Overlay Slide-out Drawer Panel --- */}
      {showHistory && <div className="history-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 150 }} onClick={() => setShowHistory(false)} />}
      <div className={`history-panel ${showHistory ? 'open' : ''}`}>
        <div className="history-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <History size={16}/>{t.historyPanel || 'Analytics Profile'}
          </h2>
          <button className="nav-icon-btn" style={{ padding: '6px' }} onClick={() => setShowHistory(false)}><X size={16}/></button>
        </div>

        {stats && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0' }}>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px' }}>
              <TrendingUp size={16} style={{ color: '#6366f1' }}/>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px' }}>{stats.total}</div>
              <div className="stat-label" style={{ color: '#64748b', fontSize: '0.75rem' }}>{t.totalDetections || 'Total Runs'}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px' }}>
              <Award size={16} style={{ color: '#f59e0b' }}/>
              <div className="stat-value" style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '6px', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.gestures?.[stats.most_used?.toLowerCase()] || stats.most_used || '-'}
              </div>
              <div className="stat-label" style={{ color: '#64748b', fontSize: '0.75rem' }}>{t.mostUsed || 'Peak Sign'}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px' }}>
              <Calendar size={16} style={{ color: '#22c55e' }}/>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px' }}>{stats.today}</div>
              <div className="stat-label" style={{ color: '#64748b', fontSize: '0.75rem' }}>{t.todayCount || 'Today'}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px' }}>
              <Target size={16} style={{ color: '#8b5cf6' }}/>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '6px' }}>{stats.avg_conf}%</div>
              <div className="stat-label" style={{ color: '#64748b', fontSize: '0.75rem' }}>{t.avgConfidence || 'Avg Conf'}</div>
            </div>
          </div>
        )}

        {/* Dynamic Model Suggestions Module */}
        <div className="panel-section" style={{ marginTop: '24px' }}>
          <p className="section-title" style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>{t.suggestions || 'Recommended Practices'}</p>
          {suggestions.length > 0 ? (
            suggestions.map((gesture, i) => (
              <div className="suggestion-item" key={i} style={{ display: 'flex', gap: '10px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '8px' }}>
                <span>🎯</span>
                <span>
                  {t.suggestionText || 'Try practicing '}{' '}
                  <strong style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {t.gestures?.[gesture] || gesture}
                  </strong>{' '}
                  — {lang === 'fr' ? 'non pratiqué récemment !' : 'not practiced recently!'}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: '#475569', fontSize: '0.85rem', fontStyle: 'italic' }}>{t.noSuggestions || 'Profile fully balanced.'}</p>
          )}
        </div>

        {/* Historical Stream Module */}
        <div className="panel-section" style={{ marginTop: '24px' }}>
          <p className="section-title" style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>{t.recentHistory || 'Full Log Stream'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {history.length > 0 ? (
              history.map((item, i) => (
                <div className="history-item" key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <span className="history-gesture" style={{ fontWeight: '600', fontSize: '0.95rem' }}>{t.gestures?.[item.gesture?.toLowerCase()] || item.gesture}</span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="history-confidence" style={{ color: '#34d399', fontWeight: '500', fontSize: '0.9rem' }}>{item.confidence}%</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#475569', fontSize: '0.85rem', fontStyle: 'italic' }}>{t.noHistory || 'Logs empty.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard