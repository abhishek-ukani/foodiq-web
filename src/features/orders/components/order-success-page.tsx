import { Link, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { useOrder } from '@/features/orders/hooks/use-orders'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'

export function OrderSuccessPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, isError, refetch } = useOrder(id)

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

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="bg-success/10 text-success mx-auto flex size-16 items-center justify-center rounded-full">
        <CheckCircle2 className="size-8" aria-hidden />
      </div>
      <h1 className="font-display mt-6 text-3xl font-semibold">Order placed!</h1>
      <p className="text-muted-foreground mt-2">
        Thanks — we&apos;ve sent your order to the kitchen.
      </p>

      <Card className="mt-8 text-left">
        <CardContent className="space-y-3 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order number</span>
            <span className="font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">
              {dayjs(order.delivery_date).format('D MMM')} · {order.delivery_slot_label}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>
              {CURRENCY_SYMBOL}
              {order.total_amount}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="flex-1">
          <Link to={ROUTES.orderDetail(order.id)}>Track order</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to={ROUTES.menu}>Continue browsing</Link>
        </Button>
      </div>
    </div>
  )
}
