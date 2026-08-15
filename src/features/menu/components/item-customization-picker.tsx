import type { Tables } from '@/types/database.types'
import { CURRENCY_SYMBOL } from '@/constants'
import { Check } from 'lucide-react'

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
    <div className="border-t border-gray-100">
      {/* Section header */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-bold text-gray-800">Add-ons</span>
        <span className="text-xs font-medium text-gray-400">Optional</span>
      </div>

      {/* Add-on chips */}
      <div className="flex flex-wrap gap-2 pb-3">
        {customizations.map((c) => {
          const isSelected = selectedIds.has(c.id)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                border-2 transition-all duration-150 cursor-pointer select-none
                ${isSelected
                  ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#2E7D32] hover:text-[#2E7D32]'
                }
              `}
            >
              {isSelected && <Check className="size-3.5 stroke-[2.5] shrink-0" />}
              <span>{c.name}</span>
              <span className={`text-xs font-semibold ${isSelected ? 'text-green-200' : 'text-[#2E7D32]'}`}>
                +{CURRENCY_SYMBOL}{c.price_delta}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
