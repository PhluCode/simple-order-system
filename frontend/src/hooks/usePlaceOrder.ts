import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { placeOrder } from '@/api/orders'
import { describeError } from '@/lib/http'
import { usePipeline } from '@/store/pipeline'
import type { CartLine, PlacedLine } from '@/lib/types'

/**
 * `POST /orders` accepts one product per call, so a cart of three drinks is
 * three requests. They run one after another rather than in parallel: each one
 * publishes to Kafka, and keeping them sequential means the notification feed
 * reads in the same order the person built their cart.
 *
 * Every line is reported back, successes and failures together — a partial
 * order is a real outcome here and the checkout has to be able to show it.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient()
  const { beginOrder, settleOrders } = usePipeline()
  const [isPlacing, setIsPlacing] = useState(false)
  const [results, setResults] = useState<PlacedLine[] | null>(null)

  const submit = useCallback(
    async (input: { lines: CartLine[]; customerName: string; userId: number | null }) => {
      const { lines, customerName, userId } = input
      if (lines.length === 0) return []

      // Row count before we start, so the rail can tell new notifications from
      // ones that were already there.
      const existing = queryClient.getQueryData<unknown[]>(['notifications'])
      beginOrder(lines.length, existing?.length ?? 0)

      setIsPlacing(true)
      setResults(null)

      const placed: PlacedLine[] = []
      for (const line of lines) {
        try {
          const { text, orderId } = await placeOrder({
            customerName,
            userId,
            productId: line.product.id,
            quantity: line.quantity,
          })
          placed.push({
            productName: line.product.name,
            quantity: line.quantity,
            ok: true,
            message: text,
            orderId,
          })
        } catch (error) {
          placed.push({
            productName: line.product.name,
            quantity: line.quantity,
            ok: false,
            message: describeError(error),
            orderId: null,
          })
        }
      }

      setResults(placed)
      setIsPlacing(false)
      settleOrders(placed)

      // Stock moved and the order list grew.
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })

      return placed
    },
    [queryClient, beginOrder, settleOrders],
  )

  const clearResults = useCallback(() => setResults(null), [])

  return { submit, isPlacing, results, clearResults }
}
