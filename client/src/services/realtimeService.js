import { useEffect } from 'react'
import { supabase } from './supabaseClient'

/**
 * Hook to listen for realtime changes on the 'products' table.
 * Whenever a product is inserted, updated, or deleted, `onProductChange` is called.
 */
export function useRealtimeProducts(onProductChange) {
  useEffect(() => {
    if (!onProductChange) return

    const channel = supabase
      .channel('realtime:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          onProductChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onProductChange])
}

/**
 * Hook to listen for realtime changes on the 'categories' table.
 */
export function useRealtimeCategories(onCategoryChange) {
  useEffect(() => {
    if (!onCategoryChange) return

    const channel = supabase
      .channel('realtime:categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          onCategoryChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onCategoryChange])
}

/**
 * Hook to listen for realtime changes on the 'orders' table.
 */
export function useRealtimeOrders(onOrderChange) {
  useEffect(() => {
    if (!onOrderChange) return

    const channel = supabase
      .channel('realtime:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          onOrderChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onOrderChange])
}
