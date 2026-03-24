import { useState, useEffect } from 'react'
import { useHA } from './hooks/useHA'
import { DeviceTile } from './components/DeviceTile'
import { MediaPlayerCard } from './components/MediaPlayerCard'
import { EnergySection } from './components/EnergySection'
import { CarPopup } from './components/CarPopup'
import { CalendarWidget } from './components/CalendarWidget'
import {
  Lightbulb, Tv, Speaker, Thermometer, BatteryCharging, Zap,
  User, AirVent, Wifi, WifiOff, Sparkles, ShieldCheck, Home, Car,
  Droplets, Wind, Flame,
} from 'lucide-react'

type View   = 'home' | 'energy' | 'cars'
type CarKey = 'enyaq' | 'id3' | null

const ACTIVE = ['on','playing','idle','paused','open','heat','auto','heat_cool','cool','home','above_horizon','fan_only']
const isOn   = (s?: string) => ACTIVE.includes(s ?? '')
const fmt    = (v?: string, suffix = '') => (!v || v === 'unavailable' || v === 'unknown') ? '—' : (isNaN(Number(v)) ? v : Math.round(Number(v)) + suffix)

const WEATHER_ICON: Record<string, string> = {
  sunny: '☀️', 'partlycloudy': '⛅', cloudy: '☁️', rainy: '🌧️',
  snowy: '❄️', lightning: '⛈️', fog: '🌫️', windy: '💨', clear: '🌙',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export default function App() {
  const [view,     setView]     = useState<View>('home')
  const [carPopup, setCarPopup] = useState<CarKey>(null)
  const { entities, connected, forecast, toggle, mediaControl, svcCall } = useHA()

  const e   = (id: string) => entities[id]
  const st  = (id: string) => entities[id]?.state
  const att = (id: string, key: string) => entities[id]?.attributes?.[key]

  // Weather
  const weather    = e('weather.forecast_home_2')
  const weatherIcon = WEATHER_ICON[weather?.state ?? ''] ?? '🌡️'
  const outdoorTemp = fmt(att('weather.forecast_home_2', 'temperature') as string, '°C')
  const rainChance  = forecast[0]?.precipitation_probability != null
    ? `${forecast[0].precipitation_probability}%`
    : '—'

  // Thermostat
  const indoorTemp = att('climate.thermostat_home', 'current_temperature')

  // Cars
  const enyaqBat   = fmt(st('sensor.skoda_enyaq_battery_percentage'), '%')
  const enyaqRange = fmt(st('sensor.skoda_enyaq_range'), ' mi')
  const enyaqMiles = fmt(st('sensor.skoda_enyaq_mileage'), ' mi')
  const id3Bat     = fmt(st('sensor.id3_id3_battery_level'), '%')
  const id3Range   = fmt(st('sensor.id3_id3_battery_cruising_range'), ' mi')
  const id3Miles   = fmt(st('sensor.id3_miles_since_purchase'), ' mi')

  // Energy
  const elecKwh          = fmt(st('sensor.octopus_energy_electricity_19l3113509_1012733780725_current_accumulative_consumption'), ' kWh')
  const enyaqMonthlyCost = fmt(st('sensor.enyaq_monthly_cost'), ' £')
  const id3MonthlyCost   = fmt(st('sensor.id3_monthly_cost'), ' £')

  // Media
  const homepod = e('media_player.living_room_2')
  const sonyTv  = e('media_player.living_room_tv')
  const mediaEnt = (homepod && isOn(homepod.state)) ? homepod
                 : (sonyTv  && isOn(sonyTv.state))  ? sonyTv
                 : homepod

  const enyaqImg = '/api/image/serve/62f93ec9d3c7b32b5aefcdd1ecc6f08b/original'
  const id3Img   = '/api/image/serve/090aa31129ebded9e73953e88960dd58/original'

  return (
    <div className="flex h-full overflow-hidden text-white select-none">

      {/* ── Connection indicator ── */}
      <div className="absolute top-3 right-3 z-50">
        {connected
          ? <Wifi size={11} className="text-white/20" />
          : <WifiOff size={11} className="text-red-400/70 animate-pulse" />}
      </div>

      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <aside className="w-64 shrink-0 flex flex-col gap-4 p-4 overflow-y-auto border-r border-white/10 glass-dark">

        {/* Clock + greeting */}
        <div>
          <Clock />
          <div className="text-sm text-white/50 mt-1">{greeting()}</div>
        </div>

        {/* Weather */}
        <div className="glass rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{outdoorTemp}</div>
              <div className="text-xs text-white/40 capitalize mt-0.5">{weather?.state ?? '—'}</div>
            </div>
            <span className="text-4xl">{weatherIcon}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Droplets size={11} className="text-sky-400" />
              Rain {rainChance}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Wind size={11} className="text-white/30" />
              {fmt(att('weather.forecast_home_2', 'wind_speed') as string, ' km/h')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Home size={11} className="text-orange-400" />
              Inside {indoorTemp ?? '—'}°C
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Droplets size={11} className="text-blue-400" />
              {fmt(att('weather.forecast_home_2', 'humidity') as string, '%')} humidity
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass rounded-2xl p-4">
          <CalendarWidget />
        </div>

        {/* Energy stats */}
        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Energy</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-white/35">Electricity today</div>
              <div className="text-sm font-bold">{elecKwh}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
              <Flame size={14} className="text-sky-400" />
            </div>
            <div>
              <div className="text-xs text-white/35">Gas today</div>
              <div className="text-sm font-bold">—</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <BatteryCharging size={14} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-white/35">Car charging this month</div>
              <div className="text-sm font-bold">{enyaqMonthlyCost} · {id3MonthlyCost}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Tab nav */}
        <nav className="flex items-center gap-1 px-4 pt-4 pb-2 shrink-0">
          {(['home', 'energy', 'cars'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                view === v
                  ? 'bg-white/20 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {v}
            </button>
          ))}
        </nav>

        {/* ── HOME ── */}
        {view === 'home' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 grid grid-cols-2 gap-4 content-start">

            {/* Security */}
            <Category title="Security" icon={<ShieldCheck size={14} />}>
              <DeviceTile label="Ionuț"    icon={User} color="blue"
                isOn={isOn(st('person.homeiz'))}
                sublabel={st('person.homeiz') ?? '—'} onClick={() => {}} />
              <DeviceTile label="Katie"    icon={User} color="blue"
                isOn={isOn(st('person.katie'))}
                sublabel={st('person.katie') ?? '—'}  onClick={() => {}} />
              <DeviceTile label="Annalise" icon={User} color="blue"
                isOn={isOn(st('person.annalise'))}
                sublabel={st('person.annalise') ?? '—'} onClick={() => {}} />
            </Category>

            {/* Lights */}
            <Category title="Lights" icon={<Lightbulb size={14} />}>
              <DeviceTile label="Living Room LED" icon={Lightbulb} color="orange"
                isOn={isOn(st('light.gledopto_gl_c_007_light'))}
                onClick={() => toggle('light.gledopto_gl_c_007_light')} />
              <DeviceTile label="Bathroom" icon={Lightbulb} color="orange"
                isOn={isOn(st('light.main_light_bathroom_light_2'))}
                onClick={() => toggle('light.main_light_bathroom_light_2')} />
              <DeviceTile label="Star Light" icon={Sparkles} color="orange"
                isOn={isOn(st('light.star_light_light'))}
                onClick={() => toggle('light.star_light_light')} />
              <DeviceTile label="Annie's" icon={Lightbulb} color="orange"
                isOn={isOn(st('light.annie_s_light_light'))}
                onClick={() => toggle('light.annie_s_light_light')} />
              <DeviceTile label="Bedside" icon={Lightbulb} color="orange"
                isOn={isOn(st('light.innr_by_286_c_light'))}
                isUnavailable={st('light.innr_by_286_c_light') === 'unavailable'}
                onClick={() => toggle('light.innr_by_286_c_light')} />
              <DeviceTile label="Fairy Lights" icon={Sparkles} color="orange"
                isOn={isOn(st('switch.new_fairy_lights'))}
                onClick={() => toggle('switch.new_fairy_lights')} />
            </Category>

            {/* Climate */}
            <Category title="Climate" icon={<Thermometer size={14} />}>
              <DeviceTile label="Thermostat" icon={Thermometer} color="orange"
                isOn={isOn(st('climate.thermostat_home'))}
                sublabel={`${att('climate.thermostat_home','current_temperature') ?? '—'}°C`}
                onClick={() => {}} />
              <DeviceTile label="Living Room" icon={Thermometer} color="orange"
                isOn={isOn(st('climate.living_f_trv'))}
                sublabel={`${att('climate.living_f_trv','current_temperature') ?? '—'}°C`}
                onClick={() => {}} />
              <DeviceTile label="Bedroom" icon={Thermometer} color="orange"
                isOn={isOn(st('climate.master_trv'))}
                sublabel={`${att('climate.master_trv','current_temperature') ?? '—'}°C`}
                onClick={() => {}} />
            </Category>

            {/* Media */}
            <Category title="Media" icon={<Speaker size={14} />}>
              <DeviceTile label="Sony TV" icon={Tv} color="blue"
                isOn={isOn(st('media_player.living_room_tv'))}
                sublabel={st('media_player.living_room_tv')}
                onClick={() => toggle('media_player.living_room_tv')} />
              <DeviceTile label="HomePod" icon={Speaker} color="blue"
                isOn={isOn(st('media_player.living_room_2'))}
                sublabel={(att('media_player.living_room_2','media_title') as string)?.substring(0,16) ?? st('media_player.living_room_2')}
                onClick={() => toggle('media_player.living_room_2')} />
              <DeviceTile label="Kitchen TV" icon={Tv} color="blue"
                isOn={isOn(st('media_player.minitv'))}
                sublabel={st('media_player.minitv')}
                onClick={() => toggle('media_player.minitv')} />
              {mediaEnt && isOn(mediaEnt.state) && (
                <div className="col-span-2">
                  <MediaPlayerCard
                    entity={mediaEnt as any}
                    onPlay={()  => mediaControl(mediaEnt.entity_id, 'media_play')}
                    onPause={()  => mediaControl(mediaEnt.entity_id, 'media_pause')}
                    onNext={() => mediaControl(mediaEnt.entity_id, 'media_next_track')}
                    onPrev={() => mediaControl(mediaEnt.entity_id, 'media_previous_track')}
                  />
                </div>
              )}
            </Category>

            {/* Cars — full width */}
            <div className="col-span-2">
              <Category title="Cars" icon={<Car size={14} />} columns={2}>
                <MiniCarCard
                  name="Škoda Enyaq" image={enyaqImg}
                  battery={enyaqBat} range={enyaqRange}
                  isCharging={isOn(st('binary_sensor.enyaq_charging_active'))}
                  batNum={parseInt(st('sensor.skoda_enyaq_battery_percentage') ?? '0')}
                  onClick={() => setCarPopup('enyaq')}
                />
                <MiniCarCard
                  name="VW ID.3" image={id3Img}
                  battery={id3Bat} range={id3Range}
                  isCharging={isOn(st('binary_sensor.id3_charging_active'))}
                  batNum={parseInt(st('sensor.id3_id3_battery_level') ?? '0')}
                  onClick={() => setCarPopup('id3')}
                />
              </Category>
            </div>

          </div>
        )}

        {/* ── ENERGY ── */}
        {view === 'energy' && (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 content-start">
            <div className="lg:col-span-2">
              <EnergySection
                electricCost={elecKwh} gasCost="—"
                enyaqBattery={fmt(st('sensor.skoda_enyaq_battery_percentage'))}
                id3Battery={fmt(st('sensor.id3_id3_battery_level'))}
                enyaqRange={fmt(st('sensor.skoda_enyaq_range'))}
                id3Range={fmt(st('sensor.id3_id3_battery_cruising_range'))}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="glass rounded-2xl p-4 flex flex-col gap-3">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Smart Charging</div>
                <DeviceTile label="Enyaq" sublabel="Octopus Intelligent" icon={BatteryCharging} color="green"
                  isOn={isOn(st('switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_smart_charge'))}
                  onClick={() => toggle('switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_smart_charge')} />
                <DeviceTile label="ID.3" sublabel="Octopus Intelligent" icon={BatteryCharging} color="green"
                  isOn={isOn(st('switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_smart_charge'))}
                  onClick={() => toggle('switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_smart_charge')} />
              </div>
            </div>
          </div>
        )}

        {/* ── CARS ── */}
        {view === 'cars' && (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            <FullCarCard
              name="Škoda Enyaq" image={enyaqImg}
              battery={enyaqBat} range={enyaqRange} mileage={enyaqMiles}
              isCharging={isOn(st('binary_sensor.enyaq_charging_active'))}
              acOn={isOn(st('climate.skoda_enyaq_air_conditioning'))}
              onToggleAC={() => toggle('climate.skoda_enyaq_air_conditioning')}
              onClick={() => setCarPopup('enyaq')}
            />
            <FullCarCard
              name="VW ID.3" image={id3Img}
              battery={id3Bat} range={id3Range} mileage={id3Miles}
              isCharging={isOn(st('binary_sensor.id3_charging_active'))}
              acOn={isOn(st('climate.id3_electric_climatisation'))}
              onToggleAC={() => toggle('climate.id3_electric_climatisation')}
              onClick={() => setCarPopup('id3')}
            />
          </div>
        )}
      </div>

      {/* Car popups */}
      <CarPopup isOpen={carPopup === 'enyaq'} onClose={() => setCarPopup(null)}
        name="Škoda Enyaq" image={enyaqImg} entities={entities} toggle={toggle} svcCall={svcCall}
        ids={{
          battery: 'sensor.skoda_enyaq_battery_percentage', range: 'sensor.skoda_enyaq_range',
          mileage: 'sensor.skoda_enyaq_mileage', chargingState: 'sensor.skoda_enyaq_charging_state',
          chargingPower: 'sensor.skoda_enyaq_charging_power', ac: 'climate.skoda_enyaq_air_conditioning',
          seatHeating: 'switch.skoda_enyaq_right_seat_heating_with_ac',
          smartCharge: 'switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_smart_charge',
          bumpCharge:  'switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_bump_charge',
          chargeTarget:'number.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_charge_target',
          targetTime:  'select.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_target_time',
        }}
      />
      <CarPopup isOpen={carPopup === 'id3'} onClose={() => setCarPopup(null)}
        name="VW ID.3" image={id3Img} entities={entities} toggle={toggle} svcCall={svcCall}
        ids={{
          battery: 'sensor.id3_id3_battery_level', range: 'sensor.id3_id3_battery_cruising_range',
          mileage: 'sensor.id3_miles_since_purchase', chargingState: 'binary_sensor.id3_charging_active',
          ac: 'climate.id3_electric_climatisation', doorsLocked: 'binary_sensor.id3_id3_doors_locked',
          smartCharge: 'switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_smart_charge',
          bumpCharge:  'switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_bump_charge',
          chargeTarget:'number.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_charge_target',
          targetTime:  'select.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_target_time',
        }}
      />
    </div>
  )
}

// ── Clock ──────────────────────────────────────────────────────────────────────
function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div>
      <div className="text-5xl font-bold tabular-nums leading-none">
        {now.getHours().toString().padStart(2,'0')}
        <span className="opacity-40 animate-pulse">:</span>
        {now.getMinutes().toString().padStart(2,'0')}
      </div>
      <div className="text-xs text-white/40 mt-1.5">
        {now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
      </div>
    </div>
  )
}

// ── Category section ───────────────────────────────────────────────────────────
function Category({ title, icon, columns = 3, children }: {
  title: string; icon?: React.ReactNode; columns?: number; children: React.ReactNode
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-white/40">{icon}</span>
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">{title}</span>
      </div>
      <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {children}
      </div>
    </div>
  )
}

// ── Mini car card (Home view) ──────────────────────────────────────────────────
function MiniCarCard({ name, image, battery, range, isCharging, batNum, onClick }: {
  name: string; image: string; battery: string; range: string
  isCharging: boolean; batNum: number; onClick: () => void
}) {
  const clr = batNum > 60 ? 'text-emerald-400' : batNum > 30 ? 'text-amber-400' : 'text-red-400'
  return (
    <button onClick={onClick}
      className="glass rounded-2xl overflow-hidden text-left hover:brightness-110 transition-all active:scale-95 cursor-pointer">
      <div className="relative" style={{ aspectRatio:'16/7' }}>
        <img src={image} className="w-full h-full object-contain p-3" alt={name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3">
          <div className={`text-2xl font-bold leading-none ${clr}`}>{battery}</div>
          <div className="text-xs text-white/40">{range}</div>
        </div>
        {isCharging && (
          <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <BatteryCharging size={9} /> Charging
          </div>
        )}
      </div>
      <div className="px-3 pb-3 pt-1">
        <div className="text-xs text-white/40">{name}</div>
      </div>
    </button>
  )
}

// ── Full car card (Cars view) ──────────────────────────────────────────────────
function FullCarCard({ name, image, battery, range, mileage, isCharging, acOn, onToggleAC, onClick }: {
  name: string; image: string; battery: string; range: string; mileage: string
  isCharging: boolean; acOn: boolean; onToggleAC: () => void; onClick: () => void
}) {
  const batNum = parseInt(battery)
  const clr    = batNum > 60 ? 'text-emerald-400' : batNum > 30 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex flex-col gap-3">
      <div className="glass rounded-2xl overflow-hidden cursor-pointer hover:brightness-110 transition-all"
        style={{ aspectRatio:'16/9' }} onClick={onClick}>
        <div className="relative w-full h-full">
          <img src={image} className="w-full h-full object-contain p-6" alt={name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{name}</div>
            <div className={`text-4xl font-bold leading-none ${clr}`}>{battery}</div>
          </div>
          {isCharging && (
            <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <BatteryCharging size={11} /> Charging
            </div>
          )}
          <div className="absolute top-3 left-3 text-[10px] text-white/30">Tap for controls</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([['Battery', battery, clr], ['Range', range, 'text-white'], ['Mileage', mileage, 'text-white/60']] as const).map(([label, val, c]) => (
          <div key={label} className="glass rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${c}`}>{val}</div>
            <div className="text-xs text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <DeviceTile label="Air Conditioning" sublabel={acOn ? 'Active' : 'Off'}
        icon={AirVent} isOn={acOn} color="blue" onClick={onToggleAC} />
    </div>
  )
}
