import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '@/api/notifications'
import { usePipeline } from '@/store/pipeline'

/**
 * notification-service exposes no stream, so this polls — the same two-second
 * cadence its own dashboard at :8300 uses. Every tick reports the row count to
 * the pipeline, which is how the rail knows the Kafka event was consumed.
 */
export function useNotifications(pollMs = 2000) {
  const { observeNotifications } = usePipeline()

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: pollMs,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })

  const count = query.data?.length ?? 0

  useEffect(() => {
    if (query.isSuccess) observeNotifications(count)
  }, [count, query.isSuccess, observeNotifications])

  // Highest id seen so far, so the feed can flag rows that arrived just now.
  const highWater = useRef(0)
  const newestId = query.data?.[0]?.id ?? 0
  const isFresh = newestId > highWater.current
  useEffect(() => {
    if (newestId > highWater.current) {
      const timer = window.setTimeout(() => {
        highWater.current = newestId
      }, 4000)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [newestId])

  return { ...query, count, isFresh, seenUpTo: highWater.current }
}
