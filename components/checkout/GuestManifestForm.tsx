'use client'

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCheckoutStore } from '../../lib/store/checkoutStore'

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const guestSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  // Weight in lbs — required for Air and Water-based tours
  weight_lbs: z
    .number({ invalid_type_error: 'Weight is required' })
    .min(30, 'Weight must be at least 30 lbs')
    .max(500, 'Weight must be under 500 lbs'),
  dietary_requirements: z.string().optional(),
  emergency_contact_name: z.string().min(2, 'Emergency contact is required'),
  emergency_contact_phone: z.string().min(7, 'Please enter a valid phone number'),
})

const manifestSchema = z.object({
  guests: z.array(guestSchema).min(1, 'At least one guest is required'),
})

type ManifestFormData = z.infer<typeof manifestSchema>

// ─── Component ───────────────────────────────────────────────────────────────

interface GuestManifestFormProps {
  guestCount?: number
  onComplete: () => void
}

export function GuestManifestForm({ guestCount = 1, onComplete }: GuestManifestFormProps) {
  const { updateCheckoutState, setStep } = useCheckoutStore()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManifestFormData>({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      guests: Array.from({ length: guestCount }, () => ({
        full_name: '',
        email: '',
        weight_lbs: undefined,
        dietary_requirements: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      })),
    },
  })

  const { fields } = useFieldArray({ control, name: 'guests' })

  const onSubmit = async (data: ManifestFormData) => {
    // Persist to Zustand — this will be serialized into the checkout_state
    updateCheckoutState({ guestDetails: data.guests })
    // Advance to Step 4 (Payment)
    setStep(4)
    onComplete()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-6">
          {fields.length > 1 && (
            <h3 className="text-lg font-bold border-b pb-3">
              Guest {index + 1}
            </h3>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
              <input
                {...register(`guests.${index}.full_name`)}
                type="text"
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Jane Smith"
              />
              {errors.guests?.[index]?.full_name && (
                <p className="text-xs text-red-500">{errors.guests[index]?.full_name?.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
              <input
                {...register(`guests.${index}.email`)}
                type="email"
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="jane@example.com"
              />
              {errors.guests?.[index]?.email && (
                <p className="text-xs text-red-500">{errors.guests[index]?.email?.message}</p>
              )}
            </div>

            {/* Weight — critical for Air/Water tours */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Weight (lbs) <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-muted-foreground bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Required for Air & Water Tours</span>
              </label>
              <input
                {...register(`guests.${index}.weight_lbs`, { valueAsNumber: true })}
                type="number"
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="165"
              />
              {errors.guests?.[index]?.weight_lbs && (
                <p className="text-xs text-red-500">{errors.guests[index]?.weight_lbs?.message}</p>
              )}
            </div>

            {/* Dietary Requirements */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Dietary Requirements</label>
              <input
                {...register(`guests.${index}.dietary_requirements`)}
                type="text"
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Vegetarian, gluten-free, etc."
              />
            </div>

            {/* Emergency Contact Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Emergency Contact Name <span className="text-red-500">*</span></label>
              <input
                {...register(`guests.${index}.emergency_contact_name`)}
                type="text"
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="John Smith"
              />
              {errors.guests?.[index]?.emergency_contact_name && (
                <p className="text-xs text-red-500">{errors.guests[index]?.emergency_contact_name?.message}</p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Emergency Contact Phone <span className="text-red-500">*</span></label>
              <input
                {...register(`guests.${index}.emergency_contact_phone`)}
                type="tel"
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="+1 (555) 000-0000"
              />
              {errors.guests?.[index]?.emergency_contact_phone && (
                <p className="text-xs text-red-500">{errors.guests[index]?.emergency_contact_phone?.message}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center pt-6 border-t">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to Slots
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Continue to Payment →'}
        </button>
      </div>
    </form>
  )
}
