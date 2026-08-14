import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PackageSearch, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/order-status-badge'
import { useMyOrders } from '@/features/orders/hooks/use-orders'
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
        navigate(ROUTES.cart)
      } else {
        toast.error('Those items are no longer available.')
      }
    },
    onError: (error) => toast.error(error.message),
  })
}

export function OrderHistoryPage() {
  const { data: orders, isPending, isError, refetch } = useMyOrders()
  const reorder = useReorder()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">My Orders</h1>
      <p className="text-muted-foreground mt-1">Track current orders and reorder past favourites.</p>

      <div className="mt-8 space-y-4">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !orders?.length ? (
          <EmptyState
            icon={PackageSearch}
            title="No orders yet"
            description="Once you place an order, it'll show up here."
            action={
              <Button asChild>
                <Link to={ROUTES.menu}>Browse menu</Link>
              </Button>
            }
          />
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.order_number}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {dayjs(order.placed_at).format('D MMM YYYY, h:mm A')} · {order.order_items.length}{' '}
                    item{order.order_items.length > 1 ? 's' : ''} ·{' '}
                    <span className="font-medium">
                      {CURRENCY_SYMBOL}
                      {order.total_amount}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={ROUTES.orderDetail(order.id)}>Track</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reorder.mutate(order.id)}
                    disabled={reorder.isPending}
                  >
                    <RotateCcw className="size-3.5" aria-hidden />
                    Reorder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
