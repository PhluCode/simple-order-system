/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_PRODUCT_SERVICE?: string
  readonly VITE_ORDER_SERVICE?: string
  readonly VITE_NOTIFICATION_SERVICE?: string
  readonly VITE_USER_SERVICE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
