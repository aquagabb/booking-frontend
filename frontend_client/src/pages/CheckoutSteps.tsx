import React from 'react';
import CheckoutSummaryPreview from './CheckoutSummaryPreview';

type CheckoutStepsProps = {
  location: any;
  bookingSummary?: any;
  restaurantSlug?: string;
};

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  location,
  bookingSummary,
  restaurantSlug,
}) => {
  return (
    <div className="w-full py-4 bg-white sticky top-24 rounded-md border border-gray-200 p-4">
      <CheckoutSummaryPreview
        location={location}
        bookingSummary={bookingSummary}
        restaurantSlug={restaurantSlug}
      />
    </div>
  );
};

export default CheckoutSteps;
