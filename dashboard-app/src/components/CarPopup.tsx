import { X, BatteryCharging, Zap, AirVent, Lock, Unlock, Wind, MapPin } from 'lucide-react'
import type { HassEntities } from '../hooks/useHA'

interface CarEntityIds {
  battery:      string
  range:        string
  mileage:      string
  chargingState: string   // sensor for Enyaq, binary_sensor for ID.3
  chargingPower?: string
  ac:           string
  smartCharge:  string
  bumpCharge:   string
  chargeTarget: string    // number entity (Octopus)
  targetTime:   string    // select entity (Octopus)
  seatHeating?: string
  doorsLocked?: string
}

interface CarPopupProps {
  isOpen:    boolean
  onClose:   () => void
  name:      string
  image:     string
  ids:       CarEntityIds
  entities:  HassEntities
  toggle:    (id: string) => void
  svcCall:   (domain: string, service: string, data: object) => void
}

const ACTIVE = ['on','heat','cool','heat_cool','fan_only','auto']
const isOn   = (s?: string) => ACTIVE.includes(s ?? '')
const fmt    = (v?: string, suffix = '') => (!v || v === 'unavailable' || v === 'unknown') ? '—' : (isNaN(Number(v)) ? v : Math.round(Number(v)) + suffix)

export function CarPopup({ isOpen, onClose, name, image, ids, entities, toggle, svcCall }: CarPopupProps) {
  if (!isOpen) return null

  const st = (id: string) => entities[id]?.state

  const battery      = fmt(st(ids.battery), '%')
  const range        = fmt(st(ids.range), ' mi')
  const mileage      = fmt(st(ids.mileage), ' mi')
  const batNum       = parseInt(st(ids.battery) ?? '0')
  const batClr       = batNum > 60 ? 'text-emerald-400' : batNum > 30 ? 'text-amber-400' : 'text-red-400'
  const acOn         = isOn(st(ids.ac))
  const smartOn      = isOn(st(ids.smartCharge))
  const bumpOn       = isOn(st(ids.bumpCharge))
  const chargeTarget = parseInt(st(ids.chargeTarget) ?? '0')
  const targetTime   = st(ids.targetTime) ?? '—'
  const doorsLocked  = ids.doorsLocked ? st(ids.doorsLocked) === 'on' : null
  const seatHeatOn   = ids.seatHeating ? isOn(st(ids.seatHeating)) : null

  // Charging status label
  const chargingRaw = st(ids.chargingState) ?? ''
  const chargingLabel = chargingRaw === 'connect_cable' ? 'Cable not connected'
    : chargingRaw === 'charging'      ? `Charging${ids.chargingPower ? ` · ${fmt(st(ids.chargingPower), ' kW')}` : ''}`
    : chargingRaw === 'conserving'    ? 'Conserving'
    : chargingRaw === 'true'          ? (ids.chargingPower ? `Charging · ${fmt(st(ids.chargingPower), ' kW')}` : 'Charging')
    : chargingRaw === 'false'         ? 'Not charging'
    : chargingRaw || '—'

  const adjustTarget = (delta: number) => {
    const next = Math.min(100, Math.max(10, chargeTarget + delta))
    svcCall('number', 'set_value', { entity_id: ids.chargeTarget, value: next })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-[#1a1a35] rounded-t-3xl p-5 pb-8 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">{name}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={14} className="text-white/70" />
          </button>
        </div>

        {/* Car image */}
        <div className="relative bg-navy-900/50 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
          <img src={image} className="w-full h-full object-contain py-3 px-6" alt={name} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a35]/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4">
            <div className={`text-3xl font-bold leading-none ${batClr}`}>{battery}</div>
            <div className="text-xs text-white/40 mt-0.5">{range} range</div>
          </div>
          {doorsLocked !== null && (
            <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
              doorsLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {doorsLocked ? <Lock size={11} /> : <Unlock size={11} />}
              {doorsLocked ? 'Locked' : 'Unlocked'}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Battery',  value: battery,  color: batClr },
            { label: 'Range',    value: range,     color: 'text-white' },
            { label: 'Mileage',  value: mileage,   color: 'text-white/60' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <div className={`text-lg font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/30 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Charging status */}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
          <BatteryCharging size={14} className="text-emerald-400 shrink-0" />
          <span className="text-sm text-white/70">{chargingLabel}</span>
        </div>

        {/* Controls grid */}
        <div className="grid grid-cols-2 gap-2">
          <ControlTile
            label="Air Conditioning"
            icon={<AirVent size={16} />}
            isOn={acOn}
            onClick={() => toggle(ids.ac)}
          />
          {seatHeatOn !== null && (
            <ControlTile
              label="Seat Heating"
              icon={<Wind size={16} />}
              isOn={seatHeatOn}
              onClick={() => toggle(ids.seatHeating!)}
            />
          )}
          <ControlTile
            label="Smart Charge"
            sublabel="Octopus Intelligent"
            icon={<Zap size={16} />}
            isOn={smartOn}
            color="green"
            onClick={() => toggle(ids.smartCharge)}
          />
          <ControlTile
            label="Boost Charge"
            sublabel="Charge now"
            icon={<BatteryCharging size={16} />}
            isOn={bumpOn}
            color="green"
            onClick={() => toggle(ids.bumpCharge)}
          />
        </div>

        {/* Charge target + ready time */}
        <div className="grid grid-cols-2 gap-2">
          {/* Charge target */}
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-xs text-white/35 mb-2">Charge target</div>
            <div className="flex items-center justify-between">
              <button onClick={() => adjustTarget(-5)} className="w-7 h-7 rounded-lg bg-white/10 text-white/70 text-lg leading-none hover:bg-white/20 transition-colors flex items-center justify-center">−</button>
              <span className="text-xl font-bold text-white">{chargeTarget}%</span>
              <button onClick={() => adjustTarget(+5)} className="w-7 h-7 rounded-lg bg-white/10 text-white/70 text-lg leading-none hover:bg-white/20 transition-colors flex items-center justify-center">+</button>
            </div>
          </div>
          {/* Ready time */}
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-xs text-white/35 mb-2">Ready by</div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-white/30 shrink-0" />
              <span className="text-xl font-bold text-white">{targetTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ControlTileProps {
  label:    string
  sublabel?: string
  icon:     React.ReactNode
  isOn:     boolean
  color?:   'blue' | 'green' | 'orange'
  onClick:  () => void
}

function ControlTile({ label, sublabel, icon, isOn, color = 'blue', onClick }: ControlTileProps) {
  const activeClr = color === 'green' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
    : color === 'orange' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
    : 'bg-sky-500/20 border-sky-500/30 text-sky-400'

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl p-3 border transition-all text-left w-full ${
        isOn ? activeClr : 'bg-white/5 border-white/5 text-white/40'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isOn ? 'bg-white/15' : 'bg-white/5'}`}>
        {icon}
      </div>
      <div>
        <div className={`text-xs font-medium ${isOn ? '' : 'text-white/50'}`}>{label}</div>
        {sublabel && <div className="text-xs opacity-50 mt-0.5">{sublabel}</div>}
      </div>
    </button>
  )
}
