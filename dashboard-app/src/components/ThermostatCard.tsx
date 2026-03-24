import { useState } from 'react'
import { Flame, Snowflake, Minus, Plus } from 'lucide-react'

const MIN_TEMP = 10
const MAX_TEMP = 30
const START_ANGLE = 135   // degrees clockwise from top
const ARC_EXTENT  = 270

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const s = polar(cx, cy, r, from)
  const e = polar(cx, cy, r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

interface Props {
  entity?: {
    state: string
    attributes: {
      temperature?: number
      current_temperature?: number
      hvac_modes?: string[]
      min_temp?: number
      max_temp?: number
    }
  }
  onSetTemp?: (t: number) => void
}

export function ThermostatCard({ entity, onSetTemp }: Props) {
  const currentTemp = entity?.attributes.current_temperature ?? 20
  const setpoint    = entity?.attributes.temperature ?? 20
  const mode        = entity?.state ?? 'heat'

  const [localTarget, setLocalTarget] = useState<number | null>(null)
  const target = localTarget ?? setpoint

  const cx = 80, cy = 80, r = 60
  const pct = (target - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)
  const fillEnd = START_ANGLE + ARC_EXTENT * pct

  const isHeating = mode === 'heat' || mode === 'heat_cool'
  const isCooling = mode === 'cool' || mode === 'heat_cool'

  const adjust = (delta: number) => {
    const next = Math.min(MAX_TEMP, Math.max(MIN_TEMP, target + delta))
    setLocalTarget(next)
    onSetTemp?.(next)
  }

  return (
    <div className="bg-navy-700 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white/60 uppercase tracking-widest">Temperature</span>
        <div className="flex gap-1.5">
          <button className={`p-1.5 rounded-lg transition-colors ${isHeating ? 'bg-orange-500/20 text-orange-400' : 'text-white/20'}`}>
            <Flame size={14} />
          </button>
          <button className={`p-1.5 rounded-lg transition-colors ${isCooling ? 'bg-sky-500/20 text-sky-400' : 'text-white/20'}`}>
            <Snowflake size={14} />
          </button>
        </div>
      </div>

      {/* SVG Dial */}
      <div className="flex justify-center mb-3">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#38bdf8" />
              <stop offset="40%"  stopColor="#34d399" />
              <stop offset="70%"  stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d={arc(cx, cy, r, START_ANGLE, START_ANGLE + ARC_EXTENT)}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Fill */}
          {pct > 0 && (
            <path
              d={arc(cx, cy, r, START_ANGLE, fillEnd)}
              fill="none" stroke="url(#arcGrad)" strokeWidth="8"
              strokeLinecap="round"
            />
          )}

          {/* Thumb */}
          {pct > 0 && (() => {
            const pt = polar(cx, cy, r, fillEnd)
            return <circle cx={pt.x} cy={pt.y} r={6} fill="white" opacity={0.9} />
          })()}

          {/* Center display */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white"
            fontSize="28" fontWeight="700" fontFamily="system-ui">
            {target}°
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)"
            fontSize="11" fontFamily="system-ui">
            {currentTemp}° now
          </text>

          {/* Min/max labels */}
          {(() => {
            const minPt = polar(cx, cy, r + 14, START_ANGLE)
            const maxPt = polar(cx, cy, r + 14, START_ANGLE + ARC_EXTENT)
            return <>
              <text x={minPt.x} y={minPt.y + 4} textAnchor="middle"
                fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="system-ui">
                {MIN_TEMP}°
              </text>
              <text x={maxPt.x} y={maxPt.y + 4} textAnchor="middle"
                fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="system-ui">
                {MAX_TEMP}°
              </text>
            </>
          })()}
        </svg>
      </div>

      {/* +/- controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => adjust(-0.5)}
          className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
        >
          <Minus size={14} className="text-white/60" />
        </button>
        <span className="text-xs text-white/30 uppercase tracking-wider">Set point</span>
        <button
          onClick={() => adjust(0.5)}
          className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
        >
          <Plus size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  )
}
