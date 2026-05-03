import { NavLink } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'

const tabs = [
  { to: '/dashboard',   label: 'OVERVIEW' },
  { to: '/trades',      label: 'TRADES' },
  { to: '/diagnostics', label: 'DIAGNOSTICS' },
]

export default function TopNav() {
  return (
    <header className="shrink-0 h-12 bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center px-6 gap-6">
      {/* Tabs */}
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
        {/* Online indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d68f] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d68f]" />
          </span>
          <span className="text-[11px] text-[#00d68f] font-semibold tracking-wider">ONLINE</span>
        </div>

        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <Bell size={15} />
        </button>
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <Settings size={15} />
        </button>
      </div>
    </header>
  )
}
