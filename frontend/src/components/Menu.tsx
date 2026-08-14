import { useState } from 'react'
import { PackagePlus, Search, X } from 'lucide-react'
import { describeError } from '@/lib/http'
import { useMenu, useProducts } from '@/hooks/useCatalog'
import { useSession } from '@/store/session'
import { CardSkeleton, EmptyState, ErrorState } from '@/components/ui/bits'
import { ProductCard } from '@/components/ProductCard'
import type { ProductDTO } from '@/lib/types'

interface MenuProps {
  onInspect: (product: ProductDTO) => void
  onAdd: (product: ProductDTO) => void
  onNewProduct: () => void
}

export function Menu({ onInspect, onAdd, onNewProduct }: MenuProps) {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const menu = useMenu()
  const products = useProducts(categoryId, search)
  const { isAdmin } = useSession()

  const list = products.data ?? []

  return (
    <section id="menu" className="mx-auto max-w-[100rem] scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-5">
        <div>
          <p className="eyebrow">the counter</p>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-none tracking-[-0.04em] text-ink">
            Today&rsquo;s menu
          </h2>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label className="relative flex flex-1 items-center sm:w-72 sm:flex-none">
            <Search size={15} strokeWidth={1.8} className="pointer-events-none absolute left-3 text-moss" />
            <span className="sr-only">Search the menu by name</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name"
              className="w-full border border-line bg-paper py-2.5 pl-9 pr-8 font-mono text-data text-ink placeholder:text-moss/70 focus:border-ink"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 p-1 text-moss hover:text-cherry"
                aria-label="Clear the search"
              >
                <X size={14} strokeWidth={2} />
              </button>
            ) : null}
          </label>

          {/* Only an ADMIN sees this. The word next to it says why it is here. */}
          {isAdmin ? (
            <span className="flex shrink-0 items-center gap-2">
              <span className="eyebrow hidden lg:inline">admin</span>
              <button type="button" className="btn btn-secondary" onClick={onNewProduct}>
                <PackagePlus size={15} strokeWidth={1.8} />
                <span className="hidden sm:inline">New product</span>
                <span className="sm:hidden">New</span>
              </button>
            </span>
          ) : null}
        </div>
      </div>

      {/* Category rail. Built from the menu itself, because product-service
          has no /categories endpoint to ask. */}
      <nav className="-mx-4 mt-5 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Filter by category">
        <FilterChip active={categoryId === null} onClick={() => setCategoryId(null)} count={menu.data?.length}>
          Everything
        </FilterChip>
        {menu.categories.map((category) => (
          <FilterChip
            key={category.id}
            active={categoryId === category.id}
            onClick={() => setCategoryId(category.id)}
            count={category.count}
          >
            {category.name}
          </FilterChip>
        ))}
      </nav>

      <div className="mt-8">
        {products.isError ? (
          <ErrorState message={describeError(products.error)} onRetry={() => void products.refetch()} />
        ) : null}

        {products.isPending ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {!products.isPending && !products.isError && list.length === 0 ? (
          <EmptyState title="Nothing matches that">
            <p>
              Clear the search or pick another category to see the rest of the menu.
              {search ? (
                <>
                  {' '}
                  <button type="button" className="underline underline-offset-4" onClick={() => setSearch('')}>
                    Clear &ldquo;{search}&rdquo;
                  </button>
                </>
              ) : null}
            </p>
          </EmptyState>
        ) : null}

        {list.length > 0 ? (
          <div
            className={`grid grid-cols-2 gap-4 transition-opacity lg:grid-cols-3 xl:grid-cols-4 ${
              products.isFetching ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {list.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onInspect={() => onInspect(product)}
                onAdd={() => onAdd(product)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-baseline gap-2 whitespace-nowrap border px-3.5 py-2 font-mono text-micro uppercase tracking-[0.08em] transition-colors ${
        active ? 'border-ink bg-ink text-mist' : 'border-line bg-paper text-moss hover:border-ink hover:text-ink'
      }`}
    >
      {children}
      {count != null ? (
        <span data-value className={`text-micro ${active ? 'text-mist/70' : 'text-moss/70'}`}>
          {count}
        </span>
      ) : null}
    </button>
  )
}
