import { useEffect, useState } from 'react'
import { Move3d, ShoppingBag, SquarePen } from 'lucide-react'
import { formatBaht } from '@/lib/format'
import { describeError } from '@/lib/http'
import { useProduct } from '@/hooks/useCatalog'
import { useSession } from '@/store/session'
import { ProductViewer } from '@/three/Vessel'
import { Overlay } from '@/components/ui/Overlay'
import { ErrorState, PortTag, Stepper } from '@/components/ui/bits'
import type { ProductDTO } from '@/lib/types'

/**
 * The grid is line art; this is where the drink turns into an object you can
 * pick up and turn over. Stock is refetched on open so what it says is what
 * product-service currently holds.
 */
export function ProductDialog({
  product,
  open,
  onClose,
  onAdd,
  onEdit,
}: {
  product: ProductDTO | null
  open: boolean
  onClose: () => void
  onAdd: (product: ProductDTO, quantity: number) => void
  onEdit: (product: ProductDTO) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const live = useProduct(open && product ? product.id : null)
  const { isAdmin } = useSession()
  const current = live.data ?? product

  useEffect(() => {
    if (open) setQuantity(1)
  }, [open, product?.id])

  if (!current) return null

  const soldOut = current.stock <= 0

  return (
    <Overlay open={open} onClose={onClose} title={current.name} wide>
      <div className="grid gap-0 md:grid-cols-2">
        <div className="relative border-b border-line bg-mist md:border-b-0 md:border-r">
          <ProductViewer product={current} className="h-64 w-full sm:h-80 md:h-[26rem]" />
          <p className="pointer-events-none absolute left-4 top-3 flex items-center gap-1.5 text-moss">
            <Move3d size={13} strokeWidth={1.7} />
            <span className="font-mono text-micro uppercase tracking-[0.1em]">Drag to turn · scroll to zoom</span>
          </p>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {live.isError ? (
            <ErrorState compact message={describeError(live.error)} onRetry={() => void live.refetch()} />
          ) : null}

          <dl className="divide-y divide-line border-y border-line">
            <Row label="Price">
              <span data-value className="text-base text-ink">
                {formatBaht(current.price)}
              </span>
            </Row>
            <Row label="Category">
              <span className="text-sm text-ink">{current.categoryName ?? 'Uncategorised'}</span>
            </Row>
            <Row label="In stock">
              <span data-value className={`text-sm ${soldOut ? 'text-cherry' : 'text-ink'}`}>
                {current.stock}
              </span>
            </Row>
            <Row label="Answered by">
              <span className="flex items-center gap-2">
                <PortTag port={current.servedByPort} className="!text-data !text-ink" />
                <span className="text-micro uppercase tracking-[0.08em] text-moss">product-service</span>
              </span>
            </Row>
          </dl>

          <p className="text-sm leading-relaxed text-moss">
            Two copies of product-service run behind Eureka. The port above is the one that answered
            this request — reopen this panel and it may change.
          </p>

          {isAdmin ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 self-start font-mono text-micro uppercase tracking-[0.08em] text-moss underline-offset-4 transition-colors hover:text-cherry hover:underline"
              onClick={() => onEdit(current)}
            >
              <SquarePen size={13} strokeWidth={1.8} />
              Edit this product
            </button>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <Stepper
              value={quantity}
              min={1}
              max={Math.max(1, current.stock)}
              onChange={setQuantity}
              label={current.name}
            />
            <button
              type="button"
              className="btn btn-primary flex-1"
              disabled={soldOut}
              onClick={() => {
                onAdd(current, quantity)
                onClose()
              }}
            >
              <ShoppingBag size={15} strokeWidth={1.8} />
              {soldOut ? 'Sold out' : `Add ${quantity} to cart`}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="eyebrow">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
