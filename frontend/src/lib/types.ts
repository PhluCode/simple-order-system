/**
 * These types mirror the Java DTOs exactly. When a field is missing here that
 * you expected, it is because the backend does not send it — check the DTO
 * before adding one.
 *
 *   ProductDTO      product-service/…/dto/ProductDTO.java
 *   Order/OrderItem order-service/…/Order.java, OrderItem.java
 *   OrderRequest    order-service/…/OrderRequest.java
 *   Notification    notification-service/…/Notification.java
 *   SafeUser        the map built by UserController.toSafe()
 */

/** product-service `GET /products` and `GET /products/{id}`. */
export interface ProductDTO {
  id: number
  name: string
  price: number
  stock: number
  categoryId: number | null
  categoryName: string | null
  /** Which product-service replica answered: 8100 or 8101. */
  servedByPort: number
}

/**
 * The body `POST /products` accepts. It is a ProductDTO, but only these four
 * fields may be sent: `id` must be left off entirely, because ProductMapper
 * copies `dto.id` onto the entity and a supplied id turns the insert into an
 * update of a row that does not exist. `categoryName` and `servedByPort` are
 * derived server-side and ignored.
 */
export interface NewProduct {
  name: string
  price: number
  stock: number
  categoryId: number | null
}

/**
 * The body `PATCH /products/{id}` accepts — only the fields you want changed.
 *
 * Mind the hole in it. `ProductService.patchProduct` decides a field was
 * supplied by testing `dto.getPrice() != 0.0` and `dto.getStock() != 0`, and
 * those are Java primitives: a field you leave out of the JSON arrives as 0,
 * which is exactly what "set this to zero" also looks like. So PATCH cannot
 * set a price or a stock count to 0, and cannot clear a category either
 * (null is read as "not supplied"). Anything in that shape has to go through
 * PUT, which replaces every field unconditionally.
 *
 * `components/ProductFormDialog.tsx` picks the verb on this basis and tells
 * the person which one it is about to use.
 */
export type ProductPatch = Partial<NewProduct>

/**
 * There is no `GET /categories` on the backend, so a category is whatever the
 * product list says it is. Derived in `lib/categories.ts`.
 */
export interface CategoryView {
  id: number
  name: string
  count: number
}

/** The body `POST /orders` accepts. One product per order — not a basket. */
export interface OrderRequest {
  customerName: string
  userId: number | null
  productId: number
  quantity: number
}

/** order-service `GET /orders`, `GET /orders/{id}`, `GET /orders/user/{id}`. */
export interface Order {
  id: number
  customerName: string | null
  userId: number | null
  totalPrice: number
  items: OrderItemDTO[] | null
}

export interface OrderItemDTO {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
}

/** notification-service `GET /notifications`. No timestamp is sent. */
export interface Notification {
  id: number
  customerName: string | null
  message: string
}

/** user-service returns this shape from `GET /users` and `POST /users/login`. */
export interface SafeUser {
  id: number
  username: string
  role: 'ADMIN' | 'USER' | string
  displayName: string | null
}

/** A line the shopper has assembled locally, before it becomes N orders. */
export interface CartLine {
  product: ProductDTO
  quantity: number
}

/** One `POST /orders` call, reported back per cart line. */
export interface PlacedLine {
  productName: string
  quantity: number
  ok: boolean
  /** order-service replies with plain text, e.g. "Order #7 placed". */
  message: string
  orderId: number | null
}

/** The four stops an order makes. Drawn by components/Pipeline.tsx. */
export type StationId = 'catalog' | 'order' | 'kafka' | 'notify'

export type StationState = 'idle' | 'active' | 'done' | 'failed'
