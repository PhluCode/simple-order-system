import { useCallback, useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useCart } from '@/store/cart'
import { TopBar } from '@/components/TopBar'
import { Pipeline } from '@/components/Pipeline'
import { Hero } from '@/components/Hero'
import { Menu } from '@/components/Menu'
import { OrdersLedger } from '@/components/OrdersLedger'
import { Footer } from '@/components/Footer'
import { ProductDialog } from '@/components/ProductDialog'
import { ProductFormDialog } from '@/components/ProductFormDialog'
import { CartDrawer } from '@/components/CartDrawer'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { ActivityDrawer } from '@/components/ActivityDrawer'
import { AccountDialog } from '@/components/AccountDialog'
import type { ProductDTO } from '@/lib/types'

type Panel = 'none' | 'cart' | 'checkout' | 'activity' | 'account' | 'product' | 'product-form'

export default function App() {
  const [panel, setPanel] = useState<Panel>('none')
  const [inspected, setInspected] = useState<ProductDTO | null>(null)
  /** null means the form is creating; a product means it is editing that one. */
  const [editing, setEditing] = useState<ProductDTO | null>(null)
  const cart = useCart()
  const notifications = useNotifications()

  const close = useCallback(() => setPanel('none'), [])

  const inspect = useCallback((product: ProductDTO) => {
    setInspected(product)
    setPanel('product')
  }, [])

  const editProduct = useCallback((product: ProductDTO | null) => {
    setEditing(product)
    setPanel('product-form')
  }, [])

  const addAndOpenCart = useCallback(
    (product: ProductDTO, quantity = 1) => {
      cart.add(product, quantity)
      setPanel('cart')
    },
    [cart],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:font-mono focus:text-micro"
      >
        Skip to the menu
      </a>

      {/* Bar and rail travel together: the rail is only useful if it is still
          on screen when the order you placed reaches the last station. */}
      <div className="sticky top-0 z-40">
        <TopBar
          notificationCount={notifications.count}
          hasFreshNotification={notifications.isFresh}
          onOpenCart={() => setPanel('cart')}
          onOpenActivity={() => setPanel('activity')}
          onOpenAccount={() => setPanel('account')}
        />
        <Pipeline />
      </div>

      <main className="flex-1">
        <Hero onOpenActivity={() => setPanel('activity')} />
        <Menu
          onInspect={inspect}
          onAdd={(product) => addAndOpenCart(product, 1)}
          onNewProduct={() => editProduct(null)}
        />
        <OrdersLedger />
      </main>

      <Footer />

      <ProductDialog
        product={inspected}
        open={panel === 'product'}
        onClose={close}
        onAdd={addAndOpenCart}
        onEdit={editProduct}
      />
      <ProductFormDialog open={panel === 'product-form'} product={editing} onClose={close} />
      <CartDrawer open={panel === 'cart'} onClose={close} onCheckout={() => setPanel('checkout')} />
      <CheckoutDialog open={panel === 'checkout'} onClose={close} />
      <ActivityDrawer
        open={panel === 'activity'}
        onClose={close}
        notifications={notifications.data ?? []}
        isPending={notifications.isPending}
        error={notifications.isError ? notifications.error : null}
        onRetry={() => void notifications.refetch()}
        seenUpTo={notifications.seenUpTo}
      />
      <AccountDialog open={panel === 'account'} onClose={close} />
    </div>
  )
}
