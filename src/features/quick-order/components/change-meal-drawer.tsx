import { Check, Sparkles, Utensils } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CURRENCY_SYMBOL } from '@/constants'
import { cn } from '@/lib/utils'
import type { ThaliFoodItem } from '../services/quick-order-service'

interface ChangeMealDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thalis: ThaliFoodItem[]
  selectedThaliId: string | null
  recentThaliId: string | null
  favoriteThaliId: string | null
  orderCounts: Record<string, number>
  onSelectThali: (thali: ThaliFoodItem) => void
}

export function ChangeMealDrawer({
  open,
  onOpenChange,
  thalis,
  selectedThaliId,
  recentThaliId,
  favoriteThaliId,
  orderCounts,
  onSelectThali,
}: ChangeMealDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Utensils className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Choose your Thali</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select your preferred daily meal option
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 pt-2">
          {thalis.map((thali) => {
            const isSelected = thali.id === selectedThaliId
            const isFavorite = thali.id === favoriteThaliId && (orderCounts[thali.id] ?? 0) > 1
            const isRecent = thali.id === recentThaliId && !isFavorite
            const count = orderCounts[thali.id] ?? 0

            return (
              <button
                key={thali.id}
                type="button"
                onClick={() => {
                  onSelectThali(thali)
                  onOpenChange(false)
                }}
                className={cn(
                  'w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 min-h-[58px]',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                    : 'border-border/70 hover:border-border hover:bg-neutral-50/80',
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      {thali.name}
                    </span>
                    {isFavorite ? (
                      <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-500/20 px-1.5 py-0">
                        <Sparkles className="size-2.5 mr-0.5 inline" />
                        Most Ordered ({count}x)
                      </Badge>
                    ) : isRecent ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                        Recent
                      </Badge>
                    ) : null}
                  </div>
                  {thali.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {thali.description}
                    </p>
                  ) : null}
                  <div className="text-xs font-bold text-primary mt-1">
                    {CURRENCY_SYMBOL}
                    {thali.price}
                  </div>
                </div>

                <div
                  className={cn(
                    'size-6 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'border-muted-foreground/30',
                  )}
                >
                  {isSelected ? <Check className="size-3.5 stroke-[3]" /> : null}
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
