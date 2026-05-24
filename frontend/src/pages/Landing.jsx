import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import Navbar from './Navbar'

function Landing({ theme, toggleTheme, lang, toggleLang }) {
  const navigate = useNavigate()

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '60px 24px' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center' }} className="workspace-layout hero-grid-fix">
          
          {/* Left Text Block */}
          <div className="hero-text-align-fix">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', color: '#c084fc', marginBottom: '24px', fontWeight: '600' }}>
              <Sparkles size={12} />
              <span>Academic Project 2025-2026</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.03em' }}>
              Bridging the Gap <br />Between <span style={{ background: 'linear-gradient(to right, #34d399, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Silence</span> and Speech
            </h1>
            
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.65', marginBottom: '36px', maxWidth: '520px' }}>
              SignSpeak is an AI-powered web application that translates American Sign Language (ASL) gestures from your webcam into text and spoken audio in real time.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <button className="btn-base btn-purple" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }} onClick={() => navigate('/dashboard')}>
                <span>Start Translating</span>
                <ArrowRight size={16} />
              </button>
              <button className="btn-base btn-outline" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }}>
                Learn More
              </button>
            </div>
          </div>

          {/* Right Preview Card Box */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="premium-preview-card" style={{ width: '100%', maxWidth: '450px', background: 'linear-gradient(145deg, #0f172a, #070a13)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '28px', position: 'relative' }}>
              
              {/* Header Feed Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', color: '#475569' }}>LIVE INTERPRETER FEED</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', letterSpacing: '0.05em' }}>CONNECTED</span>
                </div>
              </div>

              {/* Central Vector Logo Badge Placeholder (Replaced Hand Emoji) */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '48px 0' }}>
                <div className="gentle-bounce-logo" style={{ width: '110px', height: '110px', borderRadius: '24px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(139,92,246,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.05em' }}>SS</span>
                </div>
              </div>

              {/* Target Translation Output Card Footer */}
              <div style={{ background: 'rgba(2, 6, 23, 0.7)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.05em' }}>DETECTED GESTURE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.02em', color: '#fff' }}>HELLO</div>
                </div>
                <div style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.75rem', padding: '6px 14px', borderRadius: '99px', fontWeight: '700' }}>
                  98.4% Confidence
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