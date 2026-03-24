import { Home, Zap, Car, Settings, LayoutGrid } from 'lucide-react'

type View = 'home' | 'energy' | 'cars'

interface Props {
  active: View
  onChange: (v: View) => void
  connectedUser?: string
}

const NAV: { id: View; icon: typeof Home; label: string }[] = [
  { id: 'home',   icon: Home,        label: 'Home'   },
  { id: 'energy', icon: Zap,         label: 'Energy' },
  { id: 'cars',   icon: Car,         label: 'Cars'   },
]

export function Sidebar({ active, onChange, connectedUser }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-16 flex-shrink-0 bg-navy-800 flex-col items-center py-5 gap-2 border-r border-white/5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center mb-4">
          <span className="text-xs font-bold text-white">
            {connectedUser?.[0]?.toUpperCase() ?? 'H'}
          </span>
        </div>

        {/* Nav */}
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={label}
            className={`
              relative w-10 h-10 rounded-xl flex items-center justify-center transition-all
              ${active === id
                ? 'bg-white/12 text-white'
                : 'text-white/25 hover:text-white/60 hover:bg-white/5'
              }
            `}
          >
            <Icon size={18} />
            {active === id && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-sky-500 -translate-x-3 rounded-full" />
            )}
          </button>
        ))}

        <div className="flex-1" />

        <button title="Layout" className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
          <LayoutGrid size={18} />
        </button>
        <button title="Settings" className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
          <Settings size={18} />
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-800 border-t border-white/5 flex items-center justify-around px-2 pb-safe">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 py-3 px-6 rounded-xl transition-all
              ${active === id ? 'text-white' : 'text-white/30'}`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
