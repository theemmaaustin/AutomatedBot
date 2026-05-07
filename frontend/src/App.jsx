import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider, useData } from './context/DataContext'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import TradesLedger from './pages/TradesLedger'
import Diagnostics from './pages/Diagnostics'
import Strategy from './pages/Strategy'

/* ─── Sign-In Modal ──────────────────────────────────────────────────────── */
function SignInModal({ onClose }) {
  const { signIn } = useData()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const msg = await signIn(email, password)
    if (msg) { setErr(msg); setLoading(false) }
  }

  return (
    <div
      className="nova-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="nova-modal">
        <button className="nova-modal-close" onClick={onClose}>✕</button>

        <div className="nova-logo" style={{ marginBottom: 28, fontSize: 16 }}>
          Nova<span>.</span>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--nwhite)' }}>
          Sign in
        </h2>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--muted)', marginBottom: 28, letterSpacing: '0.04em' }}>
          Access your live strategy dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              className="nova-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              className="nova-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {err && (
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '10px 14px' }}>
              {err}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(240,237,232,0.25)', marginTop: 4 }}>
            Forgot password?{' '}
            <a
              href="https://supabase.com/dashboard/project/lqaodrawvtnhukgwvqci/auth/users"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--gold)', textDecoration: 'none' }}
            >
              Reset via Supabase →
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

/* ─── Landing Page ───────────────────────────────────────────────────────── */
function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <div className="nova-body" style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav className="nova-nav">
        <div className="nova-logo">Nova<span>.</span></div>
        <ul className="nova-nav-links">
          <li><a href="#">Markets</a></li>
          <li><a href="#">Signals</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Pricing</a></li>
        </ul>
        <button className="nova-nav-cta" onClick={() => setShowSignIn(true)}>
          Sign In
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="nova-hero">
        <div className="blob hero-blob-1" style={{ width: 600, height: 600, background: 'rgba(181,23,90,0.28)', top: -100, right: -80 }} />
        <div className="blob hero-blob-2" style={{ width: 400, height: 400, background: 'rgba(201,147,58,0.2)', bottom: 0, left: 100 }} />
        <div className="blob hero-blob-3" style={{ width: 300, height: 300, background: 'rgba(26,107,90,0.22)', top: 200, right: 300 }} />

        <div className="nova-hero-label">Forex Intelligence Platform</div>
        <h1>
          Your edge.<br />
          Always on.
          <span className="dim">Always clear.</span>
        </h1>
        <p className="nova-hero-sub">
          SMC/ICT signals. Real-time confluence. Prop firm ready. Built for traders who don't guess.
        </p>
        <div className="nova-hero-actions">
          <button className="btn-primary" onClick={() => setShowSignIn(true)}>
            Sign In
          </button>
          <button className="btn-ghost">[ View Signals ]</button>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="nova-ticker">
        <div className="nova-ticker-track">
          {[
            { pair: 'EUR/USD', price: '1.08432', chg: '+0.12%', up: true },
            { pair: 'GBP/USD', price: '1.26781', chg: '-0.08%', up: false },
            { pair: 'USD/JPY', price: '149.23',  chg: '+0.31%', up: true },
            { pair: 'XAU/USD', price: '2341.50', chg: '+0.44%', up: true },
            { pair: 'BTC/USD', price: '67,842',  chg: '-1.2%',  up: false },
            { pair: 'NAS100',  price: '18,234',  chg: '+0.6%',  up: true },
            { pair: 'EUR/USD', price: '1.08432', chg: '+0.12%', up: true },
            { pair: 'GBP/USD', price: '1.26781', chg: '-0.08%', up: false },
            { pair: 'USD/JPY', price: '149.23',  chg: '+0.31%', up: true },
            { pair: 'XAU/USD', price: '2341.50', chg: '+0.44%', up: true },
            { pair: 'BTC/USD', price: '67,842',  chg: '-1.2%',  up: false },
            { pair: 'NAS100',  price: '18,234',  chg: '+0.6%',  up: true },
          ].map((t, i) => (
            <div key={i} className="nova-ticker-item">
              <span className="ticker-pair">{t.pair}</span>
              <span className="ticker-price">{t.price}</span>
              <span className={`ticker-change ${t.up ? 'up' : 'down'}`}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES / BENTO ── */}
      <section className="nova-section">
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(181,23,90,0.15)', top: -100, right: -100, filter: 'blur(100px)' }} />
        <div className="blob" style={{ width: 400, height: 400, background: 'rgba(26,107,90,0.15)', bottom: -50, left: -50, filter: 'blur(100px)' }} />

        <div className="nova-section-label">What Nova sees</div>
        <div className="nova-section-title">
          Signal.<br /><span className="dim">Structure.</span><br />Edge.
        </div>

        <div className="nova-bento">
          {/* Card 1: EUR/USD price */}
          <div className="nova-card c1">
            <div className="card-inner-blob" style={{ width: 300, height: 300, background: 'rgba(201,147,58,0.18)', bottom: -80, right: -80 }} />
            <div className="nova-card-tag">Live Graph · EUR/USD</div>
            <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 12, marginBottom: 8 }}>Current Price</div>
            <div className="nova-big-num">1.0843<span className="unit">usd</span></div>
            <div className="nova-sparkline">
              <svg viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(201,147,58,0.3)" />
                    <stop offset="100%" stopColor="rgba(201,147,58,0)" />
                  </linearGradient>
                </defs>
                <polyline points="0,35 20,28 40,30 60,20 80,24 100,15 120,18 140,10 160,14 180,8 200,12"
                  fill="none" stroke="rgba(201,147,58,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                <polyline points="0,35 20,28 40,30 60,20 80,24 100,15 120,18 140,10 160,14 180,8 200,12 200,40 0,40"
                  fill="url(#goldGrad)" stroke="none" />
              </svg>
            </div>
            <p className="nova-card-desc">Real-time EURUSD price with SMC bias overlay. Session-aware, spread-adjusted.</p>
          </div>

          {/* Card 2: Watch list */}
          <div className="nova-card c2">
            <div className="card-inner-blob" style={{ width: 200, height: 200, background: 'rgba(181,23,90,0.2)', top: -60, right: -60 }} />
            <div className="nova-card-tag">Watch List</div>
            <div className="pair-grid">
              <div className="pair-cell"><div className="pair-name">GBP/USD</div><div className="pair-val up">+0.14%</div></div>
              <div className="pair-cell"><div className="pair-name">USD/JPY</div><div className="pair-val down">-0.09%</div></div>
              <div className="pair-cell"><div className="pair-name">XAU/USD</div><div className="pair-val up">+0.44%</div></div>
              <div className="pair-cell"><div className="pair-name">NAS100</div><div className="pair-val up">+0.61%</div></div>
            </div>
          </div>

          {/* Card 3: Session */}
          <div className="nova-card c3">
            <div className="card-inner-blob" style={{ width: 180, height: 180, background: 'rgba(26,107,90,0.25)', bottom: -40, left: -40 }} />
            <div className="nova-card-tag">Session</div>
            <div className="nova-big-num" style={{ fontSize: 42 }}>NYC</div>
            <div style={{ marginTop: 10, fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>Open · 09:30 EST</div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 4, flex: 1, background: 'rgba(74,222,128,0.5)', borderRadius: 2 }} />)}
              {[4,5].map(i => <div key={i} style={{ height: 4, flex: 1, background: 'var(--border)', borderRadius: 2 }} />)}
            </div>
          </div>

          {/* Card 4: Active Signals */}
          <div className="nova-card c4">
            <div className="card-inner-blob" style={{ width: 200, height: 200, background: 'rgba(201,147,58,0.15)', top: -50, left: -50 }} />
            <div className="nova-card-tag">Active Signals</div>
            <div className="signal-row"><span className="signal-name">BOS · 1H</span><span className="signal-badge badge-long">LONG</span></div>
            <div className="signal-row"><span className="signal-name">OB · 4H</span><span className="signal-badge badge-short">SHORT</span></div>
            <div className="signal-row"><span className="signal-name">FVG · 15M</span><span className="signal-badge badge-wait">WAIT</span></div>
          </div>

          {/* Card 5: Win rate */}
          <div className="nova-card c3">
            <div className="card-inner-blob" style={{ width: 200, height: 200, background: 'rgba(181,23,90,0.2)', bottom: -60, right: -60 }} />
            <div className="nova-card-tag">Win Rate</div>
            <div className="nova-big-num" style={{ color: 'var(--gold)' }}>68<span className="unit">%</span></div>
            <p className="nova-card-desc" style={{ fontSize: 11, marginTop: 8 }}>Last 90 days · 312 signals</p>
          </div>

          {/* Card 6: Monthly PnL */}
          <div className="nova-card c6">
            <div className="card-inner-blob" style={{ width: 350, height: 350, background: 'rgba(26,107,90,0.18)', bottom: -100, right: -100 }} />
            <div className="nova-card-tag">Performance · Monthly PnL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
              <div className="nova-big-num" style={{ fontSize: 40, color: '#4ade80' }}>+24.3<span className="unit">%</span></div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>This month</div>
            </div>
            <div className="nova-chart-bars">
              {[
                { h: '40%', c: 'rgba(74,222,128,0.5)' },
                { h: '65%', c: 'rgba(74,222,128,0.6)' },
                { h: '45%', c: 'rgba(248,113,113,0.5)' },
                { h: '80%', c: 'rgba(74,222,128,0.7)' },
                { h: '55%', c: 'rgba(74,222,128,0.55)' },
                { h: '70%', c: 'rgba(74,222,128,0.65)' },
                { h: '35%', c: 'rgba(248,113,113,0.5)' },
                { h: '90%', c: 'rgba(201,147,58,0.8)' },
                { h: '75%', c: 'rgba(74,222,128,0.7)' },
                { h: '60%', c: 'rgba(74,222,128,0.6)' },
                { h: '85%', c: 'rgba(74,222,128,0.75)' },
                { h: '95%', c: 'rgba(201,147,58,0.9)' },
              ].map((b, i) => (
                <div key={i} className="nova-bar" style={{ height: b.h, background: b.c }} />
              ))}
            </div>
          </div>

          {/* Card 7: Market Regime */}
          <div className="nova-card c5">
            <div className="card-inner-blob" style={{ width: 200, height: 200, background: 'rgba(181,23,90,0.25)', top: -60, right: -60 }} />
            <div className="nova-card-tag">Market Regime</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--nwhite)' }}>Trending</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.15em', marginTop: 6 }}>BULLISH · HIGH CONF</div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                <span style={{ color: 'var(--muted)' }}>Confidence</span><span style={{ color: 'var(--nwhite)' }}>87%</span>
              </div>
              <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '87%', background: 'var(--gold)', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <div className="nova-stats-row">
        {[
          { num: '27',   label: 'SMC Signals',  blob: 'rgba(201,147,58,0.12)',  pos: { top: -80, left: -80 } },
          { num: '1.96', label: 'Sharpe Ratio', blob: 'rgba(181,23,90,0.12)',   pos: { bottom: -80, right: -40 } },
          { num: '68%',  label: 'Win Rate',     blob: 'rgba(26,107,90,0.12)',   pos: { top: -60, right: -60 } },
          { num: '$50K', label: 'Prop Target',  blob: 'rgba(201,147,58,0.1)',   pos: { bottom: -60, left: -40 } },
        ].map(s => (
          <div key={s.label} className="nova-stat-cell">
            <div className="cell-blob" style={{ width: 250, height: 250, background: s.blob, ...s.pos }} />
            <div className="nova-stat-num">{s.num}</div>
            <div className="nova-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="nova-section">
        <div className="blob" style={{ width: 400, height: 400, background: 'rgba(201,147,58,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(100px)' }} />
        <div className="nova-section-label">The Process</div>
        <div className="nova-section-title">How<br /><span className="dim">Nova works.</span></div>

        <div className="nova-steps">
          <div className="nova-step">
            <div className="step-blob" style={{ width: 200, height: 200, background: 'rgba(201,147,58,0.15)', bottom: -60, right: -60 }} />
            <div className="nova-step-num">01 —</div>
            <h3>Market Structure First</h3>
            <p>Nova maps BOS, CHoCH, and inducement across all timeframes. Top-down from Daily to 15M. Structure before entry, always.</p>
          </div>
          <div className="nova-step">
            <div className="step-blob" style={{ width: 200, height: 200, background: 'rgba(181,23,90,0.15)', top: -60, left: -60 }} />
            <div className="nova-step-num">02 —</div>
            <h3>Confluence Engine</h3>
            <p>27 SMC/ICT signals scored and ranked in real time. Order blocks, FVGs, liquidity voids — weighted by session and HTF bias.</p>
          </div>
          <div className="nova-step">
            <div className="step-blob" style={{ width: 200, height: 200, background: 'rgba(26,107,90,0.15)', bottom: -60, left: -60 }} />
            <div className="nova-step-num">03 —</div>
            <h3>Execute with Precision</h3>
            <p>Clear entries, SL, and TP. Risk parameters sized for E8 and other prop firm rules. Journal every trade automatically.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="nova-footer-cta">
        <div className="blob" style={{ width: 500, height: 500, background: 'rgba(181,23,90,0.22)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(80px)' }} />
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(201,147,58,0.18)', top: '30%', left: '60%', filter: 'blur(80px)' }} />
        <h2>
          Trade smarter.<br /><span className="dim">Not harder.</span>
        </h2>
        <div className="nova-cta-row">
          <input className="nova-footer-input" type="email" placeholder="your@email.com" />
          <button className="btn-primary" onClick={() => setShowSignIn(true)}>Get Early Access</button>
        </div>
      </section>

      {/* ── WORDMARK ── */}
      <div className="nova-wordmark">Nova</div>

      {/* ── FOOTER ── */}
      <footer className="nova-footer">
        <div className="nova-footer-logo">Nova<span>.</span></div>
        <ul className="nova-footer-links">
          <li><a href="#">Features</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Telegram</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div className="nova-footer-copy">© 2025 Nova · All rights reserved</div>
      </footer>

      {/* ── SIGN-IN MODAL ── */}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </div>
  )
}

/* ─── Placeholder pages ──────────────────────────────────────────────────── */
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-widest text-gray-600">{title}</p>
        <p className="text-xs text-gray-700 mt-1">Coming soon</p>
      </div>
    </div>
  )
}

/* ─── App shell (post-auth) ──────────────────────────────────────────────── */
function AppShell() {
  const { authReady, authSession } = useData()

  if (!authReady) return (
    <div style={{ minHeight: '100vh', background: '#070707', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#c9933a', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!authSession) return <LandingPage />

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Routes>
              <Route path="/"            element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/trades"      element={<TradesLedger />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/strategy"    element={<Strategy />} />
              <Route path="/execution"   element={<PlaceholderPage title="EXECUTION" />} />
              <Route path="/about"       element={<PlaceholderPage title="ABOUT" />} />
              <Route path="/logs"        element={<PlaceholderPage title="SYSTEM LOGS" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  )
}
