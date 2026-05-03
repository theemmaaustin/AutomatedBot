import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useData } from '../context/DataContext'

const GREEN  = '#00d68f'
const RED    = '#ff3d71'
const PINK   = '#f72585'
const GRAY   = '#2a2a2a'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function pct(n, d) { return d ? ((n / d) * 100).toFixed(1) : '0.0' }

function MiniStat({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">{label}</span>
      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
    </div>
  )
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400">{name}</p>
      <p className="text-white font-mono font-bold">{value} trades</p>
    </div>
  )
}

export default function Diagnostics() {
  const { trades, loading, error } = useData()

  const stats = useMemo(() => {
    if (!trades.length) return null

    const wins     = trades.filter(t => t.result === 'WIN').length
    const losses   = trades.filter(t => t.result === 'LOSS').length
    const scratches = trades.filter(t => t.result === 'SCRATCH').length
    const total    = trades.length
    const decisive = wins + losses

    // Direction breakdown
    const bull = trades.filter(t => t.direction === 'BULL')
    const bear = trades.filter(t => t.direction === 'BEAR')
    const bullWins = bull.filter(t => t.result === 'WIN').length
    const bearWins = bear.filter(t => t.result === 'WIN').length
    const bullDecisive = bull.filter(t => t.result !== 'SCRATCH').length
    const bearDecisive = bear.filter(t => t.result !== 'SCRATCH').length

    // Day-of-week heatmap
    const dayMap = {}
    DAYS.forEach(d => { dayMap[d] = { wins: 0, losses: 0, scratches: 0, total: 0 } })
    trades.forEach(t => {
      if (!t.date) return
      const day = new Date(t.date + 'T00:00:00').getDay() // 0=Sun
      const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
      if (!dayMap[label]) return
      dayMap[label].total++
      if (t.result === 'WIN')     dayMap[label].wins++
      else if (t.result === 'LOSS')    dayMap[label].losses++
      else dayMap[label].scratches++
    })

    // Monthly performance bar
    const monthMap = {}
    trades.forEach(t => {
      const m = t.date?.slice(0, 7)
      if (!m) return
      if (!monthMap[m]) monthMap[m] = { wins: 0, losses: 0, scratches: 0 }
      if (t.result === 'WIN') monthMap[m].wins++
      else if (t.result === 'LOSS') monthMap[m].losses++
      else monthMap[m].scratches++
    })
    const monthly = Object.entries(monthMap).sort().map(([month, d]) => ({
      month: month.slice(5) + '/' + month.slice(2, 4),
      wins: d.wins,
      losses: d.losses,
      scratches: d.scratches,
      wr: d.wins + d.losses ? parseFloat(((d.wins / (d.wins + d.losses)) * 100).toFixed(1)) : 0,
    }))

    // pnl by direction
    const bullPnl = bull.reduce((s, t) => s + (t.pnlUsd || 0), 0)
    const bearPnl = bear.reduce((s, t) => s + (t.pnlUsd || 0), 0)

    return {
      wins, losses, scratches, total, decisive,
      winRate: decisive ? (wins / decisive) * 100 : 0,
      bull, bear, bullWins, bearWins, bullDecisive, bearDecisive, bullPnl, bearPnl,
      dayMap, monthly,
    }
  }, [trades])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg">{error}</p>
  if (!stats) return <p className="text-gray-500 text-sm p-4">No data</p>

  const donutData = [
    { name: 'Win',     value: stats.wins     },
    { name: 'Loss',    value: stats.losses   },
    { name: 'Scratch', value: stats.scratches },
  ]
  const donutColors = [GREEN, RED, GRAY]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Diagnostics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Strategy attribution and temporal analysis</p>
      </div>

      {/* Top mini-stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MiniStat
          label="Win Rate"
          value={stats.winRate.toFixed(1) + '%'}
          sub={`${stats.wins}W / ${stats.losses}L decisive`}
          color="text-[#f72585]"
        />
        <MiniStat
          label="Scratch Rate"
          value={pct(stats.scratches, stats.total) + '%'}
          sub={`${stats.scratches} of ${stats.total} trades`}
        />
        <MiniStat
          label="Bull WR"
          value={pct(stats.bullWins, stats.bullDecisive) + '%'}
          sub={`${stats.bull.length} long trades`}
          color="text-[#00d68f]"
        />
        <MiniStat
          label="Bear WR"
          value={pct(stats.bearWins, stats.bearDecisive) + '%'}
          sub={`${stats.bear.length} short trades`}
          color="text-[#ff3d71]"
        />
      </div>

      {/* Row 2: Donut + Direction breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Outcome donut */}
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Outcome Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={donutColors[i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: donutColors[i] }} />
                    <span className="text-gray-400">{d.name}</span>
                  </div>
                  <span className="font-mono text-gray-200">
                    {d.value} <span className="text-gray-600">({pct(d.value, stats.total)}%)</span>
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#1e1e1e]">
                <p className="text-[10px] text-gray-600">Total: {stats.total} trades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Direction P&L */}
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Direction Attribution</h3>
          <div className="space-y-4">
            {[
              {
                label: '↑ LONG (BULL)', trades: stats.bull.length,
                wins: stats.bullWins, decisive: stats.bullDecisive,
                pnl: stats.bullPnl, color: GREEN,
              },
              {
                label: '↓ SHORT (BEAR)', trades: stats.bear.length,
                wins: stats.bearWins, decisive: stats.bearDecisive,
                pnl: stats.bearPnl, color: RED,
              },
            ].map(d => {
              const wr = d.decisive ? (d.wins / d.decisive) * 100 : 0
              return (
                <div key={d.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold" style={{ color: d.color }}>{d.label}</span>
                    <span className="font-mono text-gray-300">
                      {d.trades} trades · {wr.toFixed(1)}% WR
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: wr + '%', background: d.color }} />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    P&L: <span className={`font-mono font-semibold ${d.pnl >= 0 ? 'text-[#00d68f]' : 'text-[#ff3d71]'}`}>
                      {d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(2)}
                    </span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Day-of-week heatmap */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Temporal Density — Day of Week</h3>
        <div className="grid grid-cols-5 gap-3">
          {DAYS.map(day => {
            const d = stats.dayMap[day] || { wins: 0, losses: 0, scratches: 0, total: 0 }
            const decisive = d.wins + d.losses
            const wr = decisive ? (d.wins / decisive) * 100 : null
            const intensity = d.total / (Math.max(...DAYS.map(dy => stats.dayMap[dy]?.total || 0)) || 1)
            return (
              <div
                key={day}
                className="rounded-xl p-4 border border-[#1e1e1e] flex flex-col gap-2"
                style={{ background: `rgba(247,37,133,${intensity * 0.12})` }}
              >
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{day}</p>
                <p className="text-xl font-bold font-mono text-white">{d.total}</p>
                <p className="text-[10px] text-gray-500">trades</p>
                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#00d68f]">W {d.wins}</span>
                    <span className="text-[#ff3d71]">L {d.losses}</span>
                  </div>
                  {wr !== null && (
                    <p className="text-[10px] font-mono font-semibold text-[#f72585]">{wr.toFixed(0)}% WR</p>
                  )}
                  {wr === null && <p className="text-[10px] text-gray-700">—</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly win/loss bar */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Monthly Outcome Breakdown</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.monthly} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }}
              labelStyle={{ color: '#888', fontSize: 10 }}
              itemStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="wins"     name="Wins"     stackId="a" fill={GREEN} radius={[0,0,0,0]} fillOpacity={0.85} />
            <Bar dataKey="losses"   name="Losses"   stackId="a" fill={RED}   radius={[0,0,0,0]} fillOpacity={0.85} />
            <Bar dataKey="scratches" name="Scratches" stackId="a" fill={GRAY}  radius={[3,3,0,0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
        {/* WR overlay legend */}
        <div className="flex flex-wrap gap-4 mt-3">
          {stats.monthly.map(m => (
            <div key={m.month} className="text-[10px] text-gray-500 font-mono">
              {m.month} <span className="text-[#f72585]">{m.wr}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
