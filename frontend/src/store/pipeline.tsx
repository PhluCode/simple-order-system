import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PlacedLine, StationId, StationState } from '@/lib/types'

/**
 * The state behind the rail across the top of the page (components/Pipeline).
 *
 * It is not a decoration — every station moves because something real
 * happened:
 *
 *   catalog  product-service answered, and which replica did (8100 / 8101)
 *   order    POST /orders returned 201 for each cart line
 *   kafka    order-service published to the `orders` topic. We cannot watch
 *            the topic from a browser, so this stays "in flight" until a
 *            notification appears, and fails if none does.
 *   notify   notification-service consumed the event and GET /notifications
 *            returned more rows than before the order was placed
 */

export interface Station {
  id: StationId
  label: string
  /** Used below the small breakpoint, where the full service name will not fit. */
  short: string
  state: StationState
  note: string
}

const BLANK: Station[] = [
  { id: 'catalog', label: 'product-service', short: 'menu', state: 'idle', note: '' },
  { id: 'order', label: 'order-service', short: 'order', state: 'idle', note: '' },
  { id: 'kafka', label: 'kafka · orders', short: 'kafka', state: 'idle', note: '' },
  { id: 'notify', label: 'notification-service', short: 'notify', state: 'idle', note: '' },
]

/** How long to wait for a notification before calling the consumer stalled. */
const CONSUMER_DEADLINE_MS = 15_000

interface PipelineValue {
  stations: Station[]
  running: boolean
  /** 0–1. Where the travelling dot sits along the rail. */
  progress: number
  noteCatalog: (ports: number[]) => void
  beginOrder: (lineCount: number, notificationBaseline: number) => void
  settleOrders: (results: PlacedLine[]) => void
  observeNotifications: (count: number) => void
  reset: () => void
}

const PipelineContext = createContext<PipelineValue | null>(null)

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<Station[]>(BLANK)
  const [running, setRunning] = useState(false)
  const baseline = useRef<number | null>(null)
  const expected = useRef(0)
  const deadline = useRef<number | null>(null)

  const patch = useCallback((id: StationId, next: Partial<Station>) => {
    setStations((current) => current.map((s) => (s.id === id ? { ...s, ...next } : s)))
  }, [])

  /** Called whenever the menu loads, so the first station reflects reality. */
  const noteCatalog = useCallback(
    (ports: number[]) => {
      const unique = [...new Set(ports.filter(Boolean))].sort()
      patch('catalog', {
        state: unique.length ? 'done' : 'idle',
        note: unique.length ? unique.map((p) => `:${p}`).join(' · ') : '',
      })
    },
    [patch],
  )

  const beginOrder = useCallback((lineCount: number, notificationBaseline: number) => {
    baseline.current = notificationBaseline
    expected.current = lineCount
    deadline.current = null
    setRunning(true)
    setStations((current) =>
      current.map((s) => {
        if (s.id === 'catalog') return { ...s, state: 'done' }
        if (s.id === 'order') {
          return { ...s, state: 'active', note: `${lineCount} ${lineCount === 1 ? 'line' : 'lines'}` }
        }
        return { ...s, state: 'idle', note: '' }
      }),
    )
  }, [])

  const settleOrders = useCallback(
    (results: PlacedLine[]) => {
      const ok = results.filter((r) => r.ok)
      const failed = results.length - ok.length

      patch('order', {
        state: failed > 0 ? (ok.length === 0 ? 'failed' : 'done') : 'done',
        note:
          failed > 0
            ? `${ok.length}/${results.length} written`
            : ok.map((r) => (r.orderId ? `#${r.orderId}` : '')).filter(Boolean).join(' ') ||
              `${ok.length} written`,
      })

      if (ok.length === 0) {
        patch('kafka', { state: 'failed', note: 'nothing published' })
        setRunning(false)
        return
      }

      expected.current = ok.length
      deadline.current = Date.now() + CONSUMER_DEADLINE_MS
      patch('kafka', { state: 'active', note: `${ok.length} sent` })
      patch('notify', { state: 'active', note: 'waiting' })
    },
    [patch],
  )

  /** The notification poll reports its row count here on every tick. */
  const observeNotifications = useCallback(
    (count: number) => {
      if (baseline.current == null) return
      const arrived = count - baseline.current
      if (arrived <= 0) return

      patch('kafka', { state: 'done', note: 'delivered' })
      patch('notify', {
        state: 'done',
        note: `+${arrived}`,
      })

      if (arrived >= expected.current) {
        baseline.current = null
        deadline.current = null
        setRunning(false)
      }
    },
    [patch],
  )

  const reset = useCallback(() => {
    baseline.current = null
    deadline.current = null
    expected.current = 0
    setRunning(false)
    setStations((current) =>
      current.map((s) => (s.id === 'catalog' ? { ...s, state: 'done' } : { ...s, state: 'idle', note: '' })),
    )
  }, [])

  // If nothing ever arrives, say so plainly instead of spinning forever.
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      if (deadline.current && Date.now() > deadline.current) {
        deadline.current = null
        baseline.current = null
        setRunning(false)
        patch('kafka', { state: 'failed', note: 'no consumer' })
        patch('notify', { state: 'failed', note: 'nothing after 15s' })
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, patch])

  /**
   * How far along the rail the message has travelled: the position of the
   * furthest station that has been reached, as a fraction of the whole rail.
   * One station done means zero distance covered — the message has not left
   * yet.
   */
  const progress = useMemo(() => {
    let settled = 0
    stations.forEach((station, index) => {
      if (station.state === 'done' || station.state === 'failed') settled = index
    })
    // Half a step further when the next service is working on it: the message
    // has left one station and not yet arrived at the next.
    const inFlight = stations[settled + 1]?.state === 'active' ? 0.5 : 0
    return (settled + inFlight) / Math.max(1, stations.length - 1)
  }, [stations])

  const value = useMemo<PipelineValue>(
    () => ({ stations, running, progress, noteCatalog, beginOrder, settleOrders, observeNotifications, reset }),
    [stations, running, progress, noteCatalog, beginOrder, settleOrders, observeNotifications, reset],
  )

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>
}

export function usePipeline(): PipelineValue {
  const value = useContext(PipelineContext)
  if (!value) throw new Error('usePipeline must be used inside <PipelineProvider>')
  return value
}
