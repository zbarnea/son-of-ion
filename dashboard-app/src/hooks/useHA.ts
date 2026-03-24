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
const HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyMjRiMmI1YmQ5NmQ0NTY3OWQyNDliZGZkYTljZTYwZCIsImlhdCI6MTc3MzU2NjU1MywiZXhwIjoyMDg4OTI2NTUzfQ.IBhJbgzQF-sSaUERsoeQ06EZAEOM3OBCyt_ezhncZHg'

export function useHA() {
  const [entities, setEntities] = useState<HassEntities>({})
  const [connected, setConnected] = useState(false)
  const connRef = useRef<Connection | null>(null)

  useEffect(() => {
    let cancelled = false
    const auth = createLongLivedTokenAuth(HA_URL, HA_TOKEN)
    createConnection({ auth }).then((conn) => {
      if (cancelled) { conn.close(); return }
      connRef.current = conn
      setConnected(true)
      subscribeEntities(conn, (ents) => setEntities({ ...ents }))
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

  return { entities, connected, toggle, setTemp, mediaControl, svcCall }
}

export type { HassEntities }
