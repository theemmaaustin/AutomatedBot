export default function StatCard({ label, value, sub, accent = false, icon: Icon }) {
  return (
    <div className={`bg-[#0f0f0f] border rounded-xl p-5 flex flex-col gap-2 ${
      accent ? 'border-[#f72585]/30 glow-pink' : 'border-[#1e1e1e]'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">{label}</span>
        {Icon && <Icon size={14} className={accent ? 'text-[#f72585]' : 'text-gray-600'} />}
      </div>
      <p className={`text-2xl font-bold font-mono ${accent ? 'text-[#f72585] text-glow' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
    </div>
  )
}
