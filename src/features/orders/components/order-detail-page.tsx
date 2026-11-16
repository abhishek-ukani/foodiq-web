import { useState } from 'react'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { AlertCircle, MessageCircle, PhoneCall, Star, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/order-status-badge'
import { OrderStatusTimeline } from '@/components/common/order-status-timeline'
import { ReviewFormDialog } from '@/features/reviews/components/review-form-dialog'
import { useMyReviewsForOrder } from '@/features/reviews/hooks/use-reviews'
import { useOrder } from '@/features/orders/hooks/use-orders'
import { useAuth } from '@/hooks/use-auth'
import { CONTACT_INFO, CURRENCY_SYMBOL } from '@/constants'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, isError, refetch } = useOrder(id)
  const { isVerified } = useAuth()
  const { data: myReviews } = useMyReviewsForOrder(id)
  const [reviewTarget, setReviewTarget] = useState<{
    foodItemId: string
    name: string
    initialRating?: number
    initialFoodRating?: number | null
    initialPackagingRating?: number | null
    initialDeliveryRating?: number | null
    initialComment?: string | null
  } | null>(null)

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState title="Couldn't load this order" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {order.meal_type
              ? `${order.meal_type === 'dinner' ? 'Dinner' : 'Lunch'} Order`
              : 'Kathiyawadi Meal Order'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Order #{order.order_number} · Placed {dayjs(order.placed_at).format('D MMM YYYY, h:mm A')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <OrderStatusTimeline status={order.status} />

            {!isVerified && order.status === 'pending' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs sm:text-sm">
                  <Utensils className="size-4 text-amber-600 shrink-0" />
                  <span>First Order: Kitchen Review in Progress</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Since this is your first order with FoodIQ, our kitchen team will quickly confirm your delivery details before cooking. We may call your contact number to verify.
                </p>
                <div className="pt-0.5 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:underline"
                  >
                    <PhoneCall className="size-3.5" /> Call Kitchen
                  </a>
                  <span className="text-amber-300">|</span>
                  <a
                    href={CONTACT_INFO.whatsappUrl(`Hello FoodIQ, I am inquiring about my first order #${order.order_number}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp Support
                  </a>
                </div>
              </div>
            )}

            {(order.status === 'cancelled' || order.status === 'rejected') && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-left space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs sm:text-sm">
                  <AlertCircle className="size-4 text-rose-600 shrink-0" />
                  <span>Order Not Confirmed</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Our kitchen was unable to confirm this order. If your phone was unreachable or address is outside our delivery zone, please contact our team directly.
                </p>
                <div className="pt-0.5 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="inline-flex items-center gap-1 font-semibold text-rose-900 hover:underline"
                  >
                    <PhoneCall className="size-3.5" /> Call Kitchen
                  </a>
                  <span className="text-rose-300">|</span>
                  <a
                    href={CONTACT_INFO.whatsappUrl(`Hello FoodIQ, my order #${order.order_number} could not be confirmed. Please assist me.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp Support
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.contact_name}</p>
              <p className="text-muted-foreground">
                {order.address_line1}
                {order.address_line2 ? `, ${order.address_line2}` : ''}, {order.city}
              </p>
              <p className="text-muted-foreground pt-2">
                {dayjs(order.delivery_date).format('D MMM')} ·{' '}
                {order.meal_type
                  ? `${order.meal_type === 'dinner' ? '🌙' : '☀️'} ${order.meal_type.charAt(0).toUpperCase() + order.meal_type.slice(1)}`
                  : 'Standard Delivery'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.order_items.map((item) => {
            const snapshot = (item.item_snapshot as { name: string; quantity: number }[] | null) ?? []
            const addOns = (item.customizations as { name: string; price_delta: number }[] | null) ?? []
            return (
              <div key={item.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span>
                      {item.item_name} × {item.quantity}
                    </span>
                    {(() => {
                      const vs = item.variant_snapshot as { label?: string } | null
                      const label = vs?.label || (item.variant_code ? item.variant_code.split('_').slice(-1)[0] : null)
                      if (!label) return null
                      return (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                            {label}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === 'delivered' && item.food_item_id ? (
                      (() => {
                        const userReview = myReviews?.find((r) => r.food_item_id === item.food_item_id)
                        if (userReview) {
                          return (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewTarget({
                                  foodItemId: item.food_item_id!,
                                  name: item.item_name,
                                  initialRating: userReview.rating,
                                  initialFoodRating: userReview.food_rating,
                                  initialPackagingRating: userReview.packaging_rating,
                                  initialDeliveryRating: userReview.delivery_rating,
                                  initialComment: userReview.comment,
                                })
                              }

                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                              title="Tap to update your review"
                            >
                              <Star className="size-3 fill-amber-500 text-amber-500" aria-hidden />
                              <span>{userReview.rating}★ Rated</span>
                            </button>
                          )
                        }

                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 min-h-[36px] text-xs gap-1 border-amber-300/80 bg-amber-50/70 text-amber-800 hover:bg-amber-100 font-medium"
                            onClick={() =>
                              setReviewTarget({ foodItemId: item.food_item_id!, name: item.item_name })
                            }
                          >
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            Rate this item
                          </Button>
                        )
                      })()
                    ) : null}
                    <span className="font-medium">
                      {CURRENCY_SYMBOL}
                      {item.line_total}
                    </span>
                  </div>
                </div>
                {snapshot.length ? (
                  <p className="text-muted-foreground text-xs">
                    {snapshot.map((c) => c.name).join(', ')}
                  </p>
                ) : null}
                {addOns.length ? (
                  <p className="text-muted-foreground text-xs">
                    + {addOns.map((c) => c.name).join(', ')}
                  </p>
                ) : null}
              </div>
            )
          })}
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Subtotal</span>
              <span>
                {CURRENCY_SYMBOL}
                {order.subtotal}
              </span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Delivery charge</span>
              <span>
                {CURRENCY_SYMBOL}
                {order.delivery_charge}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-semibold">
              <span>Total</span>
              <span>
                {CURRENCY_SYMBOL}
                {order.total_amount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {reviewTarget ? (
        <ReviewFormDialog
          open={Boolean(reviewTarget)}
          onOpenChange={(open) => !open && setReviewTarget(null)}
          foodItemId={reviewTarget.foodItemId}
          orderId={order.id}
          itemName={reviewTarget.name}
          initialRating={reviewTarget.initialRating}
          initialFoodRating={reviewTarget.initialFoodRating}
          initialPackagingRating={reviewTarget.initialPackagingRating}
          initialDeliveryRating={reviewTarget.initialDeliveryRating}
          initialComment={reviewTarget.initialComment}
        />
      ) : null}
    </div>
  )
}
