import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'

const HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyMjRiMmI1YmQ5NmQ0NTY3OWQyNDliZGZkYTljZTYwZCIsImlhdCI6MTc3MzU2NjU1MywiZXhwIjoyMDg4OTI2NTUzfQ.IBhJbgzQF-sSaUERsoeQ06EZAEOM3OBCyt_ezhncZHg'

const CALENDARS = [
  { id: 'calendar.family',  label: 'Family' },
  { id: 'calendar.work_j',  label: 'Ionuț' },
  { id: 'calendar.work_k',  label: 'Katie'  },
  { id: 'calendar.home_j',  label: 'Ionuț' },
  { id: 'calendar.home_k',  label: 'Katie'  },
]

interface CalEvent {
  summary: string
  start: { dateTime?: string; date?: string }
  end:   { dateTime?: string; date?: string }
  calendar: string
}

function formatTime(dt?: string, d?: string): string {
  if (d && !dt) return 'All day'
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function isToday(dt?: string, d?: string): boolean {
  const today = new Date().toDateString()
  const date = dt ? new Date(dt) : d ? new Date(d) : null
  return date?.toDateString() === today
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalEvent[]>([])

  useEffect(() => {
    const now   = new Date()
    const start = now.toISOString()
    const end   = new Date(now.getTime() + 48 * 3600 * 1000).toISOString()

    Promise.all(
      CALENDARS.map(cal =>
        fetch(`/api/calendars/${cal.id}?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${HA_TOKEN}` },
        })
          .then(r => r.ok ? r.json() : [])
          .then((evts: Omit<CalEvent, 'calendar'>[]) =>
            evts.map(e => ({ ...e, calendar: cal.label }))
          )
          .catch(() => [])
      )
    ).then(results => {
      const all = results.flat() as CalEvent[]
      // Deduplicate by summary + start
      const seen = new Set<string>()
      const unique = all.filter(e => {
        const key = `${e.summary}|${e.start.dateTime ?? e.start.date}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      // Sort by start time
      unique.sort((a, b) => {
        const ta = new Date(a.start.dateTime ?? a.start.date ?? 0).getTime()
        const tb = new Date(b.start.dateTime ?? b.start.date ?? 0).getTime()
        return ta - tb
      })
      setEvents(unique.slice(0, 5))
    })
  }, [])

  if (events.length === 0) return (
    <div className="flex items-center gap-2 text-white/25 text-xs">
      <Calendar size={13} />
      <span>No upcoming events</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 mb-1">
        <Calendar size={13} className="text-white/40" />
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Calendar</span>
      </div>
      {events.map((evt, i) => {
        const time   = formatTime(evt.start.dateTime, evt.start.date)
        const today  = isToday(evt.start.dateTime, evt.start.date)
        return (
          <div key={i} className="flex items-start gap-2.5">
            <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${today ? 'bg-pink-400' : 'bg-purple-400/60'}`} />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/80 truncate leading-tight">{evt.summary}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{today ? 'Today' : 'Tomorrow'} {time !== 'All day' ? `· ${time}` : '· All day'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
