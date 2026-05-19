import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Sun, Moon } from 'lucide-react'
import logo from '../assets/signspeaklogo.svg'
import translations from '../translations'
import {  Eye, EyeOff } from 'lucide-react'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'


function Login({ theme, toggleTheme, lang, toggleLang }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  const t = translations[lang]
  // 💡 t = translations['en'] or translations['fr']
  //    Now t.loginBtn gives "Login" or "Connexion"
  //    We just use t.anyKey anywhere we need translated text!

  const handleLogin = async () => {
    if (!email || !password) { setError(t.fillAllFields); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/login`, { email, password })
      localStorage.setItem('token',    res.data.token)
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('userId',   res.data.id)
      localStorage.setItem('lang',     lang)
      // 💡 Save language to localStorage so dashboard
      //    starts in the same language the user chose
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || t.loginFailed)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-top">
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'en' ? 'FR' : ' EN'}
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <><Sun size={15}/> {t.light}</> : <><Moon size={15}/> {t.dark}</>}
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

        <input className="input-field" type="email"
          placeholder={t.emailPlaceholder} value={email}
          onChange={e => setEmail(e.target.value)} />

        <div style={{ position: 'relative', marginBottom: '1rem' }}>
  <input
    className="input-field"
    type={showPassword ? 'text' : 'password'}
    placeholder={t.passwordPlaceholder}
    value={password}
    onChange={e => setPassword(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleLogin()}
    style={{ marginBottom: 0 }}
  />
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    style={{
      position: 'absolute', right: '12px', top: '50%',
      transform: 'translateY(-50%)',
      background: 'none', border: 'none',
      cursor: 'pointer', color: 'var(--text-secondary)',
      display: 'flex', alignItems: 'center'
    }}
  >
    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
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