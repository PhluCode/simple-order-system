import { useQuery } from '@tanstack/react-query'
import { fetchOrders, fetchOrdersForUser } from '@/api/orders'
import { formatBahtShort } from '@/lib/format'
import { describeError } from '@/lib/http'
import { useSession } from '@/store/session'
import { EmptyState, ErrorState } from '@/components/ui/bits'

/**
 * `GET /orders`, or `GET /orders/user/{id}` once someone has signed in. Orders
 * carry no timestamp, so the ledger reads newest-id-first and says so.
 */
export function OrdersLedger() {
  const { user } = useSession()

  const orders = useQuery({
    queryKey: ['orders', user?.id ?? 'all'],
    queryFn: () => (user ? fetchOrdersForUser(user.id) : fetchOrders()),
    staleTime: 5_000,
  })

  const rows = [...(orders.data ?? [])].sort((a, b) => b.id - a.id).slice(0, 8)

  return (
    <section className="border-t border-line bg-paper/50">
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow">order-service · newest first</p>
            <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-none tracking-[-0.04em] text-ink">
              {user ? `${user.displayName ?? user.username}'s orders` : 'Orders on the counter'}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-moss">
            {user
              ? 'Read from GET /orders/user/{id}. Orders live on order-service keyed by userId, not inside user-service.'
              : 'Sign in from the top bar to narrow this to your own orders.'}
          </p>
        </div>

        <div className="mt-6">
          {orders.isError ? (
            <ErrorState message={describeError(orders.error)} onRetry={() => void orders.refetch()} />
          ) : null}

          {orders.isPending ? (
            <ul className="divide-y divide-line border-y border-line">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="py-4">
                  <div className="skeleton h-4 w-2/5" />
                </li>
              ))}
            </ul>
          ) : null}

          {!orders.isPending && !orders.isError && rows.length === 0 ? (
            <EmptyState title="No orders written yet">
              <p>The first one you place will appear here as soon as order-service saves it.</p>
            </EmptyState>
          ) : null}

          {rows.length > 0 ? (
            <ul className="divide-y divide-line border-y border-line">
              {rows.map((order) => (
                <li key={order.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                  <span data-value className="w-14 shrink-0 text-data text-moss">
                    #{order.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {(order.items ?? [])
                      .map((item) => `${item.quantity} × ${item.productName}`)
                      .join(', ') || 'No lines recorded'}
                  </span>
                  <span className="hidden font-mono text-micro uppercase tracking-[0.08em] text-moss sm:inline">
                    {order.customerName ?? 'guest'}
                  </span>
                  <span data-value className="w-20 shrink-0 text-right text-sm text-ink">
                    {formatBahtShort(order.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
