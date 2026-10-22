import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FloatingInputProps extends React.ComponentProps<'input'> {
  label: string
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, value, defaultValue, placeholder, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="relative w-full">
        <input
          id={inputId}
          ref={ref}
          value={value ?? ''}
          placeholder=" "
          className={cn(
            "peer flex h-12 w-full min-w-0 rounded-xl border-2 border-slate-300 bg-white px-3.5 pt-3 pb-1 text-sm font-medium shadow-xs transition-all duration-150 outline-none text-slate-900 hover:border-slate-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
            "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
            "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
            className
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 top-0 -translate-y-1/2 bg-white px-1.5 text-xs font-semibold text-slate-600 transition-all duration-150 pointer-events-none max-w-[calc(100%-1.5rem)] truncate z-10",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
