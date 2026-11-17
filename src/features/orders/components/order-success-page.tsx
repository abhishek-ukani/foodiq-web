import { Link, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/order-status-badge'
import { useOrder } from '@/features/orders/hooks/use-orders'
import { useAuth } from '@/hooks/use-auth'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'

export function OrderSuccessPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, isError, refetch } = useOrder(id)
  const { isVerified } = useAuth()

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState title="Couldn't load this order" onRetry={() => refetch()} />
      </div>
    )
  }

  const isPendingConfirmation = order.status === 'pending'

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      {isPendingConfirmation ? (
        <div className="bg-amber-100 text-amber-700 mx-auto flex size-16 items-center justify-center rounded-full shadow-inner">
          <Clock className="size-8" aria-hidden />
        </div>
      ) : (
        <div className="bg-success/10 text-success mx-auto flex size-16 items-center justify-center rounded-full shadow-inner">
          <CheckCircle2 className="size-8" aria-hidden />
        </div>
      )}

      <h1 className="font-display mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {isPendingConfirmation ? 'Order Received — Awaiting Confirmation' : 'Order Confirmed!'}
      </h1>
      <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto leading-relaxed">
        {isPendingConfirmation
          ? "We've received your request! Our kitchen team will review and confirm your order shortly before cooking begins."
          : "Thanks — your order is confirmed and being prepared by our kitchen."}
      </p>

      {isPendingConfirmation && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Listening for live kitchen confirmation...
        </div>
      )}

      {/* Awaiting Confirmation Notice Box */}
      {isPendingConfirmation && (
        <div className="mt-6 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 text-left shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl select-none shrink-0">⏳</span>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-amber-950">Needs Kitchen & Admin Confirmation</h3>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Your order is currently in <strong>Pending</strong> status. The kitchen will verify availability and confirm acceptance. You can track live updates on the tracking screen.
              </p>
              {!isVerified && (
                <div className="pt-2 border-t border-amber-200/70 mt-2">
                  <p className="text-[11px] text-amber-800 font-medium">
                    ℹ️ New customer verification in progress by admin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Card className="mt-6 text-left border-border/80 shadow-xs">
        <CardContent className="space-y-3 pt-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Order status</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order number</span>
            <span className="font-mono font-medium text-foreground">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium text-foreground">
              {dayjs(order.delivery_date).format('D MMM')} ·{' '}
              {order.meal_type
                ? `${order.meal_type === 'dinner' ? '🌙' : '☀️'} ${order.meal_type.charAt(0).toUpperCase() + order.meal_type.slice(1)}`
                : 'Standard Delivery'}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold text-base">
            <span>Total</span>
            <span className="text-primary font-bold">
              {CURRENCY_SYMBOL}
              {order.total_amount}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Button asChild className="flex-1 min-h-[44px]">
          <Link to={ROUTES.orderDetail(order.id)}>Track order</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 min-h-[44px]">
          <Link to={ROUTES.menu}>Continue browsing</Link>
        </Button>
      </div>
    </div>
  )
}
