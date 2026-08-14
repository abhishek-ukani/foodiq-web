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
import { AddressForm } from '@/features/addresses/components/address-form'
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

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [deleting, setDeleting] = useState<Address | null>(null)

  const openCreateForm = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEditForm = (address: Address) => {
    setEditing(address)
    setFormOpen(true)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Manage the addresses you deliver to.</p>
        {!formOpen ? (
          <Button size="sm" onClick={openCreateForm}>
            <Plus className="size-4" aria-hidden />
            Add address
          </Button>
        ) : null}
      </div>

      {formOpen ? (
        <Card>
          <CardContent className="pt-6">
            <AddressForm
              address={editing}
              onSaved={() => setFormOpen(false)}
              onCancel={() => setFormOpen(false)}
            />
          </CardContent>
        </Card>
      ) : !addresses?.length ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add one so checkout is faster next time."
          className="border-none py-10"
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
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
