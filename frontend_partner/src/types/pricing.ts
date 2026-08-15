// Pricing types and utilities

export type SelectOption = { value: string | number; label: string };

export type PricingMode = "per_time" | "per_guest" | null;

/** defaultMode: "custom" = doar preț la cerere (POA), fără mod time/guest */
export type PricingItem = {
  currency: string;
  defaultMode?: "per_time" | "per_guest" | "custom";
  hour?: {
    price: number;
    min?: number; // category pricing uses hour.min
  };
  day?: {
    price: number;
    min?: number;
  };
  guest?: {
    price: number;
    min?: number;
  };
  isPoa?: boolean; // category pricing
};

export type PricingFormValues = {
  currency: string;
  pricing_mode: PricingMode;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_guest: number | null;
  min_hours: number | null;
  min_guests: number | null;
  isPoa?: boolean; // Price on application (preț la cerere)
};

export type CategoryPricing = {
  id?: number; // pricing row id from backend
  categoryId: number;
  pricing: PricingItem[];
};

export type LocationPricingData = {
  defaultPricing: PricingItem[] | null;
  categoryPricing: Record<number, PricingItem[]>; // categoryId -> pricing
  categoryPricingIds: Record<number, number>; // categoryId -> pricing row id
};

