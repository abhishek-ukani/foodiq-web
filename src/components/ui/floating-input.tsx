import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FloatingInputProps extends React.ComponentProps<'input'> {
  label: string
  /** @deprecated no longer used — kept for API compatibility */
  labelBg?: string
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, labelBg: _labelBg, id, value, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="flex flex-col w-full gap-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-muted-foreground leading-none px-0.5"
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          value={value ?? ''}
          className={cn(
            // Base
            "flex h-11 w-full rounded-xl border border-slate-300 bg-white/60 px-3.5 py-2.5",
            "text-sm font-medium text-foreground placeholder:text-muted-foreground/60",
            // Interactions
            "outline-none transition-all duration-150",
            "hover:border-slate-400 hover:bg-white/80",
            "focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white",
            // Validation
            "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-55 disabled:bg-muted/40",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
