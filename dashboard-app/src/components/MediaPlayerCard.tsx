import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

interface Props {
  entity?: {
    state: string
    attributes: {
      friendly_name?: string
      media_title?: string
      media_artist?: string
      media_album_name?: string
      entity_picture?: string
      volume_level?: number
      media_duration?: number
      media_position?: number
    }
  }
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrev?: () => void
}

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MediaPlayerCard({ entity, onPlay, onPause, onNext, onPrev }: Props) {
  const state    = entity?.state ?? 'off'
  const isPlaying = state === 'playing'
  const title    = entity?.attributes.media_title ?? 'Nothing playing'
  const artist   = entity?.attributes.media_artist ?? ''
  const art      = entity?.attributes.entity_picture
  const volume   = entity?.attributes.volume_level ?? 0
  const duration = entity?.attributes.media_duration ?? 0
  const position = entity?.attributes.media_position ?? 0
  const progress = duration > 0 ? (position / duration) * 100 : 0
  const playerName = entity?.attributes.friendly_name ?? 'Media Player'

  if (state === 'off' || state === 'unavailable') {
    return (
      <div className="bg-navy-700 rounded-2xl p-5">
        <div className="text-xs text-white/30 uppercase tracking-wider mb-2">{playerName}</div>
        <div className="text-sm text-white/25 italic">Not playing</div>
      </div>
    )
  }

  return (
    <div className="bg-navy-700 rounded-2xl p-5">
      <div className="text-xs text-white/35 uppercase tracking-wider mb-3">{playerName}</div>

      <div className="flex gap-3 items-center mb-4">
        {art ? (
          <img
            src={`http://192.168.1.108:8123${art}`}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            alt="cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Volume2 size={20} className="text-white/20" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{title}</div>
          <div className="text-xs text-white/40 truncate">{artist}</div>
        </div>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="mb-3">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/25">{fmtTime(position)}</span>
            <span className="text-[10px] text-white/25">{fmtTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={onPrev} className="text-white/30 hover:text-white/70 transition-colors">
          <SkipBack size={18} />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {isPlaying
            ? <Pause size={18} className="text-white" />
            : <Play  size={18} className="text-white ml-0.5" />
          }
        </button>
        <button onClick={onNext} className="text-white/30 hover:text-white/70 transition-colors">
          <SkipForward size={18} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 mt-3">
        <Volume2 size={12} className="text-white/25" />
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/30 rounded-full"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-white/25">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  )
}
