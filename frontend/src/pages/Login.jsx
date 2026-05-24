import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from './Navbar'

function Login({ theme, toggleTheme, lang, toggleLang, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('https://motivated-achievement-production-46e4.up.railway.app/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username || email.split('@')[0])
      if (onLoginSuccess) onLoginSuccess()
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid identity matching profiles found.')
    }
  }

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>Sign in to continue tracking your translation analytics.</p>
          
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="dark-input-group">
              <label>Email Address</label>
              <input type="email" className="dark-input" placeholder="name@domain.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="dark-input-group">
              <label>Account Password</label>
              <input type="password" className="dark-input" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-base btn-purple" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>Authenticate Session</button>
          </form>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '20px', textAlign: 'center' }}>New here? <span style={{ color: '#8b5cf6', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Create an account</span></p>
        </div>
      </div>
    </div>
  )
}

export default Login