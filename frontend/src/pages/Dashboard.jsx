import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, BarChart2, DollarSign, Target, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import StatCard from '../components/StatCard'

const fmt = {
  date: s => {
    const d = new Date(s + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  },
  usd: n => (n >= 0 ? '+' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  pct: n => n.toFixed(1) + '%',
}

const PINK = '#f72585'
const GREEN = '#00d68f'
const RED   = '#ff3d71'

function resultColor(r) {
  if (r === 'WIN')     return 'text-[#00d68f] bg-[#00d68f]/10 border-[#00d68f]/20'
  if (r === 'LOSS')    return 'text-[#ff3d71] bg-[#ff3d71]/10 border-[#ff3d71]/20'
  return 'text-gray-400 bg-white/5 border-white/10'
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-gray-500 mb-0.5">{fmt.date(label)}</p>
      <p className="text-white font-mono font-bold text-sm">${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      <p className={`text-[10px] font-semibold ${val >= 10000 ? 'text-[#00d68f]' : 'text-[#ff3d71]'}`}>
        {val >= 10000 ? '+' : ''}{((val - 10000) / 100).toFixed(2)}%
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { summary, trades, loading, error } = useData()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg">{error}</p>

  const curve = (summary?.equityCurve ?? []).filter((_, i, a) =>
    i === 0 || i === a.length - 1 || i % 2 === 0
  )
  const recentTrades = [...trades].reverse().slice(0, 5)
  const startBal = summary?.startingBalance ?? 10000

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SYSTEM OVERVIEW</h1>
        <p className="text-gray-500 text-sm mt-0.5">Real-time backtesting and algorithm execution metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Trades"
          value={summary?.totalTrades ?? '—'}
          sub={`${summary?.wins ?? 0}W  ${summary?.losses ?? 0}L  ${summary?.scratches ?? 0}S`}
          icon={BarChart2}
        />
        <StatCard
          label="Win Rate"
          value={summary ? fmt.pct(summary.winRate) : '—'}
          sub="excl. scratches"
          icon={Target}
          accent
        />
        <StatCard
          label="Total P&L"
          value={summary ? fmt.usd(summary.totalPnlUsd) : '—'}
          sub={`${summary ? fmt.pct(summary.totalReturn) : '—'} return`}
          icon={DollarSign}
        />
        <StatCard
          label="Avg RR"
          value={summary ? '1 : ' + summary.avgRR.toFixed(2) : '—'}
          sub={`Sharpe ${summary?.sharpeRatio.toFixed(2) ?? '—'}`}
          icon={TrendingUp}
        />
      </div>

      {/* Equity curve */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold tracking-wide text-sm uppercase text-gray-300">Equity Performance</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              ${startBal.toLocaleString()} → ${(summary?.finalBalance ?? startBal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-[#00d68f] text-xs font-semibold bg-[#00d68f]/10 border border-[#00d68f]/20 px-2.5 py-1 rounded-full">
            {summary ? fmt.usd(summary.totalPnlUsd) : '—'}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={curve} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={PINK} stopOpacity={0.25} />
                <stop offset="95%" stopColor={PINK} stopOpacity={0} />
              </linearGradient>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmt.date}
              tick={{ fill: '#555', fontSize: 10 }}
              axisLine={false} tickLine={false}
              interval={Math.floor(curve.length / 5)}
            />
            <YAxis
              tick={{ fill: '#555', fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => '$' + v.toLocaleString()}
              domain={['auto', 'auto']}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={startBal} stroke="#333" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={PINK}
              strokeWidth={2}
              fill="url(#balGrad)"
              dot={false}
              filter="url(#lineGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent sessions */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-300">Recent Sessions</h2>
          <span className="text-[11px] text-gray-500">Last 5 trades</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-600 uppercase tracking-wider border-b border-[#1a1a1a]">
                {['Date', 'Session', 'Direction', 'Result', 'Volatility', 'P&L'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((t, i) => (
                <tr key={i} className="border-b border-[#111] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-300">{t.date}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{t.session}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      t.direction === 'BULL'
                        ? 'text-[#00d68f] bg-[#00d68f]/10 border-[#00d68f]/20'
                        : 'text-[#f72585] bg-[#f72585]/10 border-[#f72585]/20'
                    }`}>
                      {t.direction === 'BULL' ? '↑ LONG' : '↓ SHORT'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${resultColor(t.result)}`}>
                      {t.result}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">
                    {t.stopPips?.toFixed(1)} pips
                  </td>
                  <td className={`px-5 py-3 font-mono font-semibold text-xs ${
                    t.pnlUsd > 0 ? 'text-[#00d68f]' : t.pnlUsd < 0 ? 'text-[#ff3d71]' : 'text-gray-500'
                  }`}>
                    {t.pnlUsd >= 0 ? '+' : ''}${t.pnlUsd?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-[#f72585] rounded-full flex items-center justify-center shadow-lg glow-pink-strong hover:bg-[#d91e73] transition-colors">
        <Plus size={20} />
      </button>
    </div>
  )
}
