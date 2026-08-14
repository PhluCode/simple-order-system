import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Typefaces are bundled rather than fetched from Google: the app then works
// on a machine with no internet (which is how it will be demonstrated), makes
// no third-party request, and never flashes a fallback face.
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/ibm-plex-sans-thai/latin-400.css'
import '@fontsource/ibm-plex-sans-thai/latin-500.css'
import '@fontsource/ibm-plex-sans-thai/latin-600.css'
import '@fontsource/ibm-plex-sans-thai/thai-400.css'
import '@fontsource/ibm-plex-sans-thai/thai-500.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'

import App from './App'
import { CartProvider } from '@/store/cart'
import { PipelineProvider } from '@/store/pipeline'
import { SessionProvider } from '@/store/session'
import './index.css'

/**
 * Retry twice, then stop and show the person what went wrong — a service that
 * is not running will not start running because we asked it six times.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
    },
  },
})

const container = document.getElementById('root')
if (!container) throw new Error('No #root element in index.html')

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PipelineProvider>
        <SessionProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SessionProvider>
      </PipelineProvider>
    </QueryClientProvider>
  </StrictMode>,
)
