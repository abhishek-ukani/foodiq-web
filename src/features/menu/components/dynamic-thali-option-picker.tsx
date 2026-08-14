import { useEffect, useState } from 'react'
import { AlertCircle, Clock, Check } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants'
import {
  fetchThaliOptionGroups,
  type ResolvedOptionGroup,
  type ResolvedOptionItem,
} from '../services/thali-customizer-service'

interface DynamicThaliOptionPickerProps {
  foodItemId: string
  onSelectionChange: (selections: Record<string, string[]>, isValid: boolean) => void
}

// Food emoji helper mapping for modern option cards
function getOptionEmoji(label: string, groupName: string): string {
  const lowerLabel = label.toLowerCase()
  const lowerGroup = groupName.toLowerCase()

  if (lowerLabel.includes('roti') || lowerLabel.includes('phulka')) return '🍞'
  if (lowerLabel.includes('bhakhri') || lowerLabel.includes('paratha') || lowerLabel.includes('puri')) return '🫓'
  if (lowerLabel.includes('salad')) return '🥗'
  if (lowerLabel.includes('gud') || lowerLabel.includes('jaggery')) return '🍯'
  if (lowerLabel.includes('aachar') || lowerLabel.includes('pickle')) return '🥒'
  if (lowerLabel.includes('papad')) return '🍘'
  if (lowerLabel.includes('fryums') || lowerLabel.includes('chewdo') || lowerLabel.includes('snack')) return '🍿'
  if (lowerLabel.includes('chhas') || lowerLabel.includes('buttermilk') || lowerLabel.includes('lassi')) return '🥤'
  if (lowerLabel.includes('sweet') || lowerLabel.includes('gulab') || lowerLabel.includes('halwa')) return '🍨'

  if (lowerGroup.includes('sabji') || lowerGroup.includes('curry') || lowerGroup.includes('dal')) return '🍛'
  if (lowerGroup.includes('bread') || lowerGroup.includes('roti')) return '🍞'
  if (lowerGroup.includes('snack')) return '🍿'
  if (lowerGroup.includes('accompaniment')) return '🥗'

  return '🍽️'
}

function getOptionSubtext(label: string): string {
  const lower = label.toLowerCase()
  if (lower.includes('roti')) return 'Soft & freshly made wheat rotis'
  if (lower.includes('bhakhri')) return 'Crispy traditional Gujarati bhakhri'
  if (lower.includes('salad')) return 'Fresh cucumber & tomato salad'
  if (lower.includes('gud')) return 'Pure organic jaggery'
  if (lower.includes('aachar')) return 'Homestyle spicy mango pickle'
  if (lower.includes('fryums')) return 'Crispy fried crunchy wafers'
  if (lower.includes('chewdo')) return 'Gujarati roasted Mamra mix'
  if (lower.includes('papad')) return 'Roasted urad papad'
  return 'Freshly prepared daily'
}

export function DynamicThaliOptionPicker({
  foodItemId,
  onSelectionChange,
}: DynamicThaliOptionPickerProps) {
  const [groups, setGroups] = useState<ResolvedOptionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchThaliOptionGroups(foodItemId).then((resGroups) => {
      if (!isMounted) return
      setGroups(resGroups)

      const initialMap: Record<string, string[]> = {}
      resGroups.forEach((grp) => {
        const defaultOptions = grp.options.filter((o) => o.is_default && o.is_available)
        if (defaultOptions.length > 0) {
          initialMap[grp.id] = defaultOptions.slice(0, grp.max_select).map((o) => o.id)
        } else if (grp.is_required && grp.options.length > 0) {
          const firstAvailable = grp.options.find((o) => o.is_available)
          if (firstAvailable) {
            initialMap[grp.id] = [firstAvailable.id]
          }
        }
      })

      setSelectedMap(initialMap)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [foodItemId])

  // Validate all required groups have valid selection counts
  useEffect(() => {
    let valid = true
    groups.forEach((grp) => {
      const selected = selectedMap[grp.id] || []
      if (grp.is_required && selected.length < grp.min_select) {
        valid = false
      }
    })
    onSelectionChange(selectedMap, valid)
  }, [selectedMap, groups, onSelectionChange])

  const handleSelectOption = (groupId: string, option: ResolvedOptionItem, maxSelect: number) => {
    if (!option.is_available || option.is_cutoff_closed) return

    setSelectedMap((prev) => {
      const current = prev[groupId] || []
      const isSelected = current.includes(option.id)

      if (maxSelect === 1) {
        return { ...prev, [groupId]: [option.id] }
      }

      if (isSelected) {
        return { ...prev, [groupId]: current.filter((id) => id !== option.id) }
      } else {
        if (current.length < maxSelect) {
          return { ...prev, [groupId]: [...current, option.id] }
        }
        return prev
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <div className="h-32 rounded-2xl bg-white/60 animate-pulse border border-[#E7E7E7]" />
        <div className="h-32 rounded-2xl bg-white/60 animate-pulse border border-[#E7E7E7]" />
      </div>
    )
  }

  if (!groups.length) return null

  return (
    <div className="space-y-6">
      {groups.map((grp) => {
        const selectedIds = selectedMap[grp.id] || []
        const isSingleSelect = grp.max_select === 1
        const count = selectedIds.length
        const isComplete = !grp.is_required || count >= grp.min_select

        // Badge Status Text
        let statusBadgeText = ''
        if (grp.max_select === 1) {
          statusBadgeText = grp.is_required ? 'Required • Pick 1' : 'Optional • Pick 1'
        } else {
          statusBadgeText = `Selected ${count} of ${grp.max_select}`
        }

        return (
          <div
            key={grp.id}
            className="bg-white rounded-2xl p-5 border border-[#E7E7E7] shadow-xs space-y-4 transition-all hover:shadow-md"
          >
            {/* Header: Title Left, Badge Right */}
            <div className="flex items-center justify-between gap-2 border-b border-[#E7E7E7]/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1D] flex items-center gap-1.5">
                  {grp.name}
                  {grp.is_required && <span className="text-[#D32F2F] text-sm">*</span>}
                </h3>
                {grp.description && (
                  <p className="text-xs text-[#666666] mt-0.5">{grp.description}</p>
                )}
              </div>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  isComplete
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FFF8E8] text-[#855B14]'
                }`}
              >
                {statusBadgeText}
              </span>
            </div>

            {/* Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grp.options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id)
                const isDisabled = !opt.is_available || opt.is_cutoff_closed
                const emoji = getOptionEmoji(opt.label, grp.name)
                const subtext = getOptionSubtext(opt.label)

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectOption(grp.id, opt, grp.max_select)}
                    className={`relative flex items-start justify-between gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#2E7D32] bg-[#E8F5E9] shadow-xs'
                        : 'border-[#E7E7E7] bg-white hover:border-[#2E7D32]/50 hover:shadow-xs'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed bg-[#F8F7F4]' : ''}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">{emoji}</span>

                      <div className="space-y-0.5 min-w-0">
                        <span className="text-sm font-semibold text-[#1D1D1D] block truncate">
                          {opt.label}
                        </span>
                        <span className="text-xs text-[#666666] block line-clamp-1">
                          {subtext}
                        </span>
                        {opt.is_cutoff_closed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 pt-0.5">
                            <Clock className="size-3 shrink-0" /> Overnight closed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0 h-full self-stretch">
                      {/* Checkmark Indicator */}
                      <div
                        className={`size-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32] text-white scale-100'
                            : 'border border-[#E7E7E7] bg-white scale-90 opacity-60'
                        }`}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[3]" />}
                      </div>

                      {opt.price_delta > 0 && (
                        <span className="text-xs font-bold text-[#2E7D32] mt-auto pt-2 tabular-nums">
                          +{CURRENCY_SYMBOL}{opt.price_delta}
                        </span>
                      )}
                    </div>
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
