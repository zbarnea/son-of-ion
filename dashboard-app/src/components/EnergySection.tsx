import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BatteryCharging, Zap, Flame } from 'lucide-react'

interface Props {
  electricCost?: string
  gasCost?: string
  enyaqBattery?: string
  id3Battery?: string
  enyaqRange?: string
  id3Range?: string
}

const MOCK_DAYS = [
  { day: 'Mon', kwh: 18 },
  { day: 'Tue', kwh: 24 },
  { day: 'Wed', kwh: 15 },
  { day: 'Thu', kwh: 32 },
  { day: 'Fri', kwh: 28 },
  { day: 'Sat', kwh: 22 },
  { day: 'Sun', kwh: 19 },
]
const BAR_COLORS = ['#fb923c', '#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#facc15', '#fb923c']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs text-white">
      {label}: {payload[0].value} kWh
    </div>
  )
}

export function EnergySection({ electricCost, gasCost, enyaqBattery, id3Battery, enyaqRange, id3Range }: Props) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">
          Energy <span className="text-orange-400">Usage</span>
        </h2>
        <div className="flex gap-2">
          <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-lg">This week</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_DAYS} barSize={20}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="kwh" radius={[6, 6, 3, 3]}>
              {MOCK_DAYS.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <Zap size={14} className="text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-white/35">Electricity</div>
            <div className="text-sm font-bold text-white">{electricCost ?? '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
            <Flame size={14} className="text-sky-400" />
          </div>
          <div>
            <div className="text-xs text-white/35">Gas</div>
            <div className="text-sm font-bold text-white">{gasCost ?? '—'}</div>
          </div>
        </div>
        {enyaqBattery && (
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <BatteryCharging size={14} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-white/35">Enyaq</div>
              <div className="text-sm font-bold text-white">{enyaqBattery}% · {enyaqRange}mi</div>
            </div>
          </div>
        )}
        {id3Battery && (
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <BatteryCharging size={14} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-white/35">ID.3</div>
              <div className="text-sm font-bold text-white">{id3Battery}% · {id3Range}mi</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
