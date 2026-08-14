import { Checkbox } from '@/components/ui/checkbox'
import type { Tables } from '@/types/database.types'
import { CURRENCY_SYMBOL } from '@/constants'

export function ItemCustomizationPicker({
  customizations,
  selectedIds,
  onToggle,
}: {
  customizations: Tables<'item_customizations'>[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  if (!customizations.length) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Add-ons</p>
      <div className="space-y-1.5 rounded-lg border p-3">
        {customizations.map((c) => (
          <label
            key={c.id}
            className="flex cursor-pointer items-center justify-between gap-3 py-0.5 text-sm"
          >
            <span className="flex items-center gap-2.5">
              <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => onToggle(c.id)} />
              {c.name}
            </span>
            <span className="text-muted-foreground shrink-0 tabular-nums">
              +{CURRENCY_SYMBOL}
              {c.price_delta}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
