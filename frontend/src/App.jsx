import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider, useData } from './context/DataContext'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import TradesLedger from './pages/TradesLedger'
import Diagnostics from './pages/Diagnostics'
import Strategy from './pages/Strategy'

function RibbonSVG() {
  return (
    <svg viewBox="0 0 520 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#4361EE" />
          <stop offset="30%"  stopColor="#7209B7" />
          <stop offset="65%"  stopColor="#4CC9F0" />
          <stop offset="100%" stopColor="#00F5A0" />
        </linearGradient>
        <linearGradient id="rg2" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#00F5A0" />
          <stop offset="35%"  stopColor="#4CC9F0" />
          <stop offset="70%"  stopColor="#7B2FFF" />
          <stop offset="100%" stopColor="#4361EE" />
        </linearGradient>
        <linearGradient id="rg3" x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#7209B7" />
          <stop offset="45%"  stopColor="#4CC9F0" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
        <linearGradient id="rg4" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#4CC9F0" />
          <stop offset="55%"  stopColor="#7B2FFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00F5A0" />
        </linearGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softglow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow blobs */}
      <ellipse cx="260" cy="360" rx="210" ry="260" fill="#7B2FFF" opacity="0.07" />
      <ellipse cx="230" cy="340" rx="160" ry="200" fill="#4CC9F0" opacity="0.045" />

      {/* Outer glow layer – widest, most transparent */}
      <path
        d="M 230 660 C 100 610 10 500 55 395 C 100 290 230 315 270 245 C 310 175 330 105 278 82 C 226 59 162 102 175 165 C 188 228 268 238 308 186 C 348 134 364 72 312 58 C 260 44 198 87 212 152 C 226 217 308 224 338 170 C 368 116 348 50 285 62"
        stroke="url(#rg1)" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.45" filter="url(#glow)"
      />

      {/* Main ribbon body */}
      <path
        d="M 230 660 C 100 610 10 500 55 395 C 100 290 230 315 270 245 C 310 175 330 105 278 82 C 226 59 162 102 175 165 C 188 228 268 238 308 186 C 348 134 364 72 312 58 C 260 44 198 87 212 152 C 226 217 308 224 338 170 C 368 116 348 50 285 62"
        stroke="url(#rg2)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.88"
      />

      {/* Secondary ribbon band – offset, different gradient */}
      <path
        d="M 270 648 C 162 592 78 484 132 384 C 186 284 308 304 340 234 C 372 164 380 94 330 74 C 280 54 218 100 232 164 C 246 228 328 232 356 180 C 384 128 392 66 342 50 C 292 34 242 76 258 140"
        stroke="url(#rg3)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.78" filter="url(#softglow)"
      />
      <path
        d="M 270 648 C 162 592 78 484 132 384 C 186 284 308 304 340 234 C 372 164 380 94 330 74 C 280 54 218 100 232 164 C 246 228 328 232 356 180 C 384 128 392 66 342 50 C 292 34 242 76 258 140"
        stroke="url(#rg4)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.55"
      />

      {/* Additional lower loop for depth */}
      <path
        d="M 148 535 C 68 480 48 396 92 342 C 136 288 210 312 244 272"
        stroke="url(#rg1)" strokeWidth="36" strokeLinecap="round"
        fill="none" opacity="0.55"
      />
      <path
        d="M 148 535 C 68 480 48 396 92 342 C 136 288 210 312 244 272"
        stroke="url(#rg2)" strokeWidth="18" strokeLinecap="round"
        fill="none" opacity="0.5"
      />

      {/* Specular highlight streaks */}
      <path
        d="M 215 638 C 114 582 42 482 84 386 C 112 322 172 306 218 280"
        stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.22"
      />
      <path
        d="M 264 242 C 286 214 300 184 294 162 C 282 128 256 110 232 116"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.28"
      />
      <path
        d="M 322 178 C 346 146 356 112 340 88"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.32"
      />
      <path
        d="M 258 150 C 274 124 282 96 270 76"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.2"
      />
      <path
        d="M 136 522 C 80 468 62 392 98 340"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.18"
      />
    </svg>
  )
}

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

  function openSignIn() { setShowSignIn(true); setErr('') }
  function closeSignIn() { setShowSignIn(false); setErr('') }

  return (
    <div
      className="min-h-screen relative overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 62% 48%, #1c093e 0%, #12092a 22%, #0a0518 55%, #040210 100%)' }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(80,30,180,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(80,30,180,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6">
        <span className="text-white font-bold text-xl tracking-tighter">nova.</span>
        <div className="flex items-center gap-10 text-[11px] font-semibold tracking-[0.18em]">
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

      {/* Hero layout */}
      <div className="relative z-10 flex items-center" style={{ minHeight: 'calc(100vh - 88px)' }}>
        {/* Ribbon — left side */}
        <div className="absolute inset-y-0 left-0 w-[56%] flex items-center justify-start pointer-events-none">
          <div style={{ width: 540, height: 640, marginLeft: -20 }}>
            <RibbonSVG />
          </div>
        </div>

        {/* Hero text — right side */}
        <div className="ml-auto pr-20" style={{ width: '46%', maxWidth: 460 }}>
          <div className="inline-flex items-center gap-2 border border-[#f72585]/35 text-[#f72585] text-[10px] font-semibold tracking-[0.22em] px-4 py-1.5 rounded-full mb-7">
            ALGORITHMIC TRADING.
          </div>
          <h1 className="text-[3.4rem] font-extrabold text-white leading-[1.08] mb-9" style={{ letterSpacing: '-0.02em' }}>
            Your Edge,<br />Quantified.
          </h1>
          <div className="flex items-center gap-3">
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

      {/* Sign In Modal */}
      {showSignIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(4,2,12,0.82)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSignIn() }}
        >
          <div className="w-full max-w-sm rounded-2xl p-8 relative" style={{ background: '#0c0c0c', border: '1px solid #1f1f1f' }}>
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
                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-[0.15em]">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="w-full bg-[#111] border border-[#252525] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f72585] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-[0.15em]">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-[#111] border border-[#252525] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f72585] transition-colors"
                />
              </div>
              {err && (
                <p className="text-[#ff3d71] text-xs bg-[#ff3d71]/5 border border-[#ff3d71]/20 rounded px-3 py-2">{err}</p>
              )}
              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#f72585] hover:bg-[#d91e73] text-white text-sm font-bold rounded-lg tracking-wider transition-colors disabled:opacity-50"
                style={{ boxShadow: '0 0 20px rgba(247,37,133,0.2)' }}
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

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

function AppShell() {
  const { authReady, authSession } = useData()

  if (!authReady) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 62% 48%, #1c093e 0%, #0a0518 55%, #040210 100%)' }}
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
          <main className="flex-1 overflow-y-auto p-6">
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
