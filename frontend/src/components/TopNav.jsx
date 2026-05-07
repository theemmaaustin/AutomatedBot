import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useData } from '../context/DataContext'

const tabs = [
  { to: '/dashboard',   label: 'OVERVIEW' },
  { to: '/trades',      label: 'TRADES' },
  { to: '/diagnostics', label: 'DIAGNOSTICS' },
  { to: '/strategy',    label: 'STRATEGY' },
]

export default function TopNav() {
  const { heartbeat } = useData()
  const lastSeen = heartbeat?.last_seen ? new Date(heartbeat.last_seen) : null
  const diffMin  = lastSeen ? (Date.now() - lastSeen.getTime()) / 60000 : Infinity
  const isActive = diffMin < 10

  return (
    <header className="shrink-0 h-12 bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center px-6 gap-6">
      <nav className="flex items-center gap-1">
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-1.5 text-[11px] font-semibold tracking-widest rounded transition-all duration-150 ${
                isActive
                  ? 'text-[#f72585] bg-[#f72585]/10 border border-[#f72585]/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-[#00d68f]' : 'bg-gray-600'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-[#00d68f]' : 'bg-gray-600'}`} />
          </span>
          <span className={`text-[11px] font-semibold tracking-wider ${isActive ? 'text-[#00d68f]' : 'text-gray-500'}`}>
            {isActive ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <Bell size={15} />
        </button>
      </div>
    </header>
  )
}
