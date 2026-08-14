import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  personalInfoSchema,
  type PersonalInfoInput,
} from '@/features/profile/schemas/personal-info-schema'
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile'
import { useAuth } from '@/hooks/use-auth'

export function PersonalInfoForm() {
  const { user, profile } = useAuth()
  const update = useUpdateProfile()

  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      marketing_opt_in: profile?.marketing_opt_in ?? true,
    },
  })

  const onSubmit = (values: PersonalInfoInput) => update.mutate(values)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <p className="mb-1.5 text-sm font-medium">Email</p>
          <Input value={user?.email ?? ''} disabled />
          <p className="text-muted-foreground mt-1 text-xs">Your email can&apos;t be changed here.</p>
        </div>

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile number</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Offers &amp; announcements</p>
            <p className="text-muted-foreground text-xs">Occasional emails about deals and new items.</p>
          </div>
          <FormField
            control={form.control}
            name="marketing_opt_in"
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>

        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
