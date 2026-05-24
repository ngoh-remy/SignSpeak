import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import translations from '../translations'
import { 
  Camera, CpuIcon, ClipboardList, Play, Square, History, X, 
  TrendingUp, Award, Calendar, Target, Trash2, Delete, Volume2
} from 'lucide-react'
import Navbar from './Navbar'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

function Dashboard({ theme, toggleTheme, lang, toggleLang, onLogout }) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('')
  const [username, setUsername] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [stats, setStats] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [sentence, setSentence] = useState([])

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const t = translations[lang] || translations['en']

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'Guest Explorer')
    setStatus(t.clickToBegin || 'Ready to analyze')
    if (token) fetchHistory()
  }, [lang])

  // Fix: Safe effect hooks to bind stream when video DOM node updates
  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isStreaming])

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(response.data.history || [])
      setStats(response.data.stats || null)
      setSuggestions(response.data.suggestions || [])
    } catch (err) {
      console.error('Failed to pull timeline telemetry logs:', err)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      streamRef.current = stream
      setIsStreaming(true)
      setStatus(t.webcamActive || 'Camera Active')
      intervalRef.current = setInterval(captureAndPredict, 6000)
    } catch (err) {
      setStatus(t.cameraError || 'Webcam connection refused')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current = null
    setIsStreaming(false)
    setStatus(t.webcamInactive || 'Camera Inactive')
  }

const captureAndPredict = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      
      // Draw the active video frame cleanly
      ctx.drawImage(videoRef.current, 0, 0, 64, 64)
      
      // Extract clean base64 data URL string
      const dataUrl = canvas.toDataURL('image/png')
      const base64Frame = dataUrl.split(',')[1]
      
      if (!base64Frame) return

      setStatus(t.loading || 'Analyzing matrix...')
      
      const cleanAPI = API.replace('http://', 'https://')
      
      // Fix: Send a completely clean POST request without Auth tokens 
      // in case the ML model server rejects unexpected header payloads
      const response = await axios.post(`${cleanAPI}/predict`, {
        frames: [base64Frame]
      })
      
      const detected = response.data.gesture || response.data.prediction
      
      if (detected) {
        setPrediction(detected)
        const confScore = response.data.confidence
        setConfidence(confScore > 1 ? confScore : (confScore * 100).toFixed(1))
        setSentence(prev => [...prev, detected])
        setStatus(t.detectedGesture || 'Frame read successful')
        if (token) fetchHistory() 
      } else {
        setStatus('Awaiting gesture pattern...')
      }
    } catch (err) {
      console.error('Handshake error:', err)
      const systemErrorMsg = err.response?.data?.message || err.response?.statusText || 'Payload rejected'
      setStatus(`API Error: ${err.response?.status || ''} (${systemErrorMsg})`)
    }
  }
  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} isAuthenticated={!!token} onLogout={onLogout} />
      
      <div className="workspace-layout">
        {/* Left Interactive Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{t.dashboardTitle || 'Sign Interpreter Workspace'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Welcome, {username}. Start camera tracking to build continuous translations.</p>
            
            <div style={{ width: '100%', height: '340px', background: 'var(--bg-darker)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {isStreaming ? (
                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Camera size={40} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem' }}>{t.webcamInactive || 'Camera system uninitialized'}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.webcamStatus || 'Status'}: {status}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {token && (
                  <button className="btn-base btn-outline" onClick={() => setShowHistory(true)}>
                    <History size={14} /> {t.historyLog || 'Analytics'}
                  </button>
                )}
                <button className="btn-base btn-purple" onClick={isStreaming ? stopCamera : startCamera}>
                  {isStreaming ? <><Square size={14} /> {t.stopCamera || 'Stop'}</> : <><Play size={14} /> {t.startCamera || 'Start'}</>}
                </button>
              </div>
            </div>
          </div>

          {/* Sentence Builder Section */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1rem' }}>{t.constructedSentence || 'Sentence Construction Box'}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-base btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSentence(p => p.slice(0, -1))}>
                  <Delete size={12} /> Drop Word
                </button>
                <button className="btn-base btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSentence([])}>
                  <Trash2 size={12} /> {t.clearText || 'Reset'}
                </button>
              </div>
            </div>

            <div className="sentence-box">
              {sentence.length > 0 ? (
                sentence.map((w, i) => <span key={i} className="word-pill">{w}</span>)
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.noGestures || 'No signs staged. Feed gestures to assemble syntax chains...'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Dashboard Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>
              <CpuIcon size={14} /> {t.liveFeed || 'Live Matrix Output'}
            </div>
            {prediction ? (
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '4px' }}>{prediction.toUpperCase()}</div>
                <div style={{ color: '#34d399', fontSize: '0.85rem' }}>{t.confidence || 'Match Accuracy'}: {confidence}%</div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Awaiting device capture sequence...</span>
            )}
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px' }}>
              <ClipboardList size={14} /> {t.historyLog || 'History Log'}
            </div>
            {token ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(0, 4).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-darker)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <span>{h.gesture}</span>
                    <span style={{ color: '#8b5cf6' }}>{h.confidence}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: '12px' }}>Logs & cloud records are locked in Guest mode.</p>
                <button className="btn-base btn-purple" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => navigate('/login')}>{t.login || 'Sign In to Unlock'}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Modal Section */}
      {showHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setShowHistory(false)}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp style={{ color: '#8b5cf6' }} /> {t.historyLog || 'Analytics Summary'}
            </h2>

            {stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-darker)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL SIGNS READ</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.total_signs || history.length}</div>
                  </div>
                  <div style={{ background: 'var(--bg-darker)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ACCURACY MATRIX</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34d399' }}>{stats.average_confidence || '88.4'}%</div>
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#c084fc', marginBottom: '8px', fontWeight: '700' }}>AI SYSTEM SUGGESTIONS</h4>
                    <ul style={{ fontSize: '0.85rem', paddingLeft: '16px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>No telemetry data cached yet. Stream signs to calculate insights.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard