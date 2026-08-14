import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { SafeUser } from '@/lib/types'

/**
 * Who is ordering. order-service stores both a userId and a free-text
 * customerName on the Order, and notification-service only ever reads the
 * customerName — so both matter, and the checkout asks for both.
 *
 * Kept in memory only: there is no token to persist, and browser storage is
 * not available here.
 */
interface SessionValue {
  user: SafeUser | null
  /**
   * Whoever signed in said they were an ADMIN and user-service agreed. That is
   * the whole check: `POST /users/login` hands back a user object and no
   * token, so this only exists in this tab and the write endpoints on
   * product-service are open to anyone who can reach :8100. It decides what
   * the interface offers, not what the services allow.
   */
  isAdmin: boolean
  customerName: string
  signIn: (user: SafeUser) => void
  signOut: () => void
  setCustomerName: (name: string) => void
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [customerName, setCustomerName] = useState('')

  const signIn = useCallback((next: SafeUser) => {
    setUser(next)
    setCustomerName((current) => current || next.displayName || next.username)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setCustomerName('')
  }, [])

  const value = useMemo<SessionValue>(
    () => ({ user, isAdmin: user?.role === 'ADMIN', customerName, signIn, signOut, setCustomerName }),
    [user, customerName, signIn, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside <SessionProvider>')
  return value
}
