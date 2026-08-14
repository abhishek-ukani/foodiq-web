import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useMyFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/use-favorites'
import { cn } from '@/lib/utils'

export function FavoriteButton({
  foodItemId,
  className,
  size = 'icon',
}: {
  foodItemId: string
  className?: string
  size?: 'icon' | 'default'
}) {
  const user = useAuthStore((state) => state.user)
  const { data: favoriteIds } = useMyFavoriteIds()
  const toggle = useToggleFavorite()
  const isFavorited = favoriteIds?.includes(foodItemId) ?? false

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorited}
      className={cn('bg-background/90 shadow-sm backdrop-blur-sm', className)}
      disabled={toggle.isPending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!user) {
          toast.error('Sign in to save favorites')
          return
        }
        toggle.mutate({ foodItemId, isFavorited })
      }}
    >
      <Heart
        className={cn('size-4', isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground')}
        aria-hidden
      />
    </Button>
  )
}
