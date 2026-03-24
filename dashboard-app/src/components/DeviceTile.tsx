import { type LucideIcon } from 'lucide-react'

type ColorScheme = 'orange' | 'blue' | 'green'

interface Props {
  label: string
  sublabel?: string
  icon: LucideIcon
  isOn: boolean
  isUnavailable?: boolean
  color?: ColorScheme
  onClick?: () => void
}

const colorMap: Record<ColorScheme, { bg: string; icon: string; border: string }> = {
  orange: { bg: 'bg-orange-500/20', icon: 'text-orange-300', border: 'border-orange-400/30' },
  blue:   { bg: 'bg-sky-500/20',    icon: 'text-sky-300',    border: 'border-sky-400/30'    },
  green:  { bg: 'bg-emerald-500/20',icon: 'text-emerald-300',border: 'border-emerald-400/30'},
}

export function DeviceTile({ label, sublabel, icon: Icon, isOn, isUnavailable, color = 'orange', onClick }: Props) {
  const scheme = colorMap[color]

  return (
    <button
      onClick={onClick}
      disabled={isUnavailable}
      className={`
        relative flex flex-col gap-3 p-4 rounded-2xl text-left transition-all duration-200 w-full border
        ${isUnavailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95 hover:brightness-110'}
        ${isOn ? `${scheme.bg} ${scheme.border}` : 'glass border-white/10'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isOn ? 'bg-white/15' : 'bg-white/5'}`}>
          <Icon size={20} className={isOn ? scheme.icon : 'text-white/30'} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
          ${isOn ? 'bg-white/20 text-white/90' : 'bg-white/5 text-white/25'}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>
      <div>
        <div className={`text-sm font-semibold leading-tight ${isOn ? 'text-white' : 'text-white/50'}`}>{label}</div>
        {sublabel && <div className="text-xs text-white/35 mt-0.5 truncate">{sublabel}</div>}
      </div>
    </button>
  )
}
