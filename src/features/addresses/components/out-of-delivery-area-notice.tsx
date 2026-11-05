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
    (formattedAddress ? formattedAddress.match(/\b([1-9]\d{5})\b/)?.[1] : null) ||
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
            ? `Pincode ${detectedPincode} · Outside Daily Meal Delivery Area`
            : 'Outside Daily Meal Delivery Area'}
        </span>
      </div>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Individual daily meals are currently delivered to select <strong>West Ahmedabad areas</strong> (Bodakdev, Vastrapur, Thaltej, Prahlad Nagar, Satellite, Bopal, SG Highway). 
        However, for <strong>bulk and party orders, we deliver across all of Ahmedabad!</strong>
      </p>

      <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-muted-foreground">
        Need a bulk or party order anywhere in Ahmedabad?{' '}
        <Link
          to={ROUTES.contact}
          className="font-semibold text-primary underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5"
        >
          Contact our catering team <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
