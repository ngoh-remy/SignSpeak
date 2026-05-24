import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Globe, Sun, Moon, LayoutDashboard } from 'lucide-react'

function Navbar({ theme, toggleTheme, lang, toggleLang, isAuthenticated, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token') || isAuthenticated
  const username = localStorage.getItem('username') || 'R'
  const initialLetter = username.charAt(0).toUpperCase()

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    if (onLogout) onLogout()
    navigate('/')
  }

  return (
    <header style={{ width: '100%', background: '#090d1a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', sticky: 'top', zIndex: 50 }}>
      <div style={{ max_width: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand App Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>S</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SignSpeak</span>
        </div>

        {/* Dynamic Controls Cluster Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Workspace Shortcut Toggle */}
          {location.pathname !== '/dashboard' && (
            <button className="nav-pill-btn" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={14} />
              <span>Workspace</span>
            </button>
          )}

          {/* Language Switcher Button */}
          <button className="nav-pill-btn" onClick={toggleLang}>
            <Globe size={14} />
            <span style={{ textTransform: 'uppercase', fontWeight: '700' }}>{lang || 'en'}</span>
          </button>

          {/* Theme Dynamic Selector */}
          <button className="nav-pill-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          {/* User Account State Validation Pipeline */}
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Organized Round Avatar Badge */}
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}>
                {initialLetter}
              </div>
              <button className="nav-pill-btn nav-logout-btn" onClick={handleSignOut}>
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            location.pathname !== '/login' && (
              <button className="btn-base btn-purple" style={{ padding: '8px 18px', borderRadius: '99px', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
                Sign In
              </button>
            )
          )}

        </div>
      </div>
    </header>
  )
}

export default Navbar