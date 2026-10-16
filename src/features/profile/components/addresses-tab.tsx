import { useState } from 'react'
import { MapPin, MoreHorizontal, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { AddressFlowDialog } from '@/features/addresses/components/address-flow-dialog'
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/features/addresses/hooks/use-addresses'
import type { Tables } from '@/types/database.types'

type Address = Tables<'addresses'>

export function AddressesTab() {
  const { data: addresses, isPending } = useAddresses()
  const deleteAddress = useDeleteAddress()
  const setDefault = useSetDefaultAddress()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [deleting, setDeleting] = useState<Address | null>(null)

  const openCreateForm = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEditForm = (address: Address) => {
    setEditing(address)
    setDialogOpen(true)
  }

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const validAddresses = (addresses || []).filter(
    (addr) =>
      Boolean(addr?.address_line1?.trim()) ||
      Boolean(addr?.city?.trim()) ||
      Boolean(addr?.contact_name?.trim())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Manage the addresses you deliver to.</p>
        <Button size="sm" onClick={openCreateForm}>
          <Plus className="size-4" aria-hidden />
          Add address
        </Button>
      </div>

      {!validAddresses.length ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add one so checkout is faster next time."
          className="border-none py-10"
        />
      ) : (
        <div className="space-y-3">
          {validAddresses.map((address) => (
            <Card key={address.id} className="gap-0 py-0 shadow-sm">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">{address.label}</p>
                    {address.is_default ? (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="size-3" aria-hidden />
                        Default
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {address.contact_name} · {address.contact_phone}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {address.address_line1}
                    {address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state}{' '}
                    {address.pincode}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                      <MoreHorizontal className="size-4" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditForm(address)}>Edit</DropdownMenuItem>
                    {!address.is_default ? (
                      <DropdownMenuItem onClick={() => setDefault.mutate(address.id)}>
                        Set as default
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(address)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 2-Step Interactive Google Map & Address Flow Modal */}
      <AddressFlowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addressToEdit={editing}
        onSaved={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this address?"
        description="You'll need to add it again if you want to use it later."
        confirmLabel="Delete"
        isLoading={deleteAddress.isPending}
        onConfirm={() =>
          deleting && deleteAddress.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </div>
  )
}
