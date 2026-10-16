import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FloatingInput } from '@/components/ui/floating-input'
import { Badge } from '@/components/ui/badge'
import type { GooglePlacePrediction } from '@/features/addresses/hooks/use-google-places'

export interface ZoneTypeaheadItem {
  id: number | string
  name: string
  area_hint?: string | null
  pincode?: string | null
  delivery_charge?: number
}

interface ZoneTypeaheadProps<T extends ZoneTypeaheadItem> {
  items: T[]
  value: string
  selectedId: number | string | null
  onChangeText: (text: string) => void
  onSelect: (item: T) => void
  onClear: () => void
  googlePredictions?: GooglePlacePrediction[]
  onSelectGooglePlace?: (prediction: GooglePlacePrediction) => void
  placeholder?: string
  label?: string
  id?: string
}

export function ZoneTypeahead<T extends ZoneTypeaheadItem>({
  items,
  value,
  selectedId,
  onChangeText,
  onSelect,
  onClear,
  googlePredictions = [],
  onSelectGooglePlace,
  placeholder = 'Type to search...',
  label,
  id,
}: ZoneTypeaheadProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isMatched = selectedId !== null && selectedId !== undefined

  // Filter local items matching user text
  const filtered = value.trim()
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase().trim()) ||
          item.area_hint?.toLowerCase().includes(value.toLowerCase().trim()),
      )
    : items

  const hasLocal = filtered.length > 0
  const hasGoogle = googlePredictions.length > 0

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        {label ? (
          <FloatingInput
            id={id}
            label={label}
            value={value}
            onChange={(e) => {
              onChangeText(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className={`pr-16 ${isMatched ? 'border-emerald-500 bg-emerald-500/5 focus-visible:ring-emerald-500' : ''}`}
          />
        ) : (
          <Input
            id={id}
            value={value}
            onChange={(e) => {
              onChangeText(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`pr-16 ${isMatched ? 'border-emerald-500 bg-emerald-500/5 focus-visible:ring-emerald-500' : ''}`}
          />
        )}

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
          {isMatched ? (
            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 gap-1 text-[11px] font-medium px-1.5 py-0.5">
              <Check className="size-3 text-emerald-600" /> Matched
            </Badge>
          ) : null}

          {value ? (
            <button
              type="button"
              onClick={() => {
                onClear()
                setIsOpen(false)
              }}
              className="text-muted-foreground hover:text-foreground rounded p-1"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <ChevronDown className="text-muted-foreground size-3.5 pointer-events-none" />
          )}
        </div>
      </div>

      {isOpen && (hasLocal || hasGoogle) && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md text-sm">
          {hasLocal && (
            <>
              {hasGoogle && (
                <li className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  Verified Local Delivery Zones
                </li>
              )}
              {filtered.slice(0, 10).map((item) => (
                <li
                  key={item.id}
                  onClick={() => {
                    onSelect(item)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between cursor-pointer rounded-sm px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground ${
                    selectedId === item.id ? 'bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.area_hint && (
                      <p className="text-muted-foreground text-[10px]">Area: {item.area_hint}</p>
                    )}
                  </div>
                  {item.delivery_charge !== undefined && (
                    <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.delivery_charge === 0 ? 'Free' : `₹${item.delivery_charge}`}
                    </span>
                  )}
                </li>
              ))}
            </>
          )}

          {hasGoogle && (
            <>
              <li className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-t mt-1 pt-1">
                Google Maps Locations
              </li>
              {googlePredictions.slice(0, 5).map((pred) => (
                <li
                  key={pred.placeId}
                  onClick={() => {
                    if (onSelectGooglePlace) {
                      onSelectGooglePlace(pred)
                    }
                    setIsOpen(false)
                  }}
                  className="flex items-start gap-2 cursor-pointer rounded-sm px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground"
                >
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{pred.mainText}</p>
                    <p className="text-muted-foreground text-[10px] truncate">{pred.secondaryText || pred.description}</p>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  )
}
