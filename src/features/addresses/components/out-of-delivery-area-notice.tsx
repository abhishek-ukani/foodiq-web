import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

interface OutOfDeliveryAreaNoticeProps {
  pincode?: string | null
  formattedAddress?: string | null
  partyPhone?: string | null
  className?: string
}

/**
 * Clean, simple notice when an address is outside the individual meal delivery area.
 * Highlights:
 * 1. No delivery at this pincode
 * 2. Active serviceable areas
 * 3. Future expansion
 * 4. Simple link to Contact page for bulk/party catering
 */
export function OutOfDeliveryAreaNotice({
  pincode,
  formattedAddress,
  className,
}: OutOfDeliveryAreaNoticeProps) {
  const detectedPincode =
    pincode ||
    (formattedAddress ? formattedAddress.match(/\b(38\d{4})\b/)?.[1] : null) ||
    null

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-500/25 bg-amber-50/70 dark:bg-amber-950/20 p-3 sm:p-3.5 text-xs text-left space-y-2',
        className
      )}
    >
      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
        <AlertCircle className="size-4 text-amber-600 shrink-0" />
        <span>
          {detectedPincode
            ? `No delivery at Pincode ${detectedPincode}`
            : 'Outside Current Delivery Area'}
        </span>
      </div>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        We currently deliver individual meals only to select West Ahmedabad areas. We’re expanding to more areas soon!
      </p>

      <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-muted-foreground">
        Planning a bulk or party order?{' '}
        <Link
          to={ROUTES.contact}
          className="font-semibold text-primary underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5"
        >
          Contact us <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
