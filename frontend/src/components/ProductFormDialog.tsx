import { useEffect, useMemo, useState } from 'react'
import { Check, PackagePlus, Save, Trash2 } from 'lucide-react'
import { describeError } from '@/lib/http'
import { vesselFor } from '@/lib/categories'
import { formatBaht } from '@/lib/format'
import { useCategories, useCreateProduct, useDeleteProduct, useUpdateProduct } from '@/hooks/useCatalog'
import { useCart } from '@/store/cart'
import { Overlay } from '@/components/ui/Overlay'
import { ErrorState, Field, PortTag, SelectField } from '@/components/ui/bits'
import { VesselMark } from '@/components/VesselMark'
import type { NewProduct, ProductDTO, ProductPatch } from '@/lib/types'

/**
 * The admin side of the counter: create, edit and remove a product.
 *
 * All four of ProductController's write endpoints are reachable from here, and
 * the form says which one it is about to call. That is not showing off — the
 * choice between PATCH and PUT is forced by a real quirk of the service, and
 * hiding it would mean silently failing to save a price of zero.
 *
 *   POST   /products        new product
 *   PATCH  /products/{id}   only the fields that changed, when that is safe
 *   PUT    /products/{id}   full replace, when PATCH would not survive it
 *   DELETE /products/{id}   behind a confirmation
 */

type Panel = 'form' | 'saved' | 'confirm-delete' | 'deleted'

/** Which request the current draft will produce, and why. */
interface Plan {
  verb: 'POST' | 'PUT' | 'PATCH'
  path: string
  fields: string[]
  /** Set when PATCH was ruled out — explains what would have gone wrong. */
  note: string | null
}

function planFor(product: ProductDTO | null, draft: NewProduct): Plan | null {
  if (!product) {
    return { verb: 'POST', path: '/products', fields: [], note: null }
  }

  const changed: (keyof NewProduct)[] = []
  if (draft.name !== product.name) changed.push('name')
  if (draft.price !== product.price) changed.push('price')
  if (draft.stock !== product.stock) changed.push('stock')
  if (draft.categoryId !== product.categoryId) changed.push('categoryId')

  if (changed.length === 0) return null

  // The three edits PATCH cannot express, because the service reads a missing
  // field and a zero-valued one as the same thing. See lib/types.ts.
  let note: string | null = null
  if (changed.includes('price') && draft.price === 0) {
    note = 'PATCH reads a price of 0 as a field you left out, so this replaces the whole row.'
  } else if (changed.includes('stock') && draft.stock === 0) {
    note = 'PATCH reads a stock of 0 as a field you left out, so this replaces the whole row.'
  } else if (changed.includes('categoryId') && draft.categoryId === null) {
    note = 'PATCH ignores a null category, so clearing one needs a full replace.'
  }

  return note
    ? { verb: 'PUT', path: `/products/${product.id}`, fields: ['full replace'], note }
    : { verb: 'PATCH', path: `/products/${product.id}`, fields: changed, note: null }
}

/** Explains, in words, how the product will be drawn on the menu. */
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

export function ProductFormDialog({
  open,
  onClose,
  product,
}: {
  open: boolean
  onClose: () => void
  /** null to create, a product to edit it. */
  product: ProductDTO | null
}) {
  const categories = useCategories()
  const cart = useCart()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const remove = useDeleteProduct()

  const [panel, setPanel] = useState<Panel>('form')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [touched, setTouched] = useState(false)
  const [saved, setSaved] = useState<ProductDTO | null>(null)
  const [removedMessage, setRemovedMessage] = useState('')

  const isEdit = product != null

  function fill(from: ProductDTO | null) {
    setName(from?.name ?? '')
    setPrice(from ? String(from.price) : '')
    setStock(from ? String(from.stock) : '')
    setCategoryId(
      from?.categoryId != null
        ? String(from.categoryId)
        : from
          ? ''
          : (categories[0]?.id != null ? String(categories[0].id) : ''),
    )
    setTouched(false)
    setSaved(null)
    setRemovedMessage('')
    setPanel('form')
    create.reset()
    update.reset()
    remove.reset()
  }

  // Fresh state whenever it opens, or when it is pointed at a different product.
  useEffect(() => {
    if (open) fill(product)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id])

  const priceValue = Number(price)
  const stockValue = Number(stock)

  const problems = useMemo(
    () => ({
      name: name.trim().length === 0,
      price: price.trim().length === 0 || !Number.isFinite(priceValue) || priceValue < 0,
      stock: stock.trim().length === 0 || !Number.isInteger(stockValue) || stockValue < 0,
    }),
    [name, price, stock, priceValue, stockValue],
  )
  const invalid = problems.name || problems.price || problems.stock

  const chosen = categories.find((c) => String(c.id) === categoryId)
  const draft: NewProduct = {
    name: name.trim(),
    price: priceValue,
    stock: stockValue,
    categoryId: categoryId ? Number(categoryId) : null,
  }
  const plan = invalid ? null : planFor(product, draft)
  const busy = create.isPending || update.isPending
  const failure = create.error ?? update.error ?? remove.error

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (invalid || !plan) return

    try {
      if (plan.verb === 'POST') {
        setSaved(await create.mutateAsync(draft))
      } else if (plan.verb === 'PUT') {
        const next = await update.mutateAsync({ id: product!.id, verb: 'PUT', body: draft })
        setSaved(next)
        cart.refresh(next)
      } else {
        const patch: ProductPatch = {}
        if (plan.fields.includes('name')) patch.name = draft.name
        if (plan.fields.includes('price')) patch.price = draft.price
        if (plan.fields.includes('stock')) patch.stock = draft.stock
        if (plan.fields.includes('categoryId')) patch.categoryId = draft.categoryId
        const next = await update.mutateAsync({ id: product!.id, verb: 'PATCH', body: patch })
        setSaved(next)
        cart.refresh(next)
      }
      setPanel('saved')
    } catch {
      // The mutation holds the error; the form keeps its values so nothing is
      // retyped.
    }
  }

  async function confirmDelete() {
    if (!product) return
    try {
      setRemovedMessage(await remove.mutateAsync(product.id))
      // Whoever had it in their cart cannot order it now.
      cart.remove(product.id)
      setPanel('deleted')
    } catch {
      // remove.error is shown on the confirmation panel.
    }
  }

  const title =
    panel === 'confirm-delete'
      ? 'Remove from the menu'
      : panel === 'deleted'
        ? 'Removed'
        : panel === 'saved'
          ? isEdit
            ? 'Saved'
            : 'On the menu'
          : isEdit
            ? 'Edit product'
            : 'New product'

  return (
    <Overlay open={open} onClose={onClose} title={title} footer={footer()}>
      {panel === 'form' ? formPanel() : null}
      {panel === 'saved' ? savedPanel() : null}
      {panel === 'confirm-delete' ? confirmPanel() : null}
      {panel === 'deleted' ? deletedPanel() : null}
    </Overlay>
  )

  /* ------------------------------------------------------------- footer -- */

  function footer() {
    if (panel === 'deleted') {
      return (
        <button type="button" className="btn btn-secondary w-full" onClick={onClose}>
          Back to the menu
        </button>
      )
    }

    if (panel === 'confirm-delete') {
      return (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-quiet" onClick={() => setPanel('form')}>
            Keep it
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={confirmDelete}
            disabled={remove.isPending}
          >
            <Trash2 size={15} strokeWidth={1.8} />
            {remove.isPending ? 'Removing…' : 'Remove'}
          </button>
        </div>
      )
    }

    if (panel === 'saved') {
      return isEdit ? (
        <button type="button" className="btn btn-secondary w-full" onClick={onClose}>
          Back to the menu
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-quiet" onClick={() => fill(null)}>
            Add another
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      )
    }

    return (
      <button
        type="submit"
        form="product-form"
        className="btn btn-primary w-full"
        disabled={busy || (isEdit && !plan)}
      >
        {isEdit ? <Save size={15} strokeWidth={1.8} /> : <PackagePlus size={15} strokeWidth={1.8} />}
        {busy ? 'Saving…' : isEdit ? (plan ? 'Save changes' : 'Nothing changed yet') : 'Add to the menu'}
      </button>
    )
  }

  /* --------------------------------------------------------------- form -- */

  function formPanel() {
    return (
      <form id="product-form" onSubmit={submit} className="space-y-5 p-5" noValidate>
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
            min={0}
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
                ? 'Price has to be a number, zero or more.'
                : 'Stock has to be a whole number, zero or more.'}
          </p>
        ) : null}

        {failure ? <ErrorState compact message={describeError(failure)} /> : null}

        <div className="flex items-center gap-4 border-t border-line pt-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center border border-line bg-mist">
            {name.trim() ? (
              <VesselMark
                product={{
                  id: product?.id ?? 0,
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
            <p className="mt-1 text-sm leading-relaxed text-moss">
              {describeVessel({ name, categoryName: chosen?.name ?? null })}
            </p>
          </div>
        </div>

        {/* What this form is about to send. The verb is not always the same. */}
        <div className="border-t border-line pt-5">
          <p className="eyebrow">Request</p>
          <p className="mt-1.5 font-mono text-data text-moss">
            {plan ? (
              <>
                <span className="text-ink">{plan.verb}</span> {plan.path}
                {plan.fields.length ? <span> · {plan.fields.join(', ')}</span> : null}
              </>
            ) : (
              'Nothing to send — no field has changed.'
            )}
          </p>
          {plan?.note ? <p className="mt-1.5 text-micro leading-relaxed text-moss">{plan.note}</p> : null}

          {isEdit ? (
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 font-mono text-micro uppercase tracking-[0.08em] text-moss underline-offset-4 transition-colors hover:text-cherry hover:underline"
              onClick={() => setPanel('confirm-delete')}
            >
              <Trash2 size={13} strokeWidth={1.8} />
              Remove from the menu
            </button>
          ) : null}
        </div>
      </form>
    )
  }

  /* -------------------------------------------------------------- saved -- */

  function savedPanel() {
    if (!saved) return null
    return (
      <div className="space-y-5 p-5">
        <div className="flex items-start gap-3">
          <Check size={16} strokeWidth={2} className="mt-1 shrink-0 text-ink" />
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-display font-bold">{saved.name}</span>{' '}
            {isEdit ? 'has been updated.' : 'is on the menu.'}
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
    )
  }

  /* ------------------------------------------------------------- delete -- */

  function confirmPanel() {
    if (!product) return null
    return (
      <div className="space-y-5 p-5">
        <p className="text-sm leading-relaxed text-ink">
          Remove <span className="font-display font-bold">{product.name}</span> from the menu?
        </p>
        <p className="text-sm leading-relaxed text-moss">
          This sends <span className="font-mono text-ink">DELETE /products/{product.id}</span> and the row
          is gone for good. Orders that already include it are safe — OrderItem copied the name and price
          when the order was placed, so history does not change.
        </p>
        {remove.isError ? <ErrorState compact message={describeError(remove.error)} /> : null}
      </div>
    )
  }

  function deletedPanel() {
    return (
      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-display font-bold">{product?.name}</span> is off the menu.
        </p>
        <p className="font-mono text-micro leading-relaxed text-moss">{removedMessage}</p>
        <p className="text-sm leading-relaxed text-moss">
          It has also been taken out of your cart, since ordering it now would come back 404 from
          order-service.
        </p>
      </div>
    )
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="eyebrow">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
