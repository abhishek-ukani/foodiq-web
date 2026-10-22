import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDays,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Star,
  Utensils,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/order-status-badge'
import { ReviewFormDialog } from '@/features/reviews/components/review-form-dialog'
import { useMyOrders } from '@/features/orders/hooks/use-orders'
import type { OrderWithItems } from '@/features/orders/services/orders-service'
import { supabase } from '@/lib/supabase'
import { CURRENCY_SYMBOL, QUERY_KEYS, ROUTES } from '@/constants'

function useReorder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.rpc('reorder', { p_order_id: orderId })
      if (error) throw error
      return data
    },
    onSuccess: (added) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      if (added > 0) {
        toast.success(`${added} item${added > 1 ? 's' : ''} added to your cart`)
        navigate(ROUTES.checkout)
      } else {
        toast.error('Those items are no longer available.')
      }
    },
    onError: (error) => toast.error(error.message),
  })
}

export function OrderHistoryPage() {
  const navigate = useNavigate()
  const { data: orders, isPending, isError, refetch } = useMyOrders()
  const reorder = useReorder()

  // State for reviewing single item
  const [reviewTarget, setReviewTarget] = useState<{
    foodItemId: string
    orderId: string
    itemName: string
  } | null>(null)

  // State for choosing item to rate when order has multiple items
  const [orderToPickReview, setOrderToPickReview] = useState<OrderWithItems | null>(null)

  const handleRateOrder = (order: OrderWithItems) => {
    const rateableItems = order.order_items.filter((item) => Boolean(item.food_item_id))
    if (!rateableItems.length) {
      toast.error('No rateable items found for this order.')
      return
    }

    if (rateableItems.length === 1) {
      const single = rateableItems[0]
      setReviewTarget({
        foodItemId: single.food_item_id!,
        orderId: order.id,
        itemName: single.item_name,
      })
    } else {
      setOrderToPickReview(order)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3.5 py-6 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Track past favourites and easily reorder meals.
        </p>
      </div>

      <div className="space-y-4">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !orders?.length ? (
          <EmptyState
            icon={PackageSearch}
            title="No orders yet"
            description="Once you place an order, it will show up here."
            action={
              <Button asChild className="min-h-[44px]">
                <Link to={ROUTES.menu}>Browse menu</Link>
              </Button>
            }
          />
        ) : (
          orders.map((order) => {
            const primaryItem = order.order_items[0]
            const remainingCount = order.order_items.length - 1
            const isDelivered = order.status === 'delivered'
            const isInProgress = [
              'pending',
              'accepted',
              'preparing',
              'ready',
              'out_for_delivery',
            ].includes(order.status)

            return (
              <Card
                key={order.id}
                onClick={() => navigate(ROUTES.orderDetail(order.id))}
                className="group relative cursor-pointer rounded-2xl border border-border/70 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.995]"
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Top Bar: Placed Date & Order Status Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                      <CalendarDays className="size-3.5 text-muted-foreground/80" />
                      <span>{dayjs(order.placed_at).format('D MMM YYYY, h:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Middle Section: Food image + Dish names and count */}
                  <div className="flex items-start gap-3.5 pt-3.5 sm:gap-4">
                    {/* Item Thumbnail / Fallback Icon */}
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30 sm:size-20">
                      {primaryItem?.item_image_url ? (
                        <img
                          src={primaryItem.item_image_url}
                          alt={primaryItem.item_name}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-primary/5 text-primary/70">
                          <Utensils className="size-6" />
                        </div>
                      )}
                    </div>

                    {/* Dish information */}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
                        {primaryItem ? primaryItem.item_name : 'Order Meal'}
                        {remainingCount > 0 ? (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground sm:text-sm">
                            +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
                          </span>
                        ) : null}
                      </h2>

                      {/* Summary list of all dishes */}
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {order.order_items
                          .map((item) => `${item.quantity}× ${item.item_name}`)
                          .join(', ')}
                      </p>

                      {/* Total Amount & Items */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {CURRENCY_SYMBOL}
                          {order.total_amount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row: Mobile-First Touch Targets (44px min height) */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-border/50 pt-3">
                    {/* Left Action / Status Indicator */}
                    <div>
                      {isDelivered ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] touch-manipulation gap-1.5 rounded-xl border-amber-300/80 bg-amber-50/70 px-3.5 text-xs font-medium text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRateOrder(order)
                          }}
                        >
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          Rate Order
                        </Button>
                      ) : isInProgress ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-primary sm:text-sm">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                          </span>
                          <span>In progress · Tap for live status</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Tap card for details</span>
                      )}
                    </div>

                    {/* Right Action: Reorder Button */}
                    <Button
                      type="button"
                      size="sm"
                      className="min-h-[44px] touch-manipulation gap-1.5 rounded-xl px-4 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        reorder.mutate(order.id)
                      }}
                      disabled={reorder.isPending}
                    >
                      <RotateCcw className="size-3.5" />
                      {reorder.isPending ? 'Adding…' : 'Reorder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Dialog for selecting which item to rate if multiple items in order */}
      {orderToPickReview ? (
        <Dialog
          open={Boolean(orderToPickReview)}
          onOpenChange={(open) => !open && setOrderToPickReview(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rate Dishes</DialogTitle>
              <DialogDescription>
                Choose which item from this order you would like to review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {orderToPickReview.order_items
                .filter((item) => Boolean(item.food_item_id))
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/40"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-[44px] gap-1.5 text-xs"
                      onClick={() => {
                        setReviewTarget({
                          foodItemId: item.food_item_id!,
                          orderId: orderToPickReview.id,
                          itemName: item.item_name,
                        })
                        setOrderToPickReview(null)
                      }}
                    >
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      Rate
                    </Button>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Review Dialog */}
      {reviewTarget ? (
        <ReviewFormDialog
          open={Boolean(reviewTarget)}
          onOpenChange={(open) => !open && setReviewTarget(null)}
          foodItemId={reviewTarget.foodItemId}
          orderId={reviewTarget.orderId}
          itemName={reviewTarget.itemName}
        />
      ) : null}
    </div>
  )
}
