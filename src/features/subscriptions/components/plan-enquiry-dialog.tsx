import { useState } from 'react'
import { Phone, Building2, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSubmitPlanEnquiry } from '../hooks/use-subscriptions'

type PlanEnquiryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  whatsappNumber?: string
}

export function PlanEnquiryDialog({
  open,
  onOpenChange,
  whatsappNumber = '+91 98765 43210',
}: PlanEnquiryDialogProps) {
  const submitMutation = useSubmitPlanEnquiry()

  const [formData, setFormData] = useState({
    enquiry_type: 'corporate',
    headcount: '',
    days_per_week: '5',
    area_or_office: '',
    contact_name: '',
    contact_phone: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.contact_name || !formData.contact_phone || !formData.area_or_office) return

    await submitMutation.mutateAsync({
      enquiry_type: formData.enquiry_type,
      headcount: formData.headcount ? Number(formData.headcount) : null,
      days_per_week: formData.days_per_week ? Number(formData.days_per_week) : null,
      area_or_office: formData.area_or_office,
      contact_name: formData.contact_name,
      phone: formData.contact_phone,
      message: formData.notes || null,
    })

    onOpenChange(false)
  }

  const cleanWhatsAppNumber = whatsappNumber.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello FoodIQ! I am interested in custom / corporate tiffin plans for our group in Ahmedabad.`,
  )}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Building2 className="size-4" />
            <span>Custom &amp; Corporate Plans</span>
          </div>
          <DialogTitle className="font-display text-xl">
            Need a Flexible or Office Group Plan?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Whether you need daily tiffins for your office team, a custom delivery schedule, or
            special dietary preferences, let us know. All plans include a complimentary snack (farsan / fryums) with every meal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Plan Type</Label>
              <Select
                value={formData.enquiry_type}
                onValueChange={(val) => setFormData((p) => ({ ...p, enquiry_type: val }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Corporate / Office Group</SelectItem>
                  <SelectItem value="family">Family / Bulk Tiffin</SelectItem>
                  <SelectItem value="custom_schedule">Custom Days &amp; Timings</SelectItem>
                  <SelectItem value="event">Occasion / Event Meal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Est. People / Headcount</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={formData.headcount}
                onChange={(e) => setFormData((p) => ({ ...p, headcount: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Your Name *</Label>
              <Input
                placeholder="Full Name"
                value={formData.contact_name}
                onChange={(e) => setFormData((p) => ({ ...p, contact_name: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Phone Number *</Label>
              <Input
                type="tel"
                placeholder="10-digit mobile"
                value={formData.contact_phone}
                onChange={(e) => setFormData((p) => ({ ...p, contact_phone: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Area / Office Location *</Label>
            <Input
              placeholder="e.g. Prahlad Nagar, SG Highway, Bodakdev"
              value={formData.area_or_office}
              onChange={(e) => setFormData((p) => ({ ...p, area_or_office: e.target.value }))}
              required
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Special Requests / Preferences</Label>
            <Textarea
              placeholder="Any specific delivery hours, sabji preferences, or requirements..."
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs border-emerald-500/50 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <Phone className="size-3.5" />
                Chat on WhatsApp
              </Button>
            </a>

            <Button
              type="submit"
              size="sm"
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto gap-1.5 bg-primary text-primary-foreground font-semibold text-xs"
            >
              <Send className="size-3.5" />
              {submitMutation.isPending ? 'Sending...' : 'Submit Enquiry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
