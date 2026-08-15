import React from 'react'
import CheckoutSummaryComponent from '../components/CheckoutSummary'
import CheckoutSummaryPreview from './CheckoutSummaryPreview'

type CheckoutSummaryPageProps = {
  location: any
  restaurantSlug?: string
  bookingSummary: any
  control: any
  showCreateAccount: boolean
  isSubmitting: boolean
  isLoading: boolean
  feedback: { type: 'success' | 'error'; message: string } | null
}

const CheckoutSummary: React.FC<CheckoutSummaryPageProps> = ({
  location,
  restaurantSlug,
  bookingSummary,
  control,
  showCreateAccount,
isSubmitting,
  isLoading,
  feedback,
}) => {
  return (
    <CheckoutSummaryComponent
      location={location}
      bookingSummary={bookingSummary}
      summaryPreview={
        <CheckoutSummaryPreview
          location={location}
          bookingSummary={bookingSummary}
          restaurantSlug={restaurantSlug}
        />
      }
      control={control}
      showCreateAccount={showCreateAccount}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      feedback={feedback}
    />
  )
}

export default CheckoutSummary