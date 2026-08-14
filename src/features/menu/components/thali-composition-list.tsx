import { Check } from 'lucide-react'
import type { ThaliComponent } from '@/features/menu/services/menu-service'

export function ThaliCompositionList({ items }: { items: ThaliComponent[] }) {
  if (!items.length) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">What's included</p>
      <ul className="space-y-1.5">
        {items.map((component) => (
          <li key={component.id} className="flex items-center gap-2 text-sm">
            <Check className="text-primary size-3.5 shrink-0" aria-hidden />
            <span className="text-muted-foreground">
              {component.quantity > 1 ? `${component.quantity}× ` : ''}
              {component.custom_name ?? component.food_items?.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
