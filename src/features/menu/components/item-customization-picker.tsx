import type { Tables } from '@/types/database.types'
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
  customizations = [],
  groupAddOns = [],
  availableSabjis = [],
  selectedIds,
  onToggle,
}: {
  customizations?: Tables<'item_customizations'>[]
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

  // 1. If groupAddOns exist (configured via thali_option_groups), use them as primary source of add-ons
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

  // 2. Only fallback to legacy item_customizations table if no groupAddOns were configured
  let hasSabjiInCustomizations = false
  if (groupAddOns.length === 0) {
    customizations.forEach((c) => {
      const isSabjiCustomization =
        c.name.toLowerCase().includes('sabji') ||
        c.name.toLowerCase().includes('shabji') ||
        c.name.toLowerCase().includes('sabzi') ||
        c.name.toLowerCase().includes('shaak')

      if (isSabjiCustomization) {
        hasSabjiInCustomizations = true
        if (availableSabjis.length > 0) {
          availableSabjis.forEach((sabji) => {
            const virtualId = `${c.id}__sabji__${sabji.id}`
            const dynamicName = `Extra ${sabji.label}`
            if (!addedNames.has(dynamicName.toLowerCase())) {
              addedNames.add(dynamicName.toLowerCase())
              itemsToRender.push({
                id: virtualId,
                name: dynamicName,
                price_delta: Number(c.price_delta || 40),
                dynamicDetails: {
                  name: dynamicName,
                  price_delta: Number(c.price_delta || 40),
                },
              })
            }
          })
        }
      } else {
        if (!addedNames.has(c.name.toLowerCase())) {
          addedNames.add(c.name.toLowerCase())
          itemsToRender.push({
            id: c.id,
            name: c.name,
            price_delta: Number(c.price_delta || 0),
          })
        }
      }
    })
  }

  // 3. Always append dynamic Extra Sabjis for available daily Sabjis if not already included
  if (!hasSabjiInCustomizations && availableSabjis.length > 0) {
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
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-bold text-gray-800">Add-ons</span>
        <span className="text-xs font-medium text-gray-400">Optional</span>
      </div>

      {/* Add-on chips */}
      <div className="flex flex-wrap gap-2 pb-3">
        {itemsToRender.map((c) => {
          const isSelected = selectedIds.has(c.id)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id, c.dynamicDetails)}
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
