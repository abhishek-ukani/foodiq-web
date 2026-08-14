import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  useCartItems,
  useAddToCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '@/features/cart/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

const MAX_QUANTITY = 10

/**
 * Quick add/adjust straight from a dish card. Only ever targets the plain
 * (no add-ons) cart line — customised lines are managed from the cart page,
 * so bumping quantity here can't silently change someone's chosen add-ons.
 */
export function CardCartControls({ foodItemId, className }: { foodItemId: string; className?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { data: items } = useCartItems()
  const addToCart = useAddToCart()
  const updateQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  const line = items?.find(
    (item) =>
      item.food_item_id === foodItemId &&
      (!Array.isArray(item.customizations) || item.customizations.length === 0),
  )

  const isBusy = addToCart.isPending || updateQuantity.isPending || removeItem.isPending

  const stop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  if (!line) {
    return (
      <Button
        size="sm"
        className={cn('w-full', className)}
        disabled={isBusy}
        onClick={(event) => {
          stop(event)
          if (!isAuthenticated) {
            navigate(ROUTES.login, { state: { from: location } })
            return
          }
          addToCart.mutate({ food_item_id: foodItemId, quantity: 1 })
        }}
      >
        <ShoppingBag className="size-3.5" aria-hidden />
        Add
      </Button>
    )
  }

  const atMin = line.quantity <= 1

  return (
    <div className={cn('flex items-center justify-between gap-1 rounded-md border p-0.5', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        disabled={isBusy}
        aria-label={atMin ? 'Remove from cart' : 'Decrease quantity'}
        onClick={(event) => {
          stop(event)
          if (atMin) removeItem.mutate(line.id)
          else updateQuantity.mutate({ id: line.id, quantity: line.quantity - 1 })
        }}
      >
        {atMin ? (
          <Trash2 className="text-destructive size-3.5" aria-hidden />
        ) : (
          <Minus className="size-3.5" aria-hidden />
        )}
      </Button>
      <span className="text-sm font-medium tabular-nums">{line.quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        disabled={isBusy || line.quantity >= MAX_QUANTITY}
        aria-label="Increase quantity"
        onClick={(event) => {
          stop(event)
          updateQuantity.mutate({ id: line.id, quantity: line.quantity + 1 })
        }}
      >
        <Plus className="size-3.5" aria-hidden />
      </Button>
    </div>
  )
}
