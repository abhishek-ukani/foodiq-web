import { useEffect, useState, useRef } from 'react'
import { Clock, Check } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants'
import {
  fetchThaliOptionGroups,
  type ResolvedOptionGroup,
  type ResolvedOptionItem,
} from '../services/thali-customizer-service'

export function isAddOnGroup(grp: { name: string }) {
  const n = grp.name.toLowerCase()
  return n.includes('add-on') || n.includes('addon')
}

interface DynamicThaliOptionPickerProps {
  foodItemId: string
  selectedDate?: string
  mealType?: string
  onSelectionChange: (selections: Record<string, string[]>, isValid: boolean) => void
  onSabjiOptionsLoaded?: (sabjis: { id: string; label: string }[]) => void
  onAddOnOptionsLoaded?: (addOns: { id: string; name: string; price_delta: number }[]) => void
}

export function DynamicThaliOptionPicker({
  foodItemId,
  selectedDate,
  mealType,
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

      const sabjiGroup = resGroups.find((g) => {
        const n = g.name.toLowerCase()
        return (
          n.includes('sabji') ||
          n.includes('shabji') ||
          n.includes('sabzi') ||
          n.includes('subji') ||
          n.includes('curry') ||
          (g as any).target_category_type === 'sabji'
        )
      })
      if (sabjiGroup && sabjiCallbackRef.current) {
        const avail = sabjiGroup.options
          .filter((o) => o.is_available && !o.is_cutoff_closed)
          .map((o) => ({ id: o.id, label: o.label }))
        sabjiCallbackRef.current(avail)
      }

      // Collect add-on items from option groups named Add-Ons to merge into bottom Add-ons section
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
    groups.forEach((grp) => {
      if (!isAddOnGroup(grp) && grp.is_required && (selectedMap[grp.id] || []).length < grp.min_select) {
        valid = false
      }
    })
    selectionCallbackRef.current(selectedMap, valid)
  }, [selectedMap, groups])

  const handleSelect = (groupId: string, option: ResolvedOptionItem, maxSelect: number) => {
    if (!option.is_available || option.is_cutoff_closed) return
    setSelectedMap((prev) => {
      const current = prev[groupId] || []
      const isSelected = current.includes(option.id)
      if (maxSelect === 1) return { ...prev, [groupId]: [option.id] }
      if (isSelected) return { ...prev, [groupId]: current.filter((id) => id !== option.id) }
      if (current.length < maxSelect) return { ...prev, [groupId]: [...current, option.id] }
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
            : `Pick up to ${grp.max_select}`

        return (
          <div
            key={grp.id}
            className={idx !== 0 ? 'border-t border-gray-100' : ''}
          >
            {/* Section header */}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-gray-800">
                {grp.name}
                {grp.is_required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
              <span className="text-xs font-medium text-gray-400">{pickLabel}</span>
            </div>

            {/* Options list */}
            <div className="flex flex-wrap gap-2 pb-3">
              {grp.options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id)
                const isDisabled = !opt.is_available || opt.is_cutoff_closed

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelect(grp.id, opt, grp.max_select)}
                    className={`
                      inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                      border-2 transition-all duration-150 cursor-pointer select-none
                      ${isDisabled
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                        : isSelected
                        ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#2E7D32] hover:text-[#2E7D32]'
                      }
                    `}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[2.5] shrink-0" />}
                    <span>{opt.label}</span>
                    {opt.is_cutoff_closed && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-normal">
                        <Clock className="size-3" /> Closed
                      </span>
                    )}
                    {opt.price_delta > 0 && (
                      <span className={`text-xs font-semibold ${isSelected ? 'text-green-200' : 'text-[#2E7D32]'}`}>
                        +{CURRENCY_SYMBOL}{opt.price_delta}
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
