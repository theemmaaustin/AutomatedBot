import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider, useData } from './context/DataContext'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import TradesLedger from './pages/TradesLedger'
import Diagnostics from './pages/Diagnostics'
import Strategy from './pages/Strategy'

/* ─── Ribbon ─────────────────────────────────────────────────────────────── */
// Trefoil-knot inspired 3D ribbon — simulates the same iridescent twisted
// sculpture style as the Tradex reference (which uses a Blender/Cinema 4D render).
// We layer: shadow pass → mid-color pass → bright highlight pass → specular lines.
function RibbonSVG() {
  return (
    <svg
      viewBox="0 0 500 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        {/* Iridescent colour stops — blue → violet → teal → green */}
        <linearGradient id="g-blue-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#3A86FF" />
          <stop offset="40%"  stopColor="#8338EC" />
          <stop offset="75%"  stopColor="#06D6A0" />
          <stop offset="100%" stopColor="#4CC9F0" />
        </linearGradient>
        <linearGradient id="g-violet-cyan" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4CC9F0" />
          <stop offset="35%"  stopColor="#7209B7" />
          <stop offset="70%"  stopColor="#06D6A0" />
          <stop offset="100%" stopColor="#3A86FF" />
        </linearGradient>
        <linearGradient id="g-teal-purple" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#06D6A0" />
          <stop offset="45%"  stopColor="#4CC9F0" />
          <stop offset="100%" stopColor="#8338EC" />
        </linearGradient>
        <linearGradient id="g-deep" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"   stopColor="#240046" />
          <stop offset="50%"  stopColor="#3A0CA3" />
          <stop offset="100%" stopColor="#0a0020" />
        </linearGradient>
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#4CC9F0" />
          <stop offset="55%"  stopColor="#06D6A0" />
          <stop offset="100%" stopColor="#3A86FF" />
        </linearGradient>

        {/* Outer bloom glow */}
        <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Softer inner glow */}
        <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Ambient halo ── */}
      <ellipse cx="250" cy="280" rx="195" ry="210" fill="#7B2FFF" opacity="0.09" />
      <ellipse cx="240" cy="270" rx="140" ry="155" fill="#4CC9F0" opacity="0.055" />

      {/* ═══════════════════════════════════════════════
          RIBBON A — large sweeping outer arc
          (trefoil lobe 1: top → left → bottom-right)
      ═══════════════════════════════════════════════ */}
      {/* shadow */}
      <path d="M 250 80 C 340 60 430 120 430 220 C 430 320 360 380 280 400 C 200 420 120 390 90 320 C 60 250 90 160 160 130 C 230 100 290 130 310 190 C 330 250 300 310 250 320 C 200 330 155 300 145 250"
        stroke="#0a0020" strokeWidth="52" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* mid colour */}
      <path d="M 250 80 C 340 60 430 120 430 220 C 430 320 360 380 280 400 C 200 420 120 390 90 320 C 60 250 90 160 160 130 C 230 100 290 130 310 190 C 330 250 300 310 250 320 C 200 330 155 300 145 250"
        stroke="url(#g-blue-teal)" strokeWidth="40" strokeLinecap="round" fill="none" opacity="0.82" filter="url(#bloom)" />
      {/* bright core */}
      <path d="M 250 80 C 340 60 430 120 430 220 C 430 320 360 380 280 400 C 200 420 120 390 90 320 C 60 250 90 160 160 130 C 230 100 290 130 310 190 C 330 250 300 310 250 320 C 200 330 155 300 145 250"
        stroke="url(#g-violet-cyan)" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* ═══════════════════════════════════════════════
          RIBBON B — crossing band through the center
          (trefoil lobe 2: right-high → center-cross → bottom-left)
      ═══════════════════════════════════════════════ */}
      <path d="M 370 110 C 420 170 410 260 360 320 C 310 380 240 400 180 380 C 120 360 80 300 90 240 C 100 180 150 150 200 160 C 250 170 280 210 270 260 C 260 310 220 340 175 340"
        stroke="#050015" strokeWidth="44" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M 370 110 C 420 170 410 260 360 320 C 310 380 240 400 180 380 C 120 360 80 300 90 240 C 100 180 150 150 200 160 C 250 170 280 210 270 260 C 260 310 220 340 175 340"
        stroke="url(#g-teal-purple)" strokeWidth="34" strokeLinecap="round" fill="none" opacity="0.78" filter="url(#glow2)" />
      <path d="M 370 110 C 420 170 410 260 360 320 C 310 380 240 400 180 380 C 120 360 80 300 90 240 C 100 180 150 150 200 160 C 250 170 280 210 270 260 C 260 310 220 340 175 340"
        stroke="url(#g-gold)" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* ═══════════════════════════════════════════════
          RIBBON C — inner twisting loop
          (trefoil lobe 3: center → top-left → bottom → right)
      ═══════════════════════════════════════════════ */}
      <path d="M 200 150 C 140 120 90 150 80 210 C 70 270 110 330 170 355 C 230 380 300 360 340 310 C 380 260 380 190 340 150 C 300 110 250 110 220 140"
        stroke="#080018" strokeWidth="38" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M 200 150 C 140 120 90 150 80 210 C 70 270 110 330 170 355 C 230 380 300 360 340 310 C 380 260 380 190 340 150 C 300 110 250 110 220 140"
        stroke="url(#g-blue-teal)" strokeWidth="28" strokeLinecap="round" fill="none" opacity="0.72" filter="url(#glow2)" />
      <path d="M 200 150 C 140 120 90 150 80 210 C 70 270 110 330 170 355 C 230 380 300 360 340 310 C 380 260 380 190 340 150 C 300 110 250 110 220 140"
        stroke="url(#g-violet-cyan)" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.55" />

      {/* ── Extra small twist for complexity ── */}
      <path d="M 255 200 C 295 180 330 200 335 240 C 340 280 315 315 280 325 C 245 335 210 315 205 280 C 200 245 220 215 250 205"
        stroke="url(#g-teal-purple)" strokeWidth="20" strokeLinecap="round" fill="none" opacity="0.5" filter="url(#glow2)" />
      <path d="M 255 200 C 295 180 330 200 335 240 C 340 280 315 315 280 325 C 245 335 210 315 205 280 C 200 245 220 215 250 205"
        stroke="url(#g-gold)" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.45" />

      {/* ── Specular highlight lines (simulates light hitting ribbon edge) ── */}
      <path d="M 260 84 C 320 66 390 110 410 180"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.25" />
      <path d="M 418 225 C 426 290 400 350 355 385"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.18" />
      <path d="M 375 115 C 408 158 415 220 390 278"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M 95 240 C 88 290 102 340 138 368"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.15" />
      <path d="M 166 133 C 200 115 240 118 268 138"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M 207 155 C 172 128 128 142 100 178"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.16" />

      {/* ── Inner bright ring at knot centre ── */}
      <circle cx="250" cy="255" r="18" stroke="url(#g-blue-teal)" strokeWidth="6" fill="none" opacity="0.3" filter="url(#bloom)" />
      <circle cx="250" cy="255" r="8"  stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
    </svg>
  )
}

/* ─── Landing page ───────────────────────────────────────────────────────── */
function LandingPage() {
  const { signIn } = useData()
  const [showSignIn, setShowSignIn] = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const msg = await signIn(email, password)
    if (msg) setErr(msg)
    setLoading(false)
  }

  function openSignIn()  { setShowSignIn(true);  setErr('') }
  function closeSignIn() { setShowSignIn(false); setErr('') }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 65% 45%, #1c093e 0%, #130828 22%, #0a0518 55%, #040210 100%)',
      }}
    >
      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(80,30,200,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 sm:py-6">
        <span className="text-white font-bold text-lg sm:text-xl tracking-tighter select-none">
          nova.
        </span>

        {/* Centre links — hidden on xs */}
        <div className="hidden sm:flex items-center gap-8 md:gap-10 text-[11px] font-semibold tracking-[0.18em]">
          <button className="text-white">HOME</button>
          <button className="text-gray-500 hover:text-gray-300 transition-colors">FEATURES</button>
          <button className="text-gray-500 hover:text-gray-300 transition-colors">PRICING</button>
        </div>

        <button
          onClick={openSignIn}
          className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 hover:text-white transition-colors"
        >
          SIGN IN
        </button>
      </nav>

      {/* ── Hero ── */}
      {/*
        Mobile  (<lg): ribbon on top, centred; text below, centred
        Desktop (≥lg): ribbon absolute-left half; text right half
      */}
      <div className="relative z-10">
        {/* Desktop absolute ribbon */}
        <div className="hidden lg:flex absolute inset-y-0 left-0 w-[55%] items-center justify-center pointer-events-none" style={{ top: 0, bottom: 0 }}>
          <div style={{ width: 520, height: 520 }}>
            <RibbonSVG />
          </div>
        </div>

        <div
          className="flex flex-col lg:flex-row items-center"
          style={{ minHeight: 'calc(100vh - 76px)' }}
        >
          {/* Mobile ribbon — shown only below lg */}
          <div className="lg:hidden flex justify-center w-full pt-4 pb-2 pointer-events-none">
            <div className="w-64 h-64 sm:w-80 sm:h-80">
              <RibbonSVG />
            </div>
          </div>

          {/* Text block */}
          <div className="w-full lg:w-[46%] lg:ml-auto lg:pr-20 px-6 sm:px-10 pb-14 lg:pb-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 border border-[#f72585]/35 text-[#f72585] text-[10px] font-semibold tracking-[0.22em] px-4 py-1.5 rounded-full mb-6 sm:mb-7">
              ALGORITHMIC TRADING.
            </div>

            <h1
              className="font-extrabold text-white leading-[1.08] mb-8 sm:mb-9"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
            >
              Your Edge,<br />Quantified.
            </h1>

            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <button
                onClick={openSignIn}
                className="px-7 py-3 bg-[#f72585] hover:bg-[#d91e73] text-white text-sm font-semibold rounded-lg transition-all duration-200"
                style={{ boxShadow: '0 0 32px rgba(247,37,133,0.35)' }}
              >
                Sign In
              </button>
              <button className="w-10 h-10 border border-white/15 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all text-base">
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sign In Modal ── */}
      {showSignIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(4,2,12,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSignIn() }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-7 sm:p-8 relative"
            style={{ background: '#0c0c0c', border: '1px solid #222' }}
          >
            <button
              onClick={closeSignIn}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 text-lg leading-none"
            >
              ✕
            </button>

            <span className="text-white font-bold text-xl tracking-tighter block mb-7">nova.</span>
            <h2 className="text-base font-bold mb-1 text-white">Sign in</h2>
            <p className="text-xs text-gray-500 mb-6">Access your live strategy dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-[0.15em]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="ea474@njit.edu"
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f72585] transition-colors placeholder-gray-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-[0.15em]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f72585] transition-colors"
                />
              </div>

              {err && (
                <p className="text-[#ff3d71] text-xs bg-[#ff3d71]/5 border border-[#ff3d71]/20 rounded px-3 py-2">
                  {err}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#f72585] hover:bg-[#d91e73] text-white text-sm font-bold rounded-lg tracking-wider transition-colors disabled:opacity-50"
                style={{ boxShadow: '0 0 20px rgba(247,37,133,0.2)' }}
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>

              <p className="text-center text-[10px] text-gray-600">
                Forgot password?{' '}
                <a
                  href="https://supabase.com/dashboard/project/lqaodrawvtnhukgwvqci/auth/users"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f72585] hover:underline"
                >
                  Reset via Supabase
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Placeholder for stub routes ────────────────────────────────────────── */
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

/* ─── App shell (authenticated) ─────────────────────────────────────────── */
function AppShell() {
  const { authReady, authSession } = useData()

  if (!authReady) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 65% 45%, #1c093e 0%, #0a0518 55%, #040210 100%)' }}
    >
      <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin" />
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
