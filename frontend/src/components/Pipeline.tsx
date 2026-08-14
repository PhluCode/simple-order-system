import { usePipeline } from '@/store/pipeline'
import type { Station } from '@/store/pipeline'

/**
 * The signature of this build.
 *
 * Four Spring Boot services stand between tapping "Place order" and a
 * notification appearing, and normally you only find that out by reading
 * console logs. This rail puts the journey on the page: squares are the fixed
 * services, the circle is the message moving between them, and every state
 * change is caused by a real response — not a timer pretending to be one.
 *
 * See store/pipeline.tsx for what moves each station.
 */

const MARKER_INSET = 12.5 // half of one of the four columns, as a percentage
const SPAN = 100 - MARKER_INSET * 2

function markerClass(state: Station['state']): string {
  switch (state) {
    case 'done':
      return 'bg-ink border-ink'
    case 'active':
      return 'bg-paper border-cherry'
    case 'failed':
      return 'bg-cherry border-cherry'
    default:
      return 'bg-mist border-line'
  }
}

function describe(stations: Station[]): string {
  const active = stations.find((s) => s.state === 'active')
  if (active) return `${active.label}: in progress`
  const failed = stations.find((s) => s.state === 'failed')
  if (failed) return `${failed.label}: ${failed.note}`
  const done = stations.filter((s) => s.state === 'done')
  if (done.length === stations.length) return 'Order delivered through all four services'
  return 'Idle'
}

export function Pipeline() {
  const { stations, progress, running } = usePipeline()
  const travelled = MARKER_INSET + progress * SPAN

  return (
    <div className="border-b border-line bg-mist/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[100rem] px-4 py-3 sm:px-8">
        <div className="relative">
          {/* the rail */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[4px] h-px bg-line"
            style={{ left: `${MARKER_INSET}%`, right: `${MARKER_INSET}%` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[4px] h-px bg-cherry transition-[width] duration-700 ease-settle"
            style={{ left: `${MARKER_INSET}%`, width: `${progress * SPAN}%` }}
          />
          {/* the message in flight */}
          {running ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[1px] -ml-[3.5px] block h-[7px] w-[7px] rounded-full bg-cherry transition-[left] duration-700 ease-settle"
              style={{ left: `${travelled}%` }}
            >
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-cherry" />
            </span>
          ) : null}

          <ol className="grid grid-cols-4">
            {stations.map((station) => (
              <li key={station.id} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  aria-hidden="true"
                  className={`relative z-10 block h-[9px] w-[9px] border transition-colors duration-300 ${markerClass(
                    station.state,
                  )}`}
                />
                <span
                  className={`font-mono text-micro uppercase tracking-[0.1em] transition-colors ${
                    station.state === 'idle' ? 'text-moss/60' : 'text-ink'
                  }`}
                >
                  <span className="hidden sm:inline">{station.label}</span>
                  <span className="sm:hidden">{station.short}</span>
                </span>
                <span
                  data-value
                  className={`max-w-full truncate text-micro leading-none transition-opacity ${
                    station.state === 'failed' ? 'text-cherry' : 'text-moss'
                  } ${station.note ? 'opacity-100' : 'opacity-0'}`}
                >
                  {station.note || '—'}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {describe(stations)}
      </p>
    </div>
  )
}
