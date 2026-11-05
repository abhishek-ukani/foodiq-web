import { CURRENCY_SYMBOL } from '@/constants'
import { Check } from 'lucide-react'

export interface SabjiOption {
  id: string
  label: string
}

export interface GroupAddOnItem {
  id: string
  name: string
  price_delta: number
}

export function ItemCustomizationPicker({
  groupAddOns = [],
  availableSabjis = [],
  selectedIds,
  onToggle,
}: {
  groupAddOns?: GroupAddOnItem[]
  availableSabjis?: SabjiOption[]
  selectedIds: Set<string>
  onToggle: (id: string, dynamicDetails?: { name: string; price_delta: number }) => void
}) {
  const itemsToRender: {
    id: string
    name: string
    price_delta: number
    dynamicDetails?: { name: string; price_delta: number }
  }[] = []

  const addedNames = new Set<string>()

  // 1. Group add-ons configured via option groups (group_type = 'optional_addon')
  groupAddOns.forEach((ga) => {
    addedNames.add(ga.name.toLowerCase())
    itemsToRender.push({
      id: ga.id,
      name: ga.name,
      price_delta: Number(ga.price_delta || 0),
      dynamicDetails: {
        name: ga.name,
        price_delta: Number(ga.price_delta || 0),
      },
    })
  })

  // 2. Dynamically append Extra Sabjis for today's available rotating sabjis if not already present
  if (availableSabjis.length > 0) {
    availableSabjis.forEach((sabji) => {
      const virtualId = `dynamic_extra_sabji__${sabji.id}`
      const dynamicName = `Extra ${sabji.label}`
      if (!addedNames.has(dynamicName.toLowerCase())) {
        addedNames.add(dynamicName.toLowerCase())
        itemsToRender.push({
          id: virtualId,
          name: dynamicName,
          price_delta: 40,
          dynamicDetails: {
            name: dynamicName,
            price_delta: 40,
          },
        })
      }
    })
  }

  if (!itemsToRender.length) return null

  return (
    <div className="border-t border-gray-100">
      {/* Section header */}
      <div className="flex items-center justify-between py-1.5">
        <span className="text-xs font-bold text-gray-800">Add-ons</span>
        <span className="text-[10px] font-medium text-gray-400">Optional</span>
      </div>

      {/* Add-on chips */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {itemsToRender.map((c) => {
          const isSelected = selectedIds.has(c.id)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id, c.dynamicDetails)}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold min-h-[36px]
                border transition-all duration-150 cursor-pointer select-none
                ${isSelected
                  ? 'bg-primary border-primary text-primary-foreground shadow-2xs'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
                }
              `}
            >
              {isSelected && <Check className="size-3.5 stroke-[2.5] shrink-0" />}
              <span>{c.name}</span>
              <span className={`text-[10px] font-bold ${isSelected ? 'text-primary-foreground/90' : 'text-primary'}`}>
                +{CURRENCY_SYMBOL}{c.price_delta}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
