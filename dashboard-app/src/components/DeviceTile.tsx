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
  onLongPress?: () => void
}

const colorMap: Record<ColorScheme, { bg: string; icon: string; ring: string }> = {
  orange: { bg: 'bg-[#7c2d12]',  icon: 'text-orange-400', ring: 'ring-orange-800/50' },
  blue:   { bg: 'bg-[#0c4a6e]',  icon: 'text-sky-400',    ring: 'ring-sky-800/50'    },
  green:  { bg: 'bg-[#064e3b]',  icon: 'text-emerald-400',ring: 'ring-emerald-800/50'},
}

export function DeviceTile({
  label, sublabel, icon: Icon, isOn, isUnavailable, color = 'orange', onClick,
}: Props) {
  const scheme = colorMap[color]

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col gap-3 p-4 rounded-2xl text-left transition-all duration-300 w-full
        ${isUnavailable ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${isOn ? `${scheme.bg} ring-1 ${scheme.ring}` : 'bg-navy-700'}
        hover:brightness-110
      `}
      disabled={isUnavailable}
    >
      {/* Toggle indicator */}
      <div className="flex items-center justify-between">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-xl
          ${isOn ? 'bg-white/10' : 'bg-white/5'}
        `}>
          <Icon size={20} className={isOn ? scheme.icon : 'text-white/25'} />
        </div>

        {/* ON/OFF pill */}
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
          ${isOn ? 'bg-white/15 text-white/80' : 'bg-white/5 text-white/25'}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      <div>
        <div className={`text-sm font-semibold leading-tight
          ${isOn ? 'text-white' : 'text-white/60'}`}>
          {label}
        </div>
        {sublabel && (
          <div className="text-xs text-white/35 mt-0.5 truncate">{sublabel}</div>
        )}
      </div>
    </button>
  )
}
