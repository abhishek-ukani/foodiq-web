import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import {
  useCartItems,
  useCartSummary,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '@/features/cart/hooks/use-cart'
import { customizationsTotal, type SelectedCustomization } from '@/features/cart/services/cart-service'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'

export function CartPage() {
  const { isPending } = useCartItems()
  const { items, itemCount, subtotal } = useCartSummary()
  const updateQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Your Cart</h1>
      <p className="text-muted-foreground mt-1">
        {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in your cart` : 'Review your order'}
      </p>

      {isPending ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse today's menu and add a few dishes to get started."
          className="mt-8"
          action={
            <Button asChild>
              <Link to={ROUTES.menu}>Browse menu</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => {
              const basePrice = item.food_items.offer_price ?? item.food_items.price
              const addOns = (item.customizations as SelectedCustomization[] | null) ?? []
              const price = basePrice + customizationsTotal(addOns)
              return (
                <Card key={item.id}>
                  <CardContent className="flex gap-4 pt-6">
                    <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-lg">
                      {item.food_items.image_url ? (
                        <img
                          src={item.food_items.image_url}
                          alt={item.food_items.name}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{item.food_items.name}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                          onClick={() => removeItem.mutate(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="text-destructive size-4" aria-hidden />
                        </Button>
                      </div>
                      {addOns.length ? (
                        <p className="text-muted-foreground text-xs">
                          + {addOns.map((c) => c.name).join(', ')}
                        </p>
                      ) : null}
                      {item.special_instructions ? (
                        <p className="text-muted-foreground text-xs">
                          &ldquo;{item.special_instructions}&rdquo;
                        </p>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg border px-1.5 py-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" aria-hidden />
                          </Button>
                          <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            disabled={item.quantity >= 10}
                            onClick={() =>
                              updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" aria-hidden />
                          </Button>
                        </div>
                        <p className="font-semibold">
                          {CURRENCY_SYMBOL}
                          {price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <p className="font-medium">Order Summary</p>
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    {CURRENCY_SYMBOL}
                    {subtotal}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Delivery charges are calculated at checkout based on your address.
                </p>
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span>
                    {CURRENCY_SYMBOL}
                    {subtotal}
                  </span>
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link to={ROUTES.checkout}>Proceed to checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
