import { useEffect, useState } from 'react'
import { Clock, Check } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants'
import {
  fetchThaliOptionGroups,
  type ResolvedOptionGroup,
  type ResolvedOptionItem,
} from '../services/thali-customizer-service'

interface DynamicThaliOptionPickerProps {
  foodItemId: string
  selectedDate?: string
  mealType?: string
  onSelectionChange: (selections: Record<string, string[]>, isValid: boolean) => void
}

export function DynamicThaliOptionPicker({
  foodItemId,
  selectedDate,
  mealType,
  onSelectionChange,
}: DynamicThaliOptionPickerProps) {
  const [groups, setGroups] = useState<ResolvedOptionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchThaliOptionGroups(foodItemId, selectedDate, mealType).then((resGroups) => {
      if (!isMounted) return
      setGroups(resGroups)

      const initialMap: Record<string, string[]> = {}
      resGroups.forEach((grp) => {
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
    return () => { isMounted = false }
  }, [foodItemId, selectedDate, mealType])

  useEffect(() => {
    let valid = true
    groups.forEach((grp) => {
      if (grp.is_required && (selectedMap[grp.id] || []).length < grp.min_select) {
        valid = false
      }
    })
    onSelectionChange(selectedMap, valid)
  }, [selectedMap, groups, onSelectionChange])

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

  if (!groups.length) return null

  return (
    <div>
      {groups.map((grp, idx) => {
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

            {/* Chip row */}
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
                      border-2 transition-all duration-150 select-none
                      ${isSelected
                        ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
                        : isDisabled
                          ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-[#2E7D32] hover:text-[#2E7D32] cursor-pointer'
                      }
                    `}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[2.5] shrink-0" />}
                    <span>{opt.label}</span>
                    {opt.is_cutoff_closed && <Clock className="size-3 shrink-0 opacity-60" />}
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
