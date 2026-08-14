import { useEffect, useMemo } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  patchProduct,
  replaceProduct,
} from '@/api/products'
import { deriveCategories } from '@/lib/categories'
import { usePipeline } from '@/store/pipeline'
import type { NewProduct, ProductDTO, ProductPatch } from '@/lib/types'

export const catalogKeys = {
  all: ['products'] as const,
  list: (categoryId: number | null, name: string) => ['products', { categoryId, name }] as const,
  one: (id: number) => ['products', id] as const,
}

/**
 * The whole menu. Fetched once and reused to build the category rail, because
 * product-service has no /categories endpoint to ask.
 */
export function useMenu() {
  const { noteCatalog } = usePipeline()

  const query = useQuery({
    queryKey: catalogKeys.list(null, ''),
    queryFn: () => fetchProducts(),
    staleTime: 30_000,
  })

  const ports = useMemo(
    () => (query.data ?? []).map((p) => p.servedByPort).filter((p) => p > 0),
    [query.data],
  )

  useEffect(() => {
    if (ports.length) noteCatalog(ports)
  }, [ports, noteCatalog])

  const categories = useMemo(() => deriveCategories(query.data ?? []), [query.data])

  return { ...query, categories }
}

/**
 * The filtered grid. `categoryId` goes to the server as a query parameter,
 * which ProductController does support; `name` is the search box.
 */
export function useProducts(categoryId: number | null, name: string) {
  return useQuery<ProductDTO[]>({
    queryKey: catalogKeys.list(categoryId, name),
    queryFn: () => fetchProducts({ categoryId, name: name || undefined }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

/** One product, refetched when its dialog opens so stock is current. */
export function useProduct(id: number | null) {
  return useQuery({
    queryKey: catalogKeys.one(id ?? -1),
    queryFn: () => fetchProduct(id as number),
    enabled: id != null,
    staleTime: 5_000,
  })
}

/**
 * Adds a product to the menu. Every cached product list is thrown away on
 * success — including the filtered ones — so the new item appears whichever
 * category the person is looking at.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation<ProductDTO, unknown, NewProduct>({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

/**
 * The category list on its own, for anything that needs the rail without
 * also reporting the replica ports to the pipeline. Same query underneath, so
 * it costs nothing extra.
 */
export function useCategories() {
  const query = useQuery({
    queryKey: catalogKeys.list(null, ''),
    queryFn: () => fetchProducts(),
    staleTime: 30_000,
  })

  return useMemo(() => deriveCategories(query.data ?? []), [query.data])
}

/**
 * Saving an edit. The caller decides the verb, because only the caller knows
 * whether the change is one PATCH can survive — see the note on ProductPatch.
 */
export type ProductSave =
  | { id: number; verb: 'PUT'; body: NewProduct }
  | { id: number; verb: 'PATCH'; body: ProductPatch }

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation<ProductDTO, unknown, ProductSave>({
    mutationFn: (save) =>
      save.verb === 'PUT' ? replaceProduct(save.id, save.body) : patchProduct(save.id, save.body),
    onSuccess: () => {
      // Prefix match, so the lists and the single-product cache all go.
      void queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation<string, unknown, number>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}
