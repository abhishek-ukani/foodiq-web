import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { QUERY_KEYS } from '@/constants'
import {
  addToCart,
  clearCart,
  customizationsTotal,
  fetchCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from '@/features/cart/services/cart-service'
import { useAuth } from '@/hooks/use-auth'

export function useCartItems() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: fetchCartItems,
    enabled: isAuthenticated,
  })
}

export function useCartSummary() {
  const { data: items } = useCartItems()
  return useMemo(() => {
    const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
    const subtotal =
      items?.reduce((sum, item) => {
        const price = item.food_items.offer_price ?? item.food_items.price
        return sum + (price + customizationsTotal(item.customizations)) * item.quantity
      }, 0) ?? 0
    return { itemCount, subtotal, items: items ?? [] }
  }, [items])
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      toast.success('Added to cart')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateCartItemQuantity(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart }),
    onError: (error) => toast.error(error.message),
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      toast.success('Removed from cart')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart }),
  })
}
