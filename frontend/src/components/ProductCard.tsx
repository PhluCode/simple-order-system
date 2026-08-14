import { Plus } from 'lucide-react'
import { formatBahtShort } from '@/lib/format'
import { PortTag, StockBar } from '@/components/ui/bits'
import { VesselMark } from '@/components/VesselMark'
import type { ProductDTO } from '@/lib/types'

/**
 * ProductDTO carries no description and no image — only a name, a price, a
 * stock count, a category, and the port of the replica that answered. So the
 * card is built from exactly that, and does not invent marketing copy the
 * shop never wrote.
 */
export function ProductCard({
  product,
  onInspect,
  onAdd,
}: {
  product: ProductDTO
  onInspect: () => void
  onAdd: () => void
}) {
  const soldOut = product.stock <= 0

  return (
    <article className="group surface relative flex flex-col transition-[transform,border-color] duration-300 ease-settle hover:-translate-y-0.5 hover:border-ink">
      <button
        type="button"
        onClick={onInspect}
        className="flex flex-col items-stretch px-4 pb-3 pt-4 text-left"
        aria-label={`Inspect ${product.name} in 3D`}
      >
        <VesselMark product={product} className="mx-auto h-24 w-auto" />

        <h3 className="mt-4 font-display text-[1.0625rem] font-bold leading-tight tracking-[-0.02em] text-ink">
          {product.name}
        </h3>

        <p className="eyebrow mt-1.5 normal-case tracking-[0.06em]">
          {product.categoryName ?? 'Uncategorised'}
        </p>
      </button>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <StockBar stock={product.stock} />
        <PortTag port={product.servedByPort} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        <span data-value className="text-[1.0625rem] leading-none text-ink">
          {formatBahtShort(product.price)}
        </span>
        <button
          type="button"
          className="btn btn-quiet btn-sm group-hover:border-ink"
          onClick={onAdd}
          disabled={soldOut}
        >
          <Plus size={13} strokeWidth={2} />
          {soldOut ? 'Sold out' : 'Add'}
        </button>
      </div>
    </article>
  )
}
