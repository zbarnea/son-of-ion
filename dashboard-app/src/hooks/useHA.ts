import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  callService,
  type HassEntities,
  type Connection,
} from 'home-assistant-js-websocket'

// Connect to HA via the nginx proxy on the same host — avoids mixed content on HTTPS
const HA_URL   = window.location.origin
export const HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyMjRiMmI1YmQ5NmQ0NTY3OWQyNDliZGZkYTljZTYwZCIsImlhdCI6MTc3MzU2NjU1MywiZXhwIjoyMDg4OTI2NTUzfQ.IBhJbgzQF-sSaUERsoeQ06EZAEOM3OBCyt_ezhncZHg'

export interface ForecastEntry {
  datetime: string
  precipitation_probability?: number
  temperature?: number
  condition?: string
}

export function useHA() {
  const [entities,  setEntities]  = useState<HassEntities>({})
  const [connected, setConnected] = useState(false)
  const [forecast,  setForecast]  = useState<ForecastEntry[]>([])
  const connRef = useRef<Connection | null>(null)

  useEffect(() => {
    let cancelled = false
    const auth = createLongLivedTokenAuth(HA_URL, HA_TOKEN)
    createConnection({ auth }).then((conn) => {
      if (cancelled) { conn.close(); return }
      connRef.current = conn
      setConnected(true)
      subscribeEntities(conn, (ents) => setEntities({ ...ents }))
      // Fetch daily forecast for rain chance
      fetchForecast(conn)
    }).catch(console.error)
    return () => {
      cancelled = true
      connRef.current?.close()
    }
  }, [])

  const toggle = useCallback((entityId: string) => {
    if (!connRef.current) return
    const domain = entityId.split('.')[0]
    const service = domain === 'cover' ? 'toggle' : 'toggle'
    callService(connRef.current, domain, service, { entity_id: entityId })
  }, [])

  const setTemp = useCallback((entityId: string, temp: number) => {
    if (!connRef.current) return
    callService(connRef.current, 'climate', 'set_temperature', {
      entity_id: entityId,
      temperature: temp,
    })
  }, [])

  const mediaControl = useCallback((entityId: string, action: string) => {
    if (!connRef.current) return
    callService(connRef.current, 'media_player', action, { entity_id: entityId })
  }, [])

  const svcCall = useCallback((domain: string, service: string, data: object) => {
    if (!connRef.current) return
    callService(connRef.current, domain, service, data)
  }, [])

  const fetchForecast = useCallback((conn: Connection) => {
    conn.sendMessagePromise({
      type: 'call_service',
      domain: 'weather',
      service: 'get_forecasts',
      service_data: { entity_id: 'weather.forecast_home_2', type: 'daily' },
      return_response: true,
    }).then((resp: any) => {
      const entries = resp?.response?.['weather.forecast_home_2']?.forecast ?? []
      setForecast(entries)
    }).catch(() => {})
  }, [])

  return { entities, connected, forecast, toggle, setTemp, mediaControl, svcCall }
}

export type { HassEntities }
