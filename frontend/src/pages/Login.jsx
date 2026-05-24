import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Sun, Moon, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/signspeaklogo.svg'
import translations from '../translations'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

function Login({ theme, toggleTheme, lang, toggleLang }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  const t = translations[lang]

  const handleLogin = async () => {
    if (!email || !password) { setError(t.fillAllFields); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/login`, { email, password })
      localStorage.setItem('token',    res.data.token)
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('userId',   res.data.id)
      localStorage.setItem('lang',     lang)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || t.loginFailed)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-top">
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'en' ? 'FR' : 'EN'}
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
          <span className="nav-btn-text">{theme === 'dark' ? t.light : t.dark}</span>
        </button>
      </div>

      <div className="auth-card card">
        <div className="auth-logo">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <img src={logo} alt="SignSpeak Logo" />
            </div>
            <span className="logo-text">{t.appName}</span>
          </div>
        </div>

        <div className="auth-title">{t.welcomeBack}</div>
        <div className="auth-subtitle">{t.signInSub}</div>

        {error && <div className="error-msg">{error}</div>}

        <input 
          className="input-field" 
          type="email"
          placeholder={t.emailPlaceholder} 
          value={email}
          onChange={e => setEmail(e.target.value)} 
        />

        {/* Wrapped inline absolute button layout natively using simple relative styles */}
        <div className="relative w-full" style={{ position: 'relative' }}>
          <input
            className="input-field"
            type={showPassword ? 'text' : 'password'}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            style={{
              position: 'absolute', right: '14px', top: '22px',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
            }}
          >
            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? t.loggingIn : t.loginBtn}
        </button>

        <div className="auth-link">
          {t.noAccount} <Link to="/signup">{t.signUpFree}</Link>
        </div>
      </div>
    </div>
  )
}

export default Login