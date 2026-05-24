import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Navbar from './Navbar'

function Landing({ theme, toggleTheme, lang, toggleLang }) {
  const navigate = useNavigate()

  return (
    <div className="app-container">
      {/* Dynamic Navbar Sync */}
      <Navbar theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
      
      {/* Primary Hero Section Wrapper */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px', alignItems: 'center' }} className="workspace-layout">
          
          {/* Left Text Presentation Side */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', color: '#c084fc', marginBottom: '24px', fontWeight: '500' }}>
              🔮 Academic Project 2025-2026
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.02em' }}>
              Bridging the Gap <br />Between <span style={{ background: 'linear-gradient(to right, #b4ffd6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Silence</span> and Speech
            </h1>
            
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px', maxWidth: '540px' }}>
              SignSpeak is an AI-powered web application that translates American Sign Language (ASL) gestures from your webcam into text and spoken audio in real time.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {/* Correct route entry strategy: Sends them directly into the public sandbox workspace */}
              <button className="btn-base btn-purple" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={() => navigate('/dashboard')}>
                <span>Start Translating</span>
                <ArrowRight size={16} />
              </button>
              <button className="btn-base btn-outline" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Learn More
              </button>
            </div>
          </div>

          {/* Right Preview Card Box (Replicated From image_66e423.jpg) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '460px', background: '#0b1324', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', color: '#475569' }}>LIVE FEED</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>CONNECTED</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}>
                  <span style={{ fontSize: '3rem' }}>✋</span>
                </div>
              </div>

              <div style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Detected Gesture</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '0.05em' }}>HELLO</div>
                </div>
                <div style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '99px', fontWeight: '700' }}>
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