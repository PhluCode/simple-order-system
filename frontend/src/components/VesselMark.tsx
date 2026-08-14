import { vesselFor } from '@/lib/categories'
import type { ProductDTO } from '@/lib/types'

/**
 * The grid is a printed menu: line drawings only, no colour. Colour and
 * warmth are held back for the 3D viewer, so opening a product is the moment
 * the drink stops being a listing and becomes an object.
 *
 * The one coloured stroke is the liquid line, and it only turns cherry on
 * hover — the card telling you it is live.
 */
export function VesselMark({ product, className = '' }: { product: ProductDTO; className?: string }) {
  const vessel = vesselFor(product)
  const isCake = /cake|fudge/i.test(product.name)

  const stroke = 'stroke-ink'
  const liquid = 'stroke-moss transition-colors duration-300 group-hover:stroke-cherry'

  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden="true" fill="none" strokeWidth="1.25">
      {vessel === 'cup' ? (
        <g>
          <path d="M38 30h44l-4 34a14 14 0 0 1-14 12h-8a14 14 0 0 1-14-12z" className={stroke} />
          <path d="M82 38h7a10 10 0 0 1 0 20h-9" className={stroke} />
          <path d="M28 84h64" className={stroke} />
          <path d="M39.6 44h40.8" className={liquid} strokeWidth="2" />
          <path d="M52 14c0 5-5 5-5 10M62 10c0 6-6 6-6 12M72 15c0 4-4 4-4 9" className="stroke-line" />
        </g>
      ) : null}

      {vessel === 'glass' ? (
        <g>
          <path d="M43 14h34l-3 66a8 8 0 0 1-8 7h-12a8 8 0 0 1-8-7z" className={stroke} />
          <path d="M43.9 34h32.2" className={liquid} strokeWidth="2" />
          <path d="M67 8 58 40" className={stroke} />
          <rect x="48" y="44" width="11" height="11" rx="1" className="stroke-line" />
          <rect x="61" y="56" width="10" height="10" rx="1" className="stroke-line" />
          <rect x="50" y="66" width="9" height="9" rx="1" className="stroke-line" />
        </g>
      ) : null}

      {vessel === 'pastry' && !isCake ? (
        <g>
          <path d="M30 62c0-18 13-30 30-30s30 12 30 30" className={stroke} />
          <path d="M30 62c0 8 6 12 12 12s10-4 10-9M90 62c0 8-6 12-12 12s-10-4-10-9" className={stroke} />
          <path d="M52 65c0 5 3 9 8 9s8-4 8-9" className={stroke} />
          <path d="M46 46c5-4 9-5 14-5s9 1 14 5" className={liquid} strokeWidth="2" />
          <path d="M24 84h72" className="stroke-line" />
        </g>
      ) : null}

      {vessel === 'pastry' && isCake ? (
        <g>
          <path d="M40 34h40v42H40z" className={stroke} />
          <path d="M40 34 60 22l20 12" className={stroke} />
          <path d="M40 48h40M40 62h40" className="stroke-line" />
          <path d="M40 41h40" className={liquid} strokeWidth="2" />
          <path d="M28 84h64" className="stroke-line" />
        </g>
      ) : null}
    </svg>
  )
}
