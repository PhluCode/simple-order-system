import { useEffect, useState } from 'react'
import { Check, CircleAlert, Send } from 'lucide-react'
import { formatBahtShort } from '@/lib/format'
import { useUsers } from '@/hooks/useUsers'
import { usePlaceOrder } from '@/hooks/usePlaceOrder'
import { useCart } from '@/store/cart'
import { useSession } from '@/store/session'
import { Overlay } from '@/components/ui/Overlay'
import { Field, SelectField } from '@/components/ui/bits'

/**
 * Checkout is where the fan-out happens. One cart line becomes one
 * `POST /orders`, because that is the only shape order-service accepts, and
 * each call is reported back on its own row — a partial success is a real
 * outcome and hiding it would be a lie.
 */
export function CheckoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, total, clear } = useCart()
  const { user, customerName, setCustomerName, signIn } = useSession()
  const users = useUsers()
  const { submit, isPlacing, results, clearResults } = usePlaceOrder()
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      clearResults()
      setTouched(false)
    }
  }, [open, clearResults])

  const nameMissing = customerName.trim().length === 0
  const succeeded = results?.filter((r) => r.ok).length ?? 0
  const failed = results ? results.length - succeeded : 0

  async function place() {
    setTouched(true)
    if (nameMissing) return
    const placed = await submit({ lines, customerName: customerName.trim(), userId: user?.id ?? null })
    if (placed.every((line) => line.ok)) clear()
  }

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={results ? 'Order sent' : 'Checkout'}
      footer={
        results ? (
          <button type="button" className="btn btn-secondary w-full" onClick={onClose}>
            Back to the menu
          </button>
        ) : (
          <button type="button" className="btn btn-primary w-full" onClick={place} disabled={isPlacing || lines.length === 0}>
            <Send size={15} strokeWidth={1.8} />
            {isPlacing
              ? `Placing ${lines.length}…`
              : `Place ${lines.length} ${lines.length === 1 ? 'order' : 'orders'} · ${formatBahtShort(total)}`}
          </button>
        )
      }
    >
      {results ? (
        <div className="space-y-5 p-5">
          <p className="text-sm leading-relaxed text-moss">
            {failed === 0
              ? 'Every line was written and published to the orders topic. Watch the rail at the top of the page — the last station lights up when notification-service consumes the event.'
              : `${succeeded} of ${results.length} lines were written. The rest are still in your cart so you can try them again.`}
          </p>

          <ul className="divide-y divide-line border-y border-line">
            {results.map((line, index) => (
              <li key={`${line.productName}-${index}`} className="flex items-start gap-3 py-3">
                {line.ok ? (
                  <Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-ink" />
                ) : (
                  <CircleAlert size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-cherry" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span data-value>{line.quantity}</span> × {line.productName}
                  </p>
                  <p className={`mt-0.5 font-mono text-micro ${line.ok ? 'text-moss' : 'text-cherry'}`}>
                    {line.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-6 p-5">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li key={line.product.id} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-sm text-ink">
                  <span data-value>{line.quantity}</span> × {line.product.name}
                </span>
                <span data-value className="text-sm text-ink">
                  {formatBahtShort(line.product.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <Field
              label="Name for the order"
              value={customerName}
              onChange={setCustomerName}
              placeholder="Who is picking this up?"
              hint="notification-service reads this name, so it is what shows up on the counter feed."
            />
            {touched && nameMissing ? (
              <p role="alert" className="font-mono text-micro text-cherry">
                Add a name before placing the order.
              </p>
            ) : null}

            <SelectField
              label="Account"
              value={user?.id != null ? String(user.id) : ''}
              onChange={(next) => {
                const picked = users.data?.find((u) => u.id === Number(next))
                if (picked) signIn(picked)
              }}
              hint={
                <>
                  Stored on the order as userId, which is how{' '}
                  <span className="font-mono">GET /orders/user/{'{id}'}</span> finds it later.
                </>
              }
            >
              <option value="">No account — guest order</option>
              {(users.data ?? []).map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.displayName ?? candidate.username} (#{candidate.id})
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      )}
    </Overlay>
  )
}
