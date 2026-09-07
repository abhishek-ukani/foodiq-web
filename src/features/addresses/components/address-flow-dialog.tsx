import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapLocationPicker, type PinnedLocationData } from '@/features/addresses/components/map-location-picker'
import { AddressForm } from '@/features/addresses/components/address-form'
import type { Tables } from '@/types/database.types'

interface AddressFlowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addressToEdit?: Tables<'addresses'> | null
  onSaved: (savedAddress: Tables<'addresses'> | null) => void
}

export function AddressFlowDialog({
  open,
  onOpenChange,
  addressToEdit,
  onSaved,
}: AddressFlowDialogProps) {
  // Always start at manual form ('details') first per UX requirement
  const [step, setStep] = useState<'details' | 'map'>('details')
  const [pinnedLocation, setPinnedLocation] = useState<PinnedLocationData | null>(null)
  const [mapTargetLocation, setMapTargetLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (open) {
      setStep('details')
      setPinnedLocation(null)
      setMapTargetLocation(null)
    }
  }, [open, addressToEdit])

  const handleOpenMap = (loc?: {
    latitude: number
    longitude: number
    buildingName?: string
    roadName?: string
    sublocality?: string
    pincode?: string
    formattedAddress?: string
  }) => {
    if (loc && loc.latitude && loc.longitude) {
      setMapTargetLocation({ lat: loc.latitude, lng: loc.longitude })
    } else if (pinnedLocation) {
      setMapTargetLocation({ lat: pinnedLocation.latitude, lng: pinnedLocation.longitude })
    } else if (addressToEdit?.latitude && addressToEdit?.longitude) {
      setMapTargetLocation({
        lat: Number(addressToEdit.latitude),
        lng: Number(addressToEdit.longitude),
      })
    } else {
      setMapTargetLocation(null)
    }
    setStep('map')
  }

  const handleConfirmLocation = (location: PinnedLocationData) => {
    setPinnedLocation({ ...location })
    setStep('details')
  }

  const handleAddressSaved = (address: Tables<'addresses'> | null) => {
    onSaved(address)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl md:max-w-6xl w-[95vw] h-[88vh] max-h-[88vh] p-0 overflow-hidden sm:rounded-2xl border bg-background shadow-2xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {step === 'map' ? 'Select Location on Map' : 'Add Address Details'}
          </DialogTitle>
        </DialogHeader>

        {/* Global Dialog Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20 shrink-0">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              {addressToEdit ? 'Edit Address' : 'Add Delivery Address'}
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              {step === 'map'
                ? 'Drag the map to pinpoint your exact delivery entrance'
                : pinnedLocation
                ? `Pinned: ${pinnedLocation.sublocality || 'Ahmedabad'}`
                : 'Search office, tech park, society or choose on map'}
            </p>
          </div>
        </div>

        {/* Mount MapLocationPicker when active so GoogleMap mounts with full layout dimensions, loading tiles instantly */}
        {step === 'map' && (
          <div className="size-full flex flex-col overflow-hidden">
            <MapLocationPicker
              initialLocation={mapTargetLocation}
              onConfirmLocation={handleConfirmLocation}
              onManualAddressFallback={() => setStep('details')}
              onCancel={() => setStep('details')}
            />
          </div>
        )}

        <div className={`size-full overflow-y-auto p-6 sm:p-8 space-y-6 ${step !== 'details' ? 'hidden' : ''}`}>
          <div className="max-w-3xl mx-auto">
            <AddressForm
              address={addressToEdit}
              pinnedLocation={pinnedLocation}
              onOpenMap={handleOpenMap}
              onSaved={handleAddressSaved}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
