import { useMemo } from 'react'
import dayjs from 'dayjs'
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
  type CartItemWithFood,
} from '@/features/cart/services/cart-service'
import { useMenuForDate } from '@/features/menu/hooks/use-menu-queries'
import { isCutoffPassed, isSoldOut } from '@/features/menu/services/menu-service'
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
  const { data: items, isPending: isCartPending } = useCartItems()
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const { data: menuListings, isPending: isMenuPending } = useMenuForDate(today)

  return useMemo(() => {
    const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
    const subtotal =
      items?.reduce((sum, item) => {
        const price = item.food_item_variants ? item.food_item_variants.price : item.food_items.price
        return sum + (price + customizationsTotal(item.customizations)) * item.quantity
      }, 0) ?? 0

    const getItemUnavailabilityReason = (item: CartItemWithFood): string | null => {
      if (!item.food_items.is_available) {
        return 'Out of Stock'
      }

      if (item.food_item_variants && item.food_item_variants.is_active === false) {
        return 'Variant Unavailable'
      }

      // 24x7 Always-available items (farsan, snacks, sweets, beverages) are not bound to daily menus
      const catType = (item.food_items as any).categories?.category_type
      const catSlug = (item.food_items as any).categories?.slug || ''
      const isAlwaysAvailable =
        item.food_items.kind === 'single' &&
        (catType === 'snack' ||
          catType === 'beverage' ||
          catType === 'sweet' ||
          catSlug.includes('snack') ||
          catSlug.includes('farsan') ||
          catSlug.includes('nasta'))

      if (isAlwaysAvailable) {
        return null
      }

      if (!menuListings || menuListings.length === 0) {
        return "Today's menu not published"
      }
      const listing = menuListings.find((l) => l.food_item_id === item.food_item_id)
      if (!listing) {
        return "Not on today's menu"
      }
      if (isSoldOut(listing)) {
        return 'Sold Out'
      }
      if (isCutoffPassed(listing)) {
        return 'Cutoff Passed'
      }
      return null
    }

    const unavailableItemsMap = new Map<string, string>()
    if (items) {
      for (const item of items) {
        const reason = getItemUnavailabilityReason(item)
        if (reason) {
          unavailableItemsMap.set(item.id, reason)
        }
      }
    }

    const hasUnavailableItems = unavailableItemsMap.size > 0

    return {
      itemCount,
      subtotal,
      items: items ?? [],
      hasUnavailableItems,
      unavailableItemsMap,
      isPending: isCartPending || isMenuPending,
    }
  }, [items, menuListings, isCartPending, isMenuPending])
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
