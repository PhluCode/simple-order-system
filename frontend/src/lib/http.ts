import axios, { AxiosError, type AxiosInstance } from 'axios'

/**
 * One axios instance per service. All four go through the Vite proxy at
 * `/api/*` (see vite.config.ts), so the browser stays same-origin and the
 * services need no CORS configuration during development.
 *
 * To point the built app at a gateway instead, set VITE_API_BASE and the
 * prefixes below hang off it.
 */
const base = import.meta.env.VITE_API_BASE ?? '/api'

function client(path: string): AxiosInstance {
  const instance = axios.create({
    baseURL: `${base}${path}`,
    timeout: 8000,
    headers: { Accept: 'application/json, text/plain, */*' },
  })
  return instance
}

export const productApi = client('/products')
export const orderApi = client('/orders')
export const notificationApi = client('/notifications')
export const userApi = client('/users')

/** True when the app has been told to skip the network entirely. */
export const useMockData = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Turns any failure into one sentence a person can act on. Errors do not
 * apologise and they say what to do next.
 */
export function describeError(error: unknown): string {
  const err = error as AxiosError
  if (!axios.isAxiosError(err)) {
    return 'Something failed before the request went out. Reload the page.'
  }
  if (err.code === 'ECONNABORTED') {
    return 'The service took more than 8 seconds to answer. It may still be starting up.'
  }
  if (!err.response) {
    return 'No answer from the service. Check that it is running and that Eureka lists it.'
  }
  const status = err.response.status
  const body = typeof err.response.data === 'string' ? err.response.data.trim() : ''
  if (status === 404) return body || 'That record no longer exists.'
  if (status === 401) return body || 'Wrong username or password.'
  if (status === 503) return body || 'The service could not reach product-service. Check both replicas.'
  if (status >= 500) return body || `The service returned ${status}. Check its console output.`
  return body || `The request was rejected with ${status}.`
}

/**
 * order-service answers `POST /orders` with a plain string, not JSON:
 *   "Order #7 placed"
 * Pull the id out so the interface can name the order it just created.
 */
export function parseOrderId(text: string): number | null {
  const match = /#(\d+)/.exec(text)
  return match ? Number(match[1]) : null
}
