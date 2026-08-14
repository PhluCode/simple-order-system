import type { CategoryView, ProductDTO } from './types'

/**
 * product-service has no `GET /categories` endpoint — ProductController only
 * exposes /products. Every ProductDTO does carry categoryId and categoryName,
 * so the rail is built from the menu itself. Filtering still goes back to the
 * server via `GET /products?categoryId=`, which does exist.
 */
export function deriveCategories(products: ProductDTO[]): CategoryView[] {
  const seen = new Map<number, CategoryView>()

  for (const product of products) {
    if (product.categoryId == null) continue
    const existing = seen.get(product.categoryId)
    if (existing) {
      existing.count += 1
    } else {
      seen.set(product.categoryId, {
        id: product.categoryId,
        name: product.categoryName ?? `Category ${product.categoryId}`,
        count: 1,
      })
    }
  }

  return [...seen.values()].sort((a, b) => a.id - b.id)
}

/**
 * Which 3D form a product gets. Category first, then the name, so a drink
 * still looks right if someone adds a product without a category.
 */
export type Vessel = 'cup' | 'glass' | 'pastry'

export function vesselFor(product: Pick<ProductDTO, 'name' | 'categoryName'>): Vessel {
  const category = (product.categoryName ?? '').toLowerCase()
  const name = product.name.toLowerCase()

  if (category.includes('bakery') || /croissant|cake|pastry|bread|cookie/.test(name)) {
    return 'pastry'
  }
  if (category.includes('iced') || /^iced|cold brew|frappe/.test(name)) {
    return 'glass'
  }
  if (category.includes('tea') || /matcha|chocolate|cocoa/.test(name)) {
    // The non-coffee drinks in the seed data are all served iced.
    return name.startsWith('hot') ? 'cup' : 'glass'
  }
  return 'cup'
}

/** The liquid a product is made of, for the 3D materials. */
export type Brew = 'espresso' | 'americano' | 'milk-coffee' | 'matcha' | 'chocolate' | 'caramel' | 'baked'

export function brewFor(product: Pick<ProductDTO, 'name' | 'categoryName'>): Brew {
  const name = product.name.toLowerCase()
  if (vesselFor(product) === 'pastry') return 'baked'
  if (name.includes('matcha')) return 'matcha'
  if (name.includes('chocolate') || name.includes('cocoa')) return 'chocolate'
  if (name.includes('caramel')) return 'caramel'
  if (name.includes('espresso')) return 'espresso'
  if (name.includes('americano')) return 'americano'
  return 'milk-coffee'
}
