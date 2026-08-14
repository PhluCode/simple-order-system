import { Trash2 } from 'lucide-react'
import { formatBahtShort } from '@/lib/format'
import { useCart } from '@/store/cart'
import { Overlay } from '@/components/ui/Overlay'
import { EmptyState, Stepper } from '@/components/ui/bits'

export function CartDrawer({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}) {
  const { lines, total, itemCount, setQuantity, remove } = useCart()

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="Your cart"
      placement="right"
      footer={
        lines.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              <span data-value className="text-xl text-ink">
                {formatBahtShort(total)}
              </span>
            </div>
            <button type="button" className="btn btn-primary w-full" onClick={onCheckout}>
              Checkout
            </button>
            <p className="text-center font-mono text-micro leading-relaxed text-moss">
              order-service takes one product per request, so this becomes{' '}
              <span data-value>{lines.length}</span> {lines.length === 1 ? 'order' : 'orders'}.
            </p>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="p-5">
          <EmptyState title="Nothing in the cart yet">
            <p>Pick something from the menu and it will show up here.</p>
          </EmptyState>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {lines.map((line) => (
            <li key={line.product.id} className="flex items-start gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[0.975rem] font-bold leading-tight tracking-[-0.02em] text-ink">
                  {line.product.name}
                </p>
                <p className="eyebrow mt-1 normal-case tracking-[0.06em]">
                  <span data-value>{formatBahtShort(line.product.price)}</span> each ·{' '}
                  {line.product.categoryName ?? 'Uncategorised'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Stepper
                    value={line.quantity}
                    max={Math.max(1, line.product.stock)}
                    onChange={(next) => setQuantity(line.product.id, next)}
                    label={line.product.name}
                  />
                  <button
                    type="button"
                    className="p-2 text-moss transition-colors hover:text-cherry"
                    onClick={() => remove(line.product.id)}
                    aria-label={`Remove ${line.product.name} from the cart`}
                  >
                    <Trash2 size={14} strokeWidth={1.7} />
                  </button>
                </div>
              </div>

              <span data-value className="shrink-0 pt-0.5 text-[0.975rem] text-ink">
                {formatBahtShort(line.product.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Overlay>
  )
}
