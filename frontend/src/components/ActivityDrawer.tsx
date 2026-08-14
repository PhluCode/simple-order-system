import { describeError } from '@/lib/http'
import type { Notification } from '@/lib/types'
import { Overlay } from '@/components/ui/Overlay'
import { EmptyState, ErrorState } from '@/components/ui/bits'

/**
 * Everything notification-service has consumed off the Kafka topic. There is
 * no timestamp on a Notification, so rows are ordered by id and the newest
 * arrivals are marked rather than dated.
 */
export function ActivityDrawer({
  open,
  onClose,
  notifications,
  isPending,
  error,
  onRetry,
  seenUpTo,
}: {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  isPending: boolean
  error: unknown
  onRetry: () => void
  seenUpTo: number
}) {
  return (
    <Overlay open={open} onClose={onClose} title="Order activity" placement="right">
      <div className="border-b border-line px-5 py-3">
        <p className="font-mono text-micro leading-relaxed text-moss">
          notification-service · polling every 2s ·{' '}
          <span data-value className="text-ink">
            {notifications.length}
          </span>{' '}
          consumed
        </p>
      </div>

      {error ? (
        <div className="p-5">
          <ErrorState message={describeError(error)} onRetry={onRetry} />
        </div>
      ) : null}

      {isPending ? (
        <ul className="divide-y divide-line">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="space-y-2 px-5 py-4">
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton h-4 w-4/5" />
            </li>
          ))}
        </ul>
      ) : null}

      {!isPending && !error && notifications.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No orders yet today">
            <p>
              Place one and it lands here within a couple of seconds, once notification-service has
              read the event off the <span className="font-mono">orders</span> topic.
            </p>
          </EmptyState>
        </div>
      ) : null}

      <ul className="divide-y divide-line">
        {notifications.map((item) => {
          const fresh = item.id > seenUpTo
          return (
            <li key={item.id} className={`px-5 py-4 transition-colors ${fresh ? 'bg-cherry/[0.05]' : ''}`}>
              <p className="flex items-center gap-2">
                <span className="eyebrow">{item.customerName ?? 'unknown'}</span>
                {fresh ? (
                  <span className="font-mono text-micro uppercase tracking-[0.1em] text-cherry">new</span>
                ) : null}
                <span data-value className="ml-auto text-micro text-moss">
                  #{item.id}
                </span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">{item.message}</p>
            </li>
          )
        })}
      </ul>
    </Overlay>
  )
}
