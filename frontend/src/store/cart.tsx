import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { CartLine, ProductDTO } from '@/lib/types'

type Action =
  | { type: 'add'; product: ProductDTO; quantity: number }
  | { type: 'setQuantity'; productId: number; quantity: number }
  | { type: 'remove'; productId: number }
  | { type: 'refresh'; product: ProductDTO }
  | { type: 'clear' }

function reducer(lines: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = lines.find((l) => l.product.id === action.product.id)
      if (!existing) {
        return [...lines, { product: action.product, quantity: clamp(action.quantity, action.product.stock) }]
      }
      return lines.map((l) =>
        l.product.id === action.product.id
          ? { ...l, quantity: clamp(l.quantity + action.quantity, l.product.stock) }
          : l,
      )
    }
    case 'setQuantity': {
      if (action.quantity <= 0) return lines.filter((l) => l.product.id !== action.productId)
      return lines.map((l) =>
        l.product.id === action.productId ? { ...l, quantity: clamp(action.quantity, l.product.stock) } : l,
      )
    }
    case 'remove':
      return lines.filter((l) => l.product.id !== action.productId)
    case 'refresh':
      // An admin changed this product while it sat in someone's cart. Take the
      // new price and name, and pull the quantity back if stock dropped below it.
      return lines.map((l) =>
        l.product.id === action.product.id
          ? { product: action.product, quantity: clamp(l.quantity, action.product.stock) }
          : l,
      )
    case 'clear':
      return []
  }
}

/** Never let someone order more than product-service says is in stock. */
function clamp(quantity: number, stock: number): number {
  const ceiling = stock > 0 ? stock : 1
  return Math.max(1, Math.min(quantity, ceiling))
}

interface CartValue {
  lines: CartLine[]
  itemCount: number
  total: number
  add: (product: ProductDTO, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  /** Replace a line's snapshot after the product itself changed. */
  refresh: (product: ProductDTO) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, [])

  const add = useCallback((product: ProductDTO, quantity = 1) => {
    dispatch({ type: 'add', product, quantity })
  }, [])
  const setQuantity = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'setQuantity', productId, quantity })
  }, [])
  const remove = useCallback((productId: number) => {
    dispatch({ type: 'remove', productId })
  }, [])
  const refresh = useCallback((product: ProductDTO) => {
    dispatch({ type: 'refresh', product })
  }, [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartValue>(() => {
    return {
      lines,
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      total: lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0),
      add,
      setQuantity,
      remove,
      refresh,
      clear,
    }
  }, [lines, add, setQuantity, remove, refresh, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}
