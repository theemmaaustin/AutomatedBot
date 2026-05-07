import { NavLink } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import { useData } from '../context/DataContext'

const tabs = [
  { to: '/dashboard',   label: 'OVERVIEW' },
  { to: '/trades',      label: 'TRADES' },
  { to: '/diagnostics', label: 'DIAGNOSTICS' },
  { to: '/execution',   label: 'EXECUTION' },
  { to: '/about',       label: 'ABOUT' },
]

export default function TopNav() {
  const { heartbeat } = useData()
  const lastSeen = heartbeat?.last_seen ? new Date(heartbeat.last_seen) : null
  const diffMin  = lastSeen ? (Date.now() - lastSeen.getTime()) / 60000 : Infinity
  const isOnline = diffMin < 10

  return (
    <header className="shrink-0 h-12 bg-[#070707] border-b border-[#181818] flex items-center px-5 gap-5">
      {/* Brand */}
      <div className="shrink-0 flex items-center gap-1 select-none">
        <span className="text-[#f72585] font-bold text-[11px] tracking-[0.15em]">AEVA</span>
        <span className="text-[#2a2a2a] font-bold text-[11px] mx-0.5">|</span>
        <span className="text-gray-400 font-bold text-[11px] tracking-[0.15em]">TERMINAL</span>
      </div>

      <div className="w-px h-4 bg-[#1e1e1e] shrink-0" />

      {/* Tabs */}
      <nav className="flex items-center gap-0.5">
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3.5 py-1.5 text-[10px] font-bold tracking-[0.16em] rounded transition-all duration-150 ${
                isActive
                  ? 'text-[#f72585] bg-[#f72585]/10 border border-[#f72585]/25'
                  : 'text-gray-600 hover:text-gray-300 border border-transparent'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1c1c1c] bg-[#0c0c0c]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-[#00d68f]' : 'bg-[#333]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isOnline ? 'bg-[#00d68f]' : 'bg-[#333]'
              }`}
            />
          </span>
          <span
            className={`text-[10px] font-bold tracking-[0.14em] ${
              isOnline ? 'text-[#00d68f]' : 'text-gray-600'
            }`}
          >
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <button className="text-gray-600 hover:text-gray-300 transition-colors">
          <Bell size={14} />
        </button>
        <button className="text-gray-600 hover:text-gray-300 transition-colors">
          <Settings size={14} />
        </button>
      </div>
    </header>
  )
}
