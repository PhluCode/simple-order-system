import { orderApi, parseOrderId, useMockData } from '@/lib/http'
import { mockOrders } from '@/lib/mock'
import type { Order, OrderRequest } from '@/lib/types'

/**
 * `POST /orders` takes ONE product, not a basket:
 *   { customerName, userId, productId, quantity }
 * and answers with plain text — "Order #7 placed" — at 201.
 *
 * A cart with three different drinks therefore becomes three calls. See
 * hooks/usePlaceOrder.ts, which runs them in order and reports each one.
 */
let mockOrderId = 0

export async function placeOrder(request: OrderRequest): Promise<{ text: string; orderId: number | null }> {
  if (useMockData) {
    mockOrderId += 1
    return { text: `Order #${mockOrderId} placed`, orderId: mockOrderId }
  }
  const { data } = await orderApi.post<string>('', request, { responseType: 'text' })
  const text = typeof data === 'string' ? data : String(data)
  return { text, orderId: parseOrderId(text) }
}

/** `GET /orders` — every order in the system. */
export async function fetchOrders(): Promise<Order[]> {
  if (useMockData) return mockOrders
  const { data } = await orderApi.get<Order[]>('')
  return data
}

/** `GET /orders/user/{userId}` — one person's history. */
export async function fetchOrdersForUser(userId: number): Promise<Order[]> {
  if (useMockData) return mockOrders.filter((o) => o.userId === userId)
  const { data } = await orderApi.get<Order[]>(`/user/${userId}`)
  return data
}

/** `GET /orders/{id}`. */
export async function fetchOrder(id: number): Promise<Order> {
  if (useMockData) {
    const found = mockOrders.find((o) => o.id === id)
    if (!found) throw new Error('No order with that id')
    return found
  }
  const { data } = await orderApi.get<Order>(`/${id}`)
  return data
}

/** `DELETE /orders/{id}` — 204 on success, 404 if it was already gone. */
export async function cancelOrder(id: number): Promise<void> {
  if (useMockData) return
  await orderApi.delete(`/${id}`)
}
