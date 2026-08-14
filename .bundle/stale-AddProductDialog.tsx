import { useEffect, useMemo, useState } from 'react'
import { Check, PackagePlus } from 'lucide-react'
import { describeError } from '@/lib/http'
import { vesselFor } from '@/lib/categories'
import { formatBaht } from '@/lib/format'
import { useCreateProduct } from '@/hooks/useCatalog'
import { Overlay } from '@/components/ui/Overlay'
import { ErrorState, Field, PortTag, SelectField } from '@/components/ui/bits'
import { VesselMark } from '@/components/VesselMark'
import type { CategoryView, ProductDTO } from '@/lib/types'

/**
 * `POST /products` — the admin side of the counter.
 *
 * The form only sends what ProductController will read: name, price, stock and
 * categoryId. It deliberately does not send an id; ProductMapper copies
 * `dto.id` straight onto the entity, so supplying one turns the insert into an
 * update of a row that is not there.
 *
 * The category list comes from the menu that is already loaded, because the
 * backend has no `GET /categories` to ask.
 */

/** Explains, in words, how the new product will be drawn on the menu. */
function describeVessel(draft: Pick<ProductDTO, 'name' | 'categoryName'>): string {
  if (!draft.name.trim()) return 'Name it and the menu drawing appears here.'
  switch (vesselFor(draft)) {
    case 'glass':
      return 'Drawn as a tall glass with ice.'
    case 'pastry':
      return /cake|fudge/i.test(draft.name) ? 'Drawn as a cake slice.' : 'Drawn as a croissant.'
    default:
      return 'Drawn as a ceramic cup.'
  }
}

export function AddProductDialog({
  open,
  onClose,
  categories,
}: {
  open: boolean
  onClose: () => void
  categories: CategoryView[]
}) {
  const create = useCreateProduct()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [touched, setTouched] = useState(false)
  const [saved, setSaved] = useState<ProductDTO | null>(null)

  function reset() {
    setName('')
    setPrice('')
    setStock('')
    setCategoryId(categories[0] ? String(categories[0].id) : '')
    setTouched(false)
    setSaved(null)
    create.reset()
  }

  // Fresh form each time it opens, defaulted to the first category so the
  // common case is one field less.
  useEffect(() => {
    if (open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const priceValue = Number(price)
  const stockValue = Number(stock)

  const problems = useMemo(
    () => ({
      name: name.trim().length === 0,
      price: price.trim().length === 0 || !Number.isFinite(priceValue) || priceValue <= 0,
      stock: stock.trim().length === 0 || !Number.isInteger(stockValue) || stockValue < 0,
    }),
    [name, price, stock, priceValue, stockValue],
  )
  const invalid = problems.name || problems.price || problems.stock

  const chosen = categories.find((c) => String(c.id) === categoryId)
  const draft = { name, categoryName: chosen?.name ?? null }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (invalid) return
    try {
      setSaved(
        await create.mutateAsync({
          name: name.trim(),
          price: priceValue,
          stock: stockValue,
          categoryId: categoryId ? Number(categoryId) : null,
        }),
      )
    } catch {
      // create.error carries it; the form stays filled so nothing is retyped.
    }
  }

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={saved ? 'On the menu' : 'New product'}
      footer={
        saved ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-quiet" onClick={reset}>
              Add another
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <button
            type="submit"
            form="new-product"
            className="btn btn-primary w-full"
            disabled={create.isPending}
          >
            <PackagePlus size={15} strokeWidth={1.8} />
            {create.isPending ? 'Saving…' : 'Add to the menu'}
          </button>
        )
      }
    >
      {saved ? (
        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <Check size={16} strokeWidth={2} className="mt-1 shrink-0 text-ink" />
            <p className="text-sm leading-relaxed text-ink">
              <span className="font-display font-bold">{saved.name}</span> is on the menu.
            </p>
          </div>

          <dl className="divide-y divide-line border-y border-line">
            <Row label="Product id">
              <span data-value className="text-sm text-ink">
                #{saved.id}
              </span>
            </Row>
            <Row label="Price">
              <span data-value className="text-sm text-ink">
                {formatBaht(saved.price)}
              </span>
            </Row>
            <Row label="Stock">
              <span data-value className="text-sm text-ink">
                {saved.stock}
              </span>
            </Row>
            <Row label="Category">
              <span className="text-sm text-ink">{saved.categoryName ?? 'Uncategorised'}</span>
            </Row>
            <Row label="Written by">
              <span className="flex items-center gap-2">
                <PortTag port={saved.servedByPort} className="!text-data !text-ink" />
                <span className="text-micro uppercase tracking-[0.08em] text-moss">product-service</span>
              </span>
            </Row>
          </dl>

          <p className="text-sm leading-relaxed text-moss">
            Both replicas share one database, so it is on the menu whichever copy answers next.
          </p>
        </div>
      ) : (
        <form id="new-product" onSubmit={submit} className="space-y-5 p-5" noValidate>
          <Field
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Iced Yuzu Americano"
            invalid={touched && problems.name}
            hint="The name decides the drawing — anything starting with “Iced” is served in a glass."
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Price"
              type="number"
              min={1}
              step={1}
              suffix="฿"
              value={price}
              onChange={setPrice}
              placeholder="65"
              invalid={touched && problems.price}
            />
            <Field
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={stock}
              onChange={setStock}
              placeholder="40"
              invalid={touched && problems.stock}
            />
          </div>

          <SelectField
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            hint="Taken from the menu that is already loaded, since product-service has no /categories endpoint."
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>

          {touched && invalid ? (
            <p role="alert" className="font-mono text-micro text-cherry">
              {problems.name
                ? 'Give it a name.'
                : problems.price
                  ? 'Price has to be a number above zero.'
                  : 'Stock has to be a whole number, zero or more.'}
            </p>
          ) : null}

          {create.isError ? <ErrorState compact message={describeError(create.error)} /> : null}

          {/* What the card will look like on the menu, updating as they type. */}
          <div className="flex items-center gap-4 border-t border-line pt-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center border border-line bg-mist">
              {name.trim() ? (
                <VesselMark
                  product={{
                    id: 0,
                    name,
                    price: priceValue || 0,
                    stock: stockValue || 0,
                    categoryId: chosen?.id ?? null,
                    categoryName: chosen?.name ?? null,
                    servedByPort: 0,
                  }}
                  className="h-14 w-auto"
                />
              ) : (
                <span aria-hidden="true" className="h-px w-8 bg-line" />
              )}
            </span>
            <div>
              <p className="eyebrow">Preview</p>
              <p className="mt-1 text-sm leading-relaxed text-moss">{describeVessel(draft)}</p>
            </div>
          </div>
        </form>
      )}
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
