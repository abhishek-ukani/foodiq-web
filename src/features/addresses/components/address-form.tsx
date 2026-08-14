import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { addressSchema, type AddressInput } from '@/features/addresses/schemas/address-schema'
import { useCreateAddress, useUpdateAddress } from '@/features/addresses/hooks/use-addresses'
import type { Tables } from '@/types/database.types'

const DEFAULT_VALUES: AddressInput = {
  label: 'home',
  contact_name: '',
  contact_phone: '',
  address_line1: '',
  address_line2: '',
  landmark: '',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '',
}

export function AddressForm({
  address,
  onSaved,
  onCancel,
}: {
  address?: Tables<'addresses'> | null
  onSaved: (address: Tables<'addresses'> | null) => void
  onCancel?: () => void
}) {
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const isEditing = Boolean(address)

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    form.reset(
      address
        ? {
            label: address.label,
            contact_name: address.contact_name,
            contact_phone: address.contact_phone,
            address_line1: address.address_line1,
            address_line2: address.address_line2 ?? '',
            landmark: address.landmark ?? '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          }
        : DEFAULT_VALUES,
    )
  }, [address, form])

  const onSubmit = (values: AddressInput) => {
    const payload = {
      ...values,
      address_line2: values.address_line2 || null,
      landmark: values.landmark || null,
    }
    if (isEditing && address) {
      updateAddress.mutate({ id: address.id, input: payload }, { onSuccess: () => onSaved(null) })
    } else {
      createAddress.mutate(payload, { onSuccess: (created) => onSaved(created) })
    }
  }

  const isPending = createAddress.isPending || updateAddress.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address_line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="House no., street, area" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="landmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Landmark (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Near…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Save as</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Save address'}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  )
}
