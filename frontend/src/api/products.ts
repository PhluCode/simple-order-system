import { productApi, useMockData } from '@/lib/http'
import { mockProducts } from '@/lib/mock'
import type { NewProduct, ProductDTO, ProductPatch } from '@/lib/types'

/**
 * `GET /products` — optionally narrowed by name or categoryId. Both query
 * parameters are read by ProductController.listProducts; passing neither
 * returns the whole menu.
 */
export async function fetchProducts(params?: {
  name?: string
  categoryId?: number | null
}): Promise<ProductDTO[]> {
  if (useMockData) return filterMock(params)

  const query: Record<string, string | number> = {}
  if (params?.name) query.name = params.name
  if (params?.categoryId != null) query.categoryId = params.categoryId

  const { data } = await productApi.get<ProductDTO[]>('', { params: query })
  return data
}

/** `GET /products/{id}`. 404 means the product was deleted. */
export async function fetchProduct(id: number): Promise<ProductDTO> {
  if (useMockData) {
    const found = mockProducts.find((p) => p.id === id)
    if (!found) throw new Error('No product with that id')
    return found
  }
  const { data } = await productApi.get<ProductDTO>(`/${id}`)
  return data
}

/**
 * `POST /products` — answers 201 with the saved ProductDTO, including the id
 * the database assigned and the port of the replica that wrote it.
 *
 * Note there is no authentication on this endpoint. The interface only offers
 * it to a signed-in ADMIN, but that is a courtesy, not a control: anyone who
 * can reach :8100 can post to it with curl. See README, "Who can add a
 * product".
 */
export async function createProduct(input: NewProduct): Promise<ProductDTO> {
  if (useMockData) return createMock(input)

  const { data } = await productApi.post<ProductDTO>('', {
    name: input.name,
    price: input.price,
    stock: input.stock,
    categoryId: input.categoryId,
  })
  return data
}

/**
 * `PUT /products/{id}` — replaces every field. Passing `categoryId: null`
 * genuinely clears the category, which is the one thing PATCH cannot do.
 * 404 if the product has since been deleted.
 */
export async function replaceProduct(id: number, input: NewProduct): Promise<ProductDTO> {
  if (useMockData) return patchMock(id, input)

  const { data } = await productApi.put<ProductDTO>(`/${id}`, {
    name: input.name,
    price: input.price,
    stock: input.stock,
    categoryId: input.categoryId,
  })
  return data
}

/**
 * `PATCH /products/{id}` — send only what changed.
 *
 * See the note on ProductPatch: a price of 0, a stock of 0, or a null category
 * are indistinguishable from an omitted field on the server, so never route
 * those through here. ProductFormDialog switches to PUT instead.
 */
export async function patchProduct(id: number, patch: ProductPatch): Promise<ProductDTO> {
  if (useMockData) return patchMock(id, patch)

  const { data } = await productApi.patch<ProductDTO>(`/${id}`, patch)
  return data
}

/**
 * `DELETE /products/{id}` — answers with a plain sentence, not JSON, and 404
 * with a different sentence if it was already gone.
 *
 * Orders are unaffected: OrderItem copied the name and price at the time it
 * was placed, so history survives the product being removed from the menu.
 */
export async function deleteProduct(id: number): Promise<string> {
  if (useMockData) {
    const index = mockProducts.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('No product with that id')
    mockProducts.splice(index, 1)
    return `Successfully deleted the product (ID: ${id})`
  }
  const { data } = await productApi.delete<string>(`/${id}`, { responseType: 'text' })
  return typeof data === 'string' ? data : String(data)
}

function patchMock(id: number, patch: ProductPatch): ProductDTO {
  const existing = mockProducts.find((p) => p.id === id)
  if (!existing) throw new Error('No product with that id')

  if (patch.name !== undefined) existing.name = patch.name
  if (patch.price !== undefined) existing.price = patch.price
  if (patch.stock !== undefined) existing.stock = patch.stock
  if (patch.categoryId !== undefined) {
    existing.categoryId = patch.categoryId
    existing.categoryName =
      patch.categoryId == null
        ? null
        : (mockProducts.find((p) => p.categoryId === patch.categoryId)?.categoryName ?? null)
  }
  return { ...existing }
}

function createMock(input: NewProduct): ProductDTO {
  const id = Math.max(0, ...mockProducts.map((p) => p.id)) + 1
  const created: ProductDTO = {
    id,
    name: input.name,
    price: input.price,
    stock: input.stock,
    categoryId: input.categoryId,
    categoryName: mockProducts.find((p) => p.categoryId === input.categoryId)?.categoryName ?? null,
    servedByPort: id % 2 === 0 ? 8101 : 8100,
  }
  mockProducts.push(created)
  return created
}

function filterMock(params?: { name?: string; categoryId?: number | null }): ProductDTO[] {
  let list = mockProducts
  if (params?.name) {
    const needle = params.name.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(needle))
  } else if (params?.categoryId != null) {
    list = list.filter((p) => p.categoryId === params.categoryId)
  }
  // Fresh objects every time, the way a real HTTP response would be. Handing
  // back the live array means an edit mutates the cached data in place, React
  // Query sees the same reference, and nothing re-renders — the menu would
  // quietly show stale prices in mock mode only.
  return list.map((product) => ({ ...product }))
}
