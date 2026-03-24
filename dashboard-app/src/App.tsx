import { useState, useEffect } from 'react'
import { useHA } from './hooks/useHA'
import { Sidebar } from './components/Sidebar'
import { DeviceTile } from './components/DeviceTile'
import { RoomSection } from './components/RoomSection'
import { WeatherCard } from './components/WeatherCard'
import { MediaPlayerCard } from './components/MediaPlayerCard'
import { EnergySection } from './components/EnergySection'
import { StatCard } from './components/StatCard'
import { CarPopup } from './components/CarPopup'
import {
  Lightbulb, Tv, Speaker,
  Thermometer, BatteryCharging, Zap, Flame,
  User, AirVent, Wifi, WifiOff, Sparkles,
} from 'lucide-react'

type View = 'home' | 'energy' | 'cars'
type CarKey = 'enyaq' | 'id3' | null

const ACTIVE_STATES = ['on','playing','idle','paused','open','heat','auto','heat_cool','cool','home','above_horizon','fan_only']
const isOn = (state?: string) => ACTIVE_STATES.includes(state ?? '')

function fmt(val?: string, suffix = '') {
  if (!val || val === 'unavailable' || val === 'unknown') return '—'
  const num = parseFloat(val)
  return isNaN(num) ? val + suffix : Math.round(num) + suffix
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [carPopup, setCarPopup] = useState<CarKey>(null)
  const { entities, connected, toggle, mediaControl, svcCall } = useHA()

  const e   = (id: string) => entities[id]
  const st  = (id: string) => entities[id]?.state
  const att = (id: string, key: string) => entities[id]?.attributes?.[key]

  // Real entity IDs discovered from HA
  const homepod = e('media_player.living_room_2')
  const sonyTv  = e('media_player.living_room_tv')
  const weather = e('weather.forecast_home_2')

  // Cars
  const enyaqBat   = fmt(st('sensor.skoda_enyaq_battery_percentage'), '%')
  const enyaqRange = fmt(st('sensor.skoda_enyaq_range'), ' mi')
  const enyaqMiles = fmt(st('sensor.skoda_enyaq_mileage'), ' mi')
  const id3Bat     = fmt(st('sensor.id3_id3_battery_level'), '%')
  const id3Range   = fmt(st('sensor.id3_id3_battery_cruising_range'), ' mi')
  const id3Miles   = fmt(st('sensor.id3_miles_since_purchase'), ' mi')

  // Energy (consumption kWh, no cost sensor found)
  const elecKwh = fmt(st('sensor.octopus_energy_electricity_19l3113509_1012733780725_current_accumulative_consumption'), ' kWh')
  const enyaqMonthlyCost = fmt(st('sensor.enyaq_monthly_cost'), ' £')
  const id3MonthlyCost   = fmt(st('sensor.id3_monthly_cost'), ' £')

  const mediaEnt = (homepod && isOn(homepod.state)) ? homepod
                 : (sonyTv  && isOn(sonyTv.state))  ? sonyTv
                 : homepod

  return (
    <div className="flex h-full bg-navy-900 text-white overflow-hidden select-none">
      <Sidebar active={view} onChange={setView} />

      <div className="absolute top-3 right-3 z-50">
        {connected
          ? <Wifi size={12} className="text-emerald-500/40" />
          : <WifiOff size={12} className="text-red-500/60 animate-pulse" />
        }
      </div>

      {/* ═══════════ HOME ═══════════ */}
      {view === 'home' && (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start pb-24 md:pb-4">

          {/* ── Left col ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-navy-700 rounded-2xl p-5">
              <Clock />
            </div>

            <WeatherCard
              entity={weather as any}
              indoorTemp={att('climate.thermostat_home', 'current_temperature') as number | undefined}
            />

            <RoomSection title="Presence">
              <DeviceTile label="Ionuț"    icon={User} isOn={isOn(st('person.homeiz'))}   color="blue"
                sublabel={st('person.homeiz')}   onClick={() => {}} />
              <DeviceTile label="Katie"    icon={User} isOn={isOn(st('person.katie'))}    color="green"
                sublabel={st('person.katie')}    onClick={() => {}} />
              <DeviceTile label="Annalise" icon={User} isOn={isOn(st('person.annalise'))} color="orange"
                sublabel={st('person.annalise')} onClick={() => {}} />
            </RoomSection>
          </div>

          {/* ── Middle col ── */}
          <div className="flex flex-col gap-4">

            <RoomSection title="Living Room" columns={3}>
              <DeviceTile label="Sony TV"   icon={Tv}       isOn={isOn(st('media_player.living_room_tv'))} color="blue"
                sublabel={st('media_player.living_room_tv')}
                onClick={() => toggle('media_player.living_room_tv')} />
              <DeviceTile label="HomePod"   icon={Speaker}  isOn={isOn(st('media_player.living_room_2'))}  color="blue"
                sublabel={(att('media_player.living_room_2','media_title') as string)?.substring(0,14) ?? st('media_player.living_room_2')}
                onClick={() => toggle('media_player.living_room_2')} />
              <DeviceTile label="LED Strip" icon={Lightbulb} isOn={isOn(st('light.gledopto_gl_c_007_light'))} color="orange"
                onClick={() => toggle('light.gledopto_gl_c_007_light')} />
              <DeviceTile label="Heating"   icon={Thermometer} isOn={isOn(st('climate.living_f_trv'))}    color="orange"
                sublabel={`${att('climate.living_f_trv','current_temperature') ?? '—'}°C`}
                onClick={() => {}} />
            </RoomSection>

            <RoomSection title="Bedroom">
              <DeviceTile label="Bedside" icon={Lightbulb} isOn={isOn(st('light.innr_by_286_c_light'))} color="orange"
                isUnavailable={st('light.innr_by_286_c_light') === 'unavailable'}
                onClick={() => toggle('light.innr_by_286_c_light')} />
              <DeviceTile label="Heating" icon={Thermometer} isOn={isOn(st('climate.master_trv'))} color="orange"
                sublabel={`${att('climate.master_trv','current_temperature') ?? '—'}°C`}
                onClick={() => {}} />
            </RoomSection>

            <RoomSection title="Office">
              <DeviceTile label="Light"        icon={Lightbulb} isOn={isOn(st('light.office_light_light_2'))}
                isUnavailable={st('light.office_light_light_2') === 'unavailable'}
                color="orange" onClick={() => toggle('light.office_light_light_2')} />
              <DeviceTile label="Fairy Lights" icon={Sparkles}  isOn={isOn(st('switch.new_fairy_lights'))} color="orange"
                onClick={() => toggle('switch.new_fairy_lights')} />
            </RoomSection>

            <RoomSection title="Kitchen">
              <DeviceTile label="MiniTV" icon={Tv} isOn={isOn(st('media_player.minitv'))} color="blue"
                sublabel={st('media_player.minitv')}
                onClick={() => toggle('media_player.minitv')} />
            </RoomSection>

            <MediaPlayerCard
              entity={mediaEnt as any}
              onPlay={()  => mediaControl(mediaEnt?.entity_id ?? 'media_player.living_room_2', 'media_play')}
              onPause={()  => mediaControl(mediaEnt?.entity_id ?? 'media_player.living_room_2', 'media_pause')}
              onNext={() => mediaControl(mediaEnt?.entity_id ?? 'media_player.living_room_2', 'media_next_track')}
              onPrev={() => mediaControl(mediaEnt?.entity_id ?? 'media_player.living_room_2', 'media_previous_track')}
            />
          </div>

          {/* ── Right col ── */}
          <div className="flex flex-col gap-4">

            <RoomSection title="Bathroom">
              <DeviceTile label="Light"      icon={Lightbulb} isOn={isOn(st('light.main_light_bathroom_light_2'))} color="orange"
                onClick={() => toggle('light.main_light_bathroom_light_2')} />
              <DeviceTile label="Star Light" icon={Lightbulb} isOn={isOn(st('light.star_light_light'))} color="orange"
                onClick={() => toggle('light.star_light_light')} />
            </RoomSection>

            <RoomSection title="Annie's Bedroom">
              <DeviceTile label="Light"   icon={Lightbulb}   isOn={isOn(st('light.annie_s_light_light'))} color="orange"
                onClick={() => toggle('light.annie_s_light_light')} />
              <DeviceTile label="Heating" icon={Thermometer} isOn={isOn(st('climate.office'))} color="orange"
                sublabel={`${att('climate.office','current_temperature') ?? '—'}°C`}
                onClick={() => {}} />
            </RoomSection>

            <RoomSection title="Conservatory · Garden">
              <DeviceTile label="Conservatory" icon={Lightbulb} color="orange"
                isOn={isOn(st('light.conservatory_light_2_light'))}
                isUnavailable={st('light.conservatory_light_2_light') === 'unavailable'}
                onClick={() => toggle('light.conservatory_light_2_light')} />
              <DeviceTile label="Garden Lights" icon={Lightbulb} color="orange"
                isOn={isOn(st('switch.innr_sp_222_switch'))}
                isUnavailable={st('switch.innr_sp_222_switch') === 'unavailable'}
                onClick={() => toggle('switch.innr_sp_222_switch')} />
            </RoomSection>

            {/* Status strip */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Enyaq"    value={enyaqBat} sublabel={enyaqRange} icon={BatteryCharging}
                iconColor={parseInt(enyaqBat) > 60 ? 'text-emerald-400' : parseInt(enyaqBat) > 30 ? 'text-orange-400' : 'text-red-400'}
                onClick={() => setView('cars')} />
              <StatCard label="ID.3"     value={id3Bat}   sublabel={id3Range}   icon={BatteryCharging}
                iconColor={parseInt(id3Bat) > 60 ? 'text-emerald-400' : parseInt(id3Bat) > 30 ? 'text-orange-400' : 'text-red-400'}
                onClick={() => setView('cars')} />
              <StatCard label="Electric" value={elecKwh}  sublabel="today" icon={Zap}   iconColor="text-orange-400"
                onClick={() => setView('energy')} />
              <StatCard label="Enyaq £"  value={enyaqMonthlyCost} sublabel="this month" icon={Flame} iconColor="text-sky-400"
                onClick={() => setView('energy')} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ ENERGY ═══════════ */}
      {view === 'energy' && (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 content-start pb-24 md:pb-4">
          <div className="lg:col-span-2">
            <EnergySection
              electricCost={elecKwh}
              gasCost={'—'}
              enyaqBattery={fmt(st('sensor.skoda_enyaq_battery_percentage'))}
              id3Battery={fmt(st('sensor.id3_id3_battery_level'))}
              enyaqRange={fmt(st('sensor.skoda_enyaq_range'))}
              id3Range={fmt(st('sensor.id3_id3_electric_range'))}
            />
          </div>
          <div className="flex flex-col gap-3">
            <StatCard label="Electricity today" value={elecKwh} icon={Zap}   iconColor="text-orange-400" />
            <StatCard label="Enyaq this month"   value={enyaqMonthlyCost} icon={BatteryCharging} iconColor="text-emerald-400" />
            <StatCard label="ID.3 this month"    value={id3MonthlyCost}   icon={BatteryCharging} iconColor="text-sky-400"    />
            <RoomSection title="Octopus Intelligent">
              <DeviceTile label="Enyaq Smart Charge" icon={BatteryCharging}
                isOn={isOn(st('switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_smart_charge'))}
                color="green" sublabel="Smart charging"
                onClick={() => toggle('switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_smart_charge')} />
              <DeviceTile label="ID.3 Smart Charge" icon={BatteryCharging}
                isOn={isOn(st('switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_smart_charge'))}
                color="green" sublabel="Smart charging"
                onClick={() => toggle('switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_smart_charge')} />
            </RoomSection>
          </div>
        </div>
      )}

      {/* ═══════════ CARS ═══════════ */}
      {view === 'cars' && (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 content-start pb-24 md:pb-4">
          <CarPanel
            name="Škoda Enyaq"
            image="/api/image/serve/62f93ec9d3c7b32b5aefcdd1ecc6f08b/original"
            battery={enyaqBat} range={enyaqRange} mileage={enyaqMiles}
            isCharging={isOn(st('binary_sensor.enyaq_charging_active'))}
            acState={st('climate.skoda_enyaq_air_conditioning')}
            onToggleAC={() => toggle('climate.skoda_enyaq_air_conditioning')}
            onImageClick={() => setCarPopup('enyaq')}
          />
          <CarPanel
            name="Volkswagen ID.3"
            image="/api/image/serve/090aa31129ebded9e73953e88960dd58/original"
            battery={id3Bat} range={id3Range} mileage={id3Miles}
            isCharging={isOn(st('binary_sensor.id3_charging_active'))}
            acState={st('climate.id3_electric_climatisation')}
            onToggleAC={() => toggle('climate.id3_electric_climatisation')}
            onImageClick={() => setCarPopup('id3')}
          />
        </div>
      )}

      {/* ═══════════ CAR POPUPS ═══════════ */}
      <CarPopup
        isOpen={carPopup === 'enyaq'}
        onClose={() => setCarPopup(null)}
        name="Škoda Enyaq"
        image="/api/image/serve/62f93ec9d3c7b32b5aefcdd1ecc6f08b/original"
        entities={entities}
        ids={{
          battery:       'sensor.skoda_enyaq_battery_percentage',
          range:         'sensor.skoda_enyaq_range',
          mileage:       'sensor.skoda_enyaq_mileage',
          chargingState: 'sensor.skoda_enyaq_charging_state',
          chargingPower: 'sensor.skoda_enyaq_charging_power',
          ac:            'climate.skoda_enyaq_air_conditioning',
          seatHeating:   'switch.skoda_enyaq_right_seat_heating_with_ac',
          smartCharge:   'switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_smart_charge',
          bumpCharge:    'switch.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_bump_charge',
          chargeTarget:  'number.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_charge_target',
          targetTime:    'select.octopus_energy_00000000_0002_4000_8020_0000000e2acf_intelligent_target_time',
        }}
        toggle={toggle}
        svcCall={svcCall}
      />
      <CarPopup
        isOpen={carPopup === 'id3'}
        onClose={() => setCarPopup(null)}
        name="Volkswagen ID.3"
        image="/api/image/serve/090aa31129ebded9e73953e88960dd58/original"
        entities={entities}
        ids={{
          battery:       'sensor.id3_id3_battery_level',
          range:         'sensor.id3_id3_battery_cruising_range',
          mileage:       'sensor.id3_miles_since_purchase',
          chargingState: 'binary_sensor.id3_charging_active',
          ac:            'climate.id3_electric_climatisation',
          doorsLocked:   'binary_sensor.id3_id3_doors_locked',
          smartCharge:   'switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_smart_charge',
          bumpCharge:    'switch.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_bump_charge',
          chargeTarget:  'number.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_charge_target',
          targetTime:    'select.octopus_energy_00000000_0002_4000_8020_0000000e2592_intelligent_target_time',
        }}
        toggle={toggle}
        svcCall={svcCall}
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
      <div className="text-5xl font-bold text-white tabular-nums leading-none">
        {now.getHours().toString().padStart(2, '0')}
        <span className="opacity-60 animate-pulse">:</span>
        {now.getMinutes().toString().padStart(2, '0')}
      </div>
      <div className="text-sm text-white/35 mt-1.5">
        {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  )
}

// ── Car panel ─────────────────────────────────────────────────────────────────
interface CarPanelProps {
  name: string; image: string
  battery: string; range: string; mileage: string
  isCharging: boolean; acState?: string; onToggleAC: () => void
  onImageClick: () => void
}

function CarPanel({ name, image, battery, range, mileage, isCharging, acState, onToggleAC, onImageClick }: CarPanelProps) {
  const batNum  = parseInt(battery)
  const batClr  = batNum > 60 ? 'text-emerald-400' : batNum > 30 ? 'text-orange-400' : 'text-red-400'
  const acOn    = ['cool','heat','heat_cool','fan_only','on'].includes(acState ?? '')

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative bg-navy-700 rounded-2xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-white/20 transition-all"
        style={{ aspectRatio: '16/9' }}
        onClick={onImageClick}
        title="Tap for controls"
      >
        <img src={image} className="w-full h-full object-contain p-6" alt={name} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{name}</div>
          <div className={`text-4xl font-bold leading-none ${batClr}`}>{battery}</div>
        </div>
        {isCharging && (
          <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
            <BatteryCharging size={11} /> Charging
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {([['Battery', battery, batClr], ['Range', range, 'text-white'], ['Mileage', mileage, 'text-white']] as const).map(([label, val, clr]) => (
          <div key={label} className="bg-navy-700 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${clr}`}>{val}</div>
            <div className="text-xs text-white/35 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <DeviceTile label="Air Conditioning" sublabel={acOn ? 'Pre-conditioning active' : 'Off'}
        icon={AirVent} isOn={acOn} color="blue" onClick={onToggleAC} />
    </div>
  )
}
