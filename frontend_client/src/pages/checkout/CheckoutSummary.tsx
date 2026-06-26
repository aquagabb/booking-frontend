import React from 'react'
import { Controller } from 'react-hook-form'
import { Info } from 'lucide-react'
import CustomCheckbox from '../../components/shared/CustomCheckbox'
import CheckoutSummaryPreview from './CheckoutSummaryPreview'

interface PhotoCategory {
  name: string
  photos?: { url: string; isVisible: boolean }[]
}

interface Location {
  id: number
  name: string
  address: string
  rating?: string | number
  ratingCount?: number
  googleMapsUrl?: string
  photos?: PhotoCategory[]
  maxGuests?: number
}

type PriceVariant = 'per_day' | 'per_hour' | 'per_guest' | 'on_request'

type PricingItem = {
  currency: string
  defaultMode: 'per_time' | 'per_guest'
  hour?: { price: number }
  day?: { price: number; min?: number }
  guest?: { price: number; min?: number }
}

interface BookingSummary {
  checkIn?: string
  checkOut?: string
  guests?: number
  pricePerDay?: number
  categoryName?: string
  priceVariant?: PriceVariant
  pricePerHour?: number
  pricePerGuest?: number
  bookingType?: string
  pricing?: PricingItem[]
  approvalDays?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

type CheckoutSummaryProps = {
  location: Location
  restaurantSlug?: string
  bookingSummary?: BookingSummary
  control?: any
  showCreateAccount?: boolean
  isSubmitting?: boolean
  isLoading?: boolean
  feedback?: { type: 'success' | 'error'; message: string } | null
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  location,
  restaurantSlug,
  bookingSummary,
  control,
  showCreateAccount,
  isSubmitting = false,
  isLoading = false,
  feedback,
}) => {
  return (
    <div className="w-full py-4 bg-white sticky top-24 space-y-4">
      <CheckoutSummaryPreview
        location={location}
        bookingSummary={bookingSummary}
        restaurantSlug={restaurantSlug}
      />

      {bookingSummary?.approvalDays != null && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4 mb-4 flex items-start gap-3">
          <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            Rezervarea va fi aprobată în maxim {bookingSummary.approvalDays}{' '}
            {bookingSummary.approvalDays === 1 ? 'zi' : 'zile'}.
          </p>
        </div>
      )}

      {feedback && (
        <div
          className={`text-sm font-medium px-3 py-2 rounded-lg ${
            feedback.type === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="bg-white mt-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Anulare:</span> cu cel puțin 1 zi înainte de
          programare.
        </p>
      </div>

      {control && (
        <Controller
          name="additionalInfo"
          control={control}
          render={({ field }) => (
            <div className="mt-4">
              <label
                htmlFor="checkout-additional-info"
                className="block text-sm font-semibold mb-2 text-gray-dark"
              >
                Observații suplimentare / cereri speciale
              </label>
              <textarea
                id="checkout-additional-info"
                {...field}
                rows={4}
                placeholder="Alergii, ocazie, aranjamente preferate, alte mențiuni…"
                className="block w-full text-base md:text-sm px-4 py-3 border rounded-lg bg-white border-gray-300 resize-y min-h-[96px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          )}
        />
      )}

      {showCreateAccount && control && (
        <Controller
          name="createAccount"
          control={control}
          render={({ field }) => (
            <CustomCheckbox
              label="Create an account after reservation is completed to enjoy all the benefits, if you have one already, the account will be linked."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}

      {control && (
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full font-medium py-3 px-4 rounded-xl transition disabled:opacity-50 bg-primary text-white"
        >
          {isSubmitting ? 'Processing...' : 'Confirma'}
        </button>
      )}

      {control && (
        <p className="text-xs text-center text-gray-500 mt-2">
          Free reservation – no payment or hidden fees
        </p>
      )}
    </div>
  )
}

export default CheckoutSummary
