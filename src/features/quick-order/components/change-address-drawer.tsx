import { useState } from 'react'
import { Check, Home, Briefcase, MapPin, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddressFlowDialog } from '@/features/addresses/components/address-flow-dialog'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database.types'

interface ChangeAddressDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addresses: Tables<'addresses'>[]
  selectedAddressId: string | null
  onSelectAddress: (address: Tables<'addresses'>) => void
  onAddressCreated?: (address: Tables<'addresses'>) => void
}

function getAddressIcon(label?: string | null) {
  switch (label?.toLowerCase()) {
    case 'home':
      return <Home className="size-4" />
    case 'work':
    case 'office':
      return <Briefcase className="size-4" />
    default:
      return <MapPin className="size-4" />
  }
}

export function ChangeAddressDrawer({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressCreated,
}: ChangeAddressDrawerProps) {
  const [newAddressDialogOpen, setNewAddressDialogOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Delivery Address</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select where you want your meal delivered
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2.5 pt-2">
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId

              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    onSelectAddress(addr)
                    onOpenChange(false)
                  }}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 min-h-[58px]',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                      : 'border-border/70 hover:border-border hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40',
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="mt-0.5 text-primary shrink-0">
                      {getAddressIcon(addr.label)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm capitalize text-foreground">
                          {addr.label || 'Address'}
                        </span>
                        {addr.is_default ? (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                            Default
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                        {addr.landmark ? `, ${addr.landmark}` : ''}
                        {addr.pincode ? ` - ${addr.pincode}` : ''}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {isSelected ? <Check className="size-3 stroke-[3]" /> : null}
                  </div>
                </button>
              )
            })}

            <Button
              type="button"
              variant="outline"
              onClick={() => setNewAddressDialogOpen(true)}
              className="w-full mt-2 rounded-xl h-12 border-dashed flex items-center justify-center gap-2"
            >
              <Plus className="size-4" />
              <span>Add New Address</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddressFlowDialog
        open={newAddressDialogOpen}
        onOpenChange={setNewAddressDialogOpen}
        onSaved={(newAddr) => {
          if (newAddr) {
            onSelectAddress(newAddr)
            onAddressCreated?.(newAddr)
            onOpenChange(false)
          }
        }}
      />
    </>
  )
}
