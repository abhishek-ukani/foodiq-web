import { useEffect, useState, useRef } from 'react'
import { Clock, Check } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants'
import {
  fetchThaliOptionGroups,
  type ResolvedOptionGroup,
  type ResolvedOptionItem,
} from '../services/thali-customizer-service'

export function isAddOnGroup(grp: ResolvedOptionGroup) {
  if (grp.categories?.slug === 'add-ons') return true
  if (!grp.is_required && grp.categories?.slug !== 'bread' && grp.categories?.slug !== 'sabji') {
    return true
  }
  const n = grp.name.toLowerCase()
  return n.includes('add-on') || n.includes('addon') || n.includes('extra')
}

export interface SelectedDynamicOptionItem {
  id: string
  name: string
  price_delta: number
  group_name?: string
  quantity?: number
}

interface DynamicThaliOptionPickerProps {
  foodItemId: string
  selectedDate?: string
  mealType?: string
  dietaryPreference?: 'all' | 'jain' | 'swaminarayan'
  onSelectionChange: (
    selections: Record<string, string[]>,
    isValid: boolean,
    selectedItems?: SelectedDynamicOptionItem[],
  ) => void
  onSabjiOptionsLoaded?: (sabjis: { id: string; label: string }[]) => void
  onAddOnOptionsLoaded?: (addOns: { id: string; name: string; price_delta: number }[]) => void
}

export function DynamicThaliOptionPicker({
  foodItemId,
  selectedDate,
  mealType,
  dietaryPreference = 'all',
  onSelectionChange,
  onSabjiOptionsLoaded,
  onAddOnOptionsLoaded,
}: DynamicThaliOptionPickerProps) {
  const [groups, setGroups] = useState<ResolvedOptionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({})

  const sabjiCallbackRef = useRef(onSabjiOptionsLoaded)
  const addOnCallbackRef = useRef(onAddOnOptionsLoaded)
  const selectionCallbackRef = useRef(onSelectionChange)

  useEffect(() => {
    sabjiCallbackRef.current = onSabjiOptionsLoaded
    addOnCallbackRef.current = onAddOnOptionsLoaded
    selectionCallbackRef.current = onSelectionChange
  })

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchThaliOptionGroups(foodItemId, selectedDate, mealType).then((resGroups) => {
      if (!isMounted) return
      setGroups(resGroups)

      // Find sabji group by category foreign key or dynamic flag (no phonetic string hacks)
      const sabjiGroup = resGroups.find(
        (g) => g.is_daily_menu_source || g.categories?.slug === 'sabji',
      )
      if (sabjiGroup && sabjiCallbackRef.current) {
        const avail = sabjiGroup.options
          .filter((o) => o.is_available && !o.is_cutoff_closed)
          .map((o) => ({ id: o.id, label: o.label }))
        sabjiCallbackRef.current(avail)
      }

      // Collect add-on items to merge into add-ons section
      if (addOnCallbackRef.current) {
        const addOnGroups = resGroups.filter((g) => isAddOnGroup(g))
        const extractedAddOns = addOnGroups.flatMap((g) =>
          g.options
            .filter((o) => o.is_available && !o.is_cutoff_closed)
            .map((o) => ({
              id: o.id,
              name: o.label,
              price_delta: Number(o.price_delta || 0),
            })),
        )
        addOnCallbackRef.current(extractedAddOns)
      }

      const initialMap: Record<string, string[]> = {}
      resGroups.forEach((grp) => {
        if (isAddOnGroup(grp)) return
        const defaults = grp.options.filter((o) => o.is_default && o.is_available)
        if (defaults.length > 0) {
          initialMap[grp.id] = defaults.slice(0, grp.max_select).map((o) => o.id)
        } else if (grp.is_required && grp.options.length > 0) {
          const first = grp.options.find((o) => o.is_available)
          if (first) initialMap[grp.id] = [first.id]
        }
      })

      setSelectedMap(initialMap)
      setLoading(false)
    })
    return () => {
      isMounted = false
    }
  }, [foodItemId, selectedDate, mealType])

  useEffect(() => {
    let valid = true
    const selectedItems: SelectedDynamicOptionItem[] = []

    groups.forEach((grp) => {
      if (!isAddOnGroup(grp) && grp.is_required && (selectedMap[grp.id] || []).length < grp.min_select) {
        valid = false
      }

      const pickedIds = selectedMap[grp.id] || []
      // Group duplicates to count quantity
      const countMap: Record<string, number> = {}
      pickedIds.forEach((id) => {
        countMap[id] = (countMap[id] || 0) + 1
      })

      Object.entries(countMap).forEach(([id, qty]) => {
        const opt = grp.options.find((o) => o.id === id)
        if (opt) {
          selectedItems.push({
            id: opt.id,
            name: `${qty > 1 ? `${qty}x ` : ''}${opt.label}`,
            price_delta: Number(opt.price_delta || 0) * qty,
            group_name: grp.name,
            quantity: qty,
          })
        }
      })
    })

    selectionCallbackRef.current(selectedMap, valid, selectedItems)
  }, [selectedMap, groups])

  const handleSelect = (grp: ResolvedOptionGroup, option: ResolvedOptionItem) => {
    if (!option.is_available || option.is_cutoff_closed) return
    const groupId = grp.id
    const maxSelect = grp.max_select

    setSelectedMap((prev) => {
      const current = prev[groupId] || []
      const occurences = current.filter((id) => id !== option.id ? false : true).length

      if (maxSelect === 1) {
        return { ...prev, [groupId]: [option.id] }
      }

      if (occurences > 0) {
        // If duplicates are allowed and we still have capacity, tap again adds a 2nd portion!
        if (grp.allow_duplicate_selection && current.length < maxSelect && occurences < maxSelect) {
          return { ...prev, [groupId]: [...current, option.id] }
        }
        // Otherwise clicking deselects all instances of this item
        return { ...prev, [groupId]: current.filter((id) => id !== option.id) }
      }

      if (current.length < maxSelect) {
        return { ...prev, [groupId]: [...current, option.id] }
      }

      return prev
    })
  }

  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2.5">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Only render main Thali choice groups at top (exclude Add-on groups)
  const mainChoiceGroups = groups.filter((g) => !isAddOnGroup(g))
  if (!mainChoiceGroups.length) return null

  return (
    <div>
      {mainChoiceGroups.map((grp, idx) => {
        const selectedIds = selectedMap[grp.id] || []
        const pickLabel =
          grp.max_select === 1
            ? 'Pick 1'
            : `Pick ${grp.min_select === grp.max_select ? grp.max_select : `up to ${grp.max_select}`}${
                grp.allow_duplicate_selection ? ' (same item allowed)' : ''
              }`

        // Filter options dynamically by dietary preference (Jain / Swaminarayan)
        const visibleOptions = grp.options.filter((opt) => {
          if (dietaryPreference === 'jain') return opt.is_jain_available
          if (dietaryPreference === 'swaminarayan') return opt.is_swaminarayan_available
          return true
        })

        return (
          <div
            key={grp.id}
            className={idx !== 0 ? 'border-t border-gray-100' : ''}
          >
            {/* Section header */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs font-bold text-gray-800">
                {grp.name}
                {grp.is_required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
              <span className="text-[10px] font-medium text-gray-400">{pickLabel}</span>
            </div>

            {/* Options list */}
            <div className="flex flex-wrap gap-1.5 pb-2">
              {visibleOptions.map((opt) => {
                const count = selectedIds.filter((id) => id === opt.id).length
                const isSelected = count > 0
                const isDisabled = !opt.is_available || opt.is_cutoff_closed

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelect(grp, opt)}
                    className={`
                      inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold min-h-[36px]
                      border transition-all duration-150 cursor-pointer select-none
                      ${isDisabled
                        ? 'opacity-50 cursor-not-allowed bg-muted border-border text-muted-foreground'
                        : isSelected
                        ? 'bg-primary border-primary text-primary-foreground shadow-2xs'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
                      }
                    `}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[2.5] shrink-0" />}
                    <span>{opt.label}</span>
                    {count > 1 && (
                      <span className="bg-primary-foreground text-primary rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                        {count}x
                      </span>
                    )}
                    {opt.is_cutoff_closed && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full font-normal">
                        <Clock className="size-2.5" /> Closed
                      </span>
                    )}
                    {opt.price_delta > 0 && (
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-primary-foreground/90' : 'text-primary'}`}>
                        +{CURRENCY_SYMBOL}{opt.price_delta * (count || 1)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
