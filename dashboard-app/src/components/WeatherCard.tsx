import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Thermometer } from 'lucide-react'

const ICONS: Record<string, typeof Sun> = {
  'clear-night': Sun,
  'cloudy': Cloud,
  'fog': Cloud,
  'hail': CloudRain,
  'lightning': CloudRain,
  'lightning-rainy': CloudRain,
  'partlycloudy': Cloud,
  'pouring': CloudRain,
  'rainy': CloudRain,
  'snowy': CloudSnow,
  'snowy-rainy': CloudSnow,
  'sunny': Sun,
  'windy': Wind,
  'windy-variant': Wind,
  'exceptional': Sun,
}

function WeatherIcon({ condition, size = 24 }: { condition?: string; size?: number }) {
  const Icon = ICONS[condition ?? ''] ?? Sun
  const colors: Record<string, string> = {
    sunny: 'text-yellow-400', 'clear-night': 'text-yellow-200',
    rainy: 'text-sky-400', pouring: 'text-sky-400', snowy: 'text-blue-200',
    partlycloudy: 'text-yellow-300', cloudy: 'text-white/50',
  }
  return <Icon size={size} className={colors[condition ?? ''] ?? 'text-white/60'} />
}

interface Forecast {
  condition: string
  datetime: string
  temperature: number
  templow?: number
}

interface Props {
  entity?: {
    state: string
    attributes: {
      temperature?: number
      humidity?: number
      wind_speed?: number
      forecast?: Forecast[]
    }
  }
  indoorTemp?: number
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeatherCard({ entity, indoorTemp }: Props) {
  const condition   = entity?.state ?? 'sunny'
  const temp        = entity?.attributes.temperature ?? '--'
  const humidity    = entity?.attributes.humidity
  const windSpeed   = entity?.attributes.wind_speed
  const forecasts   = (entity?.attributes.forecast ?? []).slice(1, 4)

  const today = new Date()

  return (
    <div className="flex flex-col gap-3">
      {/* Today */}
      <div className="bg-navy-700 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-white/35 mb-1">
              {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold text-white leading-none">{Math.round(Number(temp))}</span>
              <span className="text-2xl text-white/50 mb-1">°C</span>
            </div>
          </div>
          <WeatherIcon condition={condition} size={52} />
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
          {indoorTemp !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-white/45">
              <Thermometer size={12} className="text-orange-400" />
              <span>{Math.round(indoorTemp)}°C indoor</span>
            </div>
          )}
          {humidity !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-white/45">
              <Droplets size={12} className="text-sky-400" />
              <span>{Math.round(humidity)}%</span>
            </div>
          )}
          {windSpeed !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-white/45">
              <Wind size={12} className="text-white/40" />
              <span>{Math.round(windSpeed)} km/h</span>
            </div>
          )}
        </div>
      </div>

      {/* Forecast */}
      {forecasts.length > 0 && (
        <div className="bg-navy-700 rounded-2xl divide-y divide-white/5">
          {forecasts.map((f, i) => {
            const d = new Date(f.datetime)
            const dayName = i === 0 ? 'Tomorrow' : DAY_NAMES[d.getDay()]
            return (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-white/50 w-24">{dayName}</span>
                <WeatherIcon condition={f.condition} size={18} />
                <div className="text-sm text-right">
                  <span className="text-white font-medium">{Math.round(f.temperature)}°</span>
                  {f.templow !== undefined && (
                    <span className="text-white/35"> / {Math.round(f.templow)}°</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
