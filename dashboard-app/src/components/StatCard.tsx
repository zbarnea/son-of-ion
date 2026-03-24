import { type LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
  icon: LucideIcon
  iconColor?: string
  onClick?: () => void
}

export function StatCard({ label, value, unit, sublabel, icon: Icon, iconColor = 'text-white/40', onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-navy-700 rounded-2xl p-5 text-left w-full hover:brightness-110 transition-all active:scale-95"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">{label}</span>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white leading-none">{value}</span>
        {unit && <span className="text-base text-white/40 mb-0.5">{unit}</span>}
      </div>
      {sublabel && <div className="text-xs text-white/30 mt-1">{sublabel}</div>}
    </button>
  )
}
