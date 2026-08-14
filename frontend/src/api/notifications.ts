import { notificationApi, useMockData } from '@/lib/http'
import { mockNotifications } from '@/lib/mock'
import type { Notification } from '@/lib/types'

/**
 * `GET /notifications` — everything notification-service has consumed off the
 * Kafka `orders` topic. No timestamp is sent, so the feed is ordered by id
 * descending and treats "id greater than the last one I saw" as new.
 */
export async function fetchNotifications(): Promise<Notification[]> {
  if (useMockData) return mockNotifications
  const { data } = await notificationApi.get<Notification[]>('')
  return [...data].sort((a, b) => b.id - a.id)
}
