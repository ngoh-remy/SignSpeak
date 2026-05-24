import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Navbar from './Navbar' // Fixed path: It sits in the same directory (src/pages/)
import translations from '../translations'
import logoAsset from '../assets/signspeaklogo.svg' // Fixed path: going up to src, then into assets

function Landing({ theme, toggleTheme, lang, toggleLang }) {
  const navigate = useNavigate()
  const t = translations[lang] || translations['en']

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
        <div className="workspace-layout">
          
          {/* Left Block: Direct Value Proposition */}
          <div className="hero-text-align-fix">
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)', fontWeight: '800', lineHeight: '1.15', marginBottom: '24px', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
              {t.heroTitle1} <br />{t.heroTitle2} <span style={{ background: 'linear-gradient(to right, #34d399, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.heroTitle3}</span> {t.heroTitle4}
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.65', marginBottom: '40px', maxWidth: '520px' }}>
              {t.heroDesc}
            </p>

            <div>
              <button className="btn-base btn-purple" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }} onClick={() => navigate('/dashboard')}>
                <span>{t.startTranslating}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Block: Live Feed Preview Element */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="premium-preview-card glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
              
              {/* Header Feed Subtext */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>{t.liveFeed}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>{t.connected}</span>
                </div>
              </div>

              {/* Central Box with the Initial SignSpeak Logo Asset */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '48px 0' }}>
                <div className="gentle-bounce-logo" style={{ width: '110px', height: '110px', borderRadius: '24px', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}>
                  <img src={logoAsset} alt="SignSpeak Logo Core" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Output Visualization Panel */}
              <div style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>{t.detectedGesture}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>HELLO</div>
                </div>
                <div style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.75rem', padding: '6px 14px', borderRadius: '99px', fontWeight: '700' }}>
                  98.4% {t.confidence}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Landing