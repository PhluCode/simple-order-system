import type { Notification, Order, ProductDTO, SafeUser } from './types'

/**
 * A copy of product-service/src/main/resources/seed.sql, so the interface can
 * be worked on with the backend switched off. Keep it in step with the seed
 * file — if the menu changes there, change it here.
 *
 * Used when VITE_USE_MOCK=true, and as the fallback when a service is
 * unreachable (the interface then says so rather than pretending).
 */
export const mockProducts: ProductDTO[] = [
  { id: 1, name: 'Espresso', price: 45, stock: 50, categoryId: 1, categoryName: 'Hot Coffee', servedByPort: 8100 },
  { id: 2, name: 'Hot Americano', price: 50, stock: 50, categoryId: 1, categoryName: 'Hot Coffee', servedByPort: 8101 },
  { id: 3, name: 'Hot Latte', price: 55, stock: 40, categoryId: 1, categoryName: 'Hot Coffee', servedByPort: 8100 },
  { id: 4, name: 'Hot Cappuccino', price: 55, stock: 40, categoryId: 1, categoryName: 'Hot Coffee', servedByPort: 8101 },
  { id: 5, name: 'Iced Americano', price: 60, stock: 60, categoryId: 2, categoryName: 'Iced Coffee', servedByPort: 8100 },
  { id: 6, name: 'Iced Latte', price: 65, stock: 50, categoryId: 2, categoryName: 'Iced Coffee', servedByPort: 8101 },
  { id: 7, name: 'Iced Caramel Macchiato', price: 75, stock: 35, categoryId: 2, categoryName: 'Iced Coffee', servedByPort: 8100 },
  { id: 8, name: 'Iced Matcha Green Tea', price: 70, stock: 40, categoryId: 3, categoryName: 'Tea & Non-Coffee', servedByPort: 8101 },
  { id: 9, name: 'Iced Chocolate', price: 65, stock: 45, categoryId: 3, categoryName: 'Tea & Non-Coffee', servedByPort: 8100 },
  { id: 10, name: 'Butter Croissant', price: 45, stock: 25, categoryId: 4, categoryName: 'Bakery & Pastries', servedByPort: 8101 },
  { id: 11, name: 'Almond Croissant', price: 65, stock: 20, categoryId: 4, categoryName: 'Bakery & Pastries', servedByPort: 8100 },
  { id: 12, name: 'Chocolate Fudge Cake', price: 85, stock: 15, categoryId: 4, categoryName: 'Bakery & Pastries', servedByPort: 8101 },
]

export const mockUsers: SafeUser[] = [
  { id: 1, username: 'aom', role: 'USER', displayName: 'Aom' },
  { id: 2, username: 'phlu', role: 'USER', displayName: 'Phlu' },
  { id: 3, username: 'barista', role: 'ADMIN', displayName: 'Counter' },
]

export const mockNotifications: Notification[] = []

export const mockOrders: Order[] = []
