import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { Bell, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/features/auth/store/auth-store'
import {
  useMarkNotificationRead,
  useMyNotifications,
} from '@/features/notifications/hooks/use-notifications'
import type { Tables } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Notification = Tables<'notifications'>

function isPersonal(notification: Notification, userId: string | undefined) {
  return Boolean(userId) && notification.user_id === userId
}

function NotificationRow({
  notification,
  userId,
  onMarkRead,
}: {
  notification: Notification
  userId: string | undefined
  onMarkRead: (id: string) => void
}) {
  const personal = isPersonal(notification, userId)
  const unread = personal && !notification.is_read

  const content = (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-3 text-sm transition-colors',
        unread ? 'bg-primary/5' : '',
      )}
    >
      <div className="mt-0.5 shrink-0">
        {unread ? (
          <span className="mt-1.5 block size-2 rounded-full bg-primary" aria-hidden />
        ) : (
          <Megaphone className="text-muted-foreground size-4" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium">{notification.title}</p>
        {notification.body ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">{notification.body}</p>
        ) : null}
        <p className="text-muted-foreground text-[11px]">
          {dayjs(notification.created_at).format('D MMM, h:mm A')}
        </p>
      </div>
    </div>
  )

  if (unread) {
    return (
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onMarkRead(notification.id)}
      >
        {content}
      </button>
    )
  }

  if (notification.action_url) {
    return <Link to={notification.action_url}>{content}</Link>
  }

  return content
}

export function NotificationBell() {
  const user = useAuthStore((state) => state.user)
  const { data: notifications } = useMyNotifications()
  const markRead = useMarkNotificationRead()

  const unreadCount =
    notifications?.filter((n) => isPersonal(n, user?.id) && !n.is_read).length ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3">
          <p className="font-medium">Notifications</p>
        </div>
        <Separator />
        <ScrollArea className="h-96">
          {!notifications?.length ? (
            <p className="text-muted-foreground p-6 text-center text-sm">No notifications yet</p>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  userId={user?.id}
                  onMarkRead={(id) => markRead.mutate(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
