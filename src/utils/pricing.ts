import type { PricingItem, PricingFormValues, LocationPricingData } from "../types/pricing";

/**
 * Builds PricingItem array from form values
 */
export const buildPricingData = (data: PricingFormValues): PricingItem[] | null => {
  // Doar "preț la cerere" — defaultMode custom (nu per_time/per_guest)
  if (data.isPoa === true && !data.pricing_mode) {
    return [
      {
        currency: data.currency || "EUR",
        defaultMode: "custom",
        isPoa: true,
      },
    ];
  }
  if (!data.pricing_mode) {
    return null;
  }

  const pricingItem: PricingItem = {
    currency: data.currency || "EUR",
    defaultMode: data.pricing_mode,
  };

  if (data.isPoa === true) {
    pricingItem.isPoa = true;
  }

  if (data.price_per_hour != null) {
    pricingItem.hour = {
      price: data.price_per_hour,
    };
  }
  
  if (data.price_per_day != null) {
    pricingItem.day = {
      price: data.price_per_day,
    };
    if (data.min_hours != null) {
      pricingItem.day.min = data.min_hours;
    }
  }

  if (data.price_per_guest != null) {
    pricingItem.guest = {
      price: data.price_per_guest,
    };
    if (data.min_guests != null) {
      pricingItem.guest.min = data.min_guests;
    }
  }

  return [pricingItem];
};

/**
 * Parses PricingItem array to form values
 */
export const parsePricingData = (pricing: PricingItem[] | null | undefined): PricingFormValues => {
  if (!pricing || !Array.isArray(pricing) || pricing.length === 0) {
    return {
      currency: "EUR",
      pricing_mode: null,
      price_per_hour: null,
      price_per_day: null,
      price_per_guest: null,
      min_hours: null,
      min_guests: null,
      isPoa: false,
    };
  }

  const pricingItem = pricing[0];

  const isPoaOnly = pricingItem.defaultMode === "custom" || pricingItem.isPoa === true;

  return {
    currency: pricingItem.currency || "EUR",
    pricing_mode:
      pricingItem.defaultMode === "per_time"
        ? "per_time"
        : pricingItem.defaultMode === "per_guest"
          ? "per_guest"
          : null,
    price_per_hour: pricingItem.hour?.price || null,
    price_per_day: pricingItem.day?.price || null,
    min_hours: pricingItem.day?.min || null,
    price_per_guest: pricingItem.guest?.price || null,
    min_guests: pricingItem.guest?.min || null,
    isPoa: isPoaOnly,
  };
};

/**
 * Resolves pricing for a specific category with fallback to default
 * @param categoryId - The category ID to get pricing for
 * @param pricingData - The location pricing data
 * @returns PricingItem array or null
 */
export const resolvePricing = (
  categoryId: number | null,
  pricingData: LocationPricingData
): PricingItem[] | null => {
  // If category ID is provided and has override, use it
  if (categoryId && pricingData.categoryPricing[categoryId]) {
    return pricingData.categoryPricing[categoryId];
  }
  
  // Fallback to default pricing
  return pricingData.defaultPricing;
};

/**
 * Returns a copy of a pricing item with only fields allowed by the API (e.g. no hour.min).
 */
function sanitizePricingItemForAPI(item: PricingItem): PricingItem {
  const out: PricingItem = {
    currency: item.currency,
  };
  if (item.defaultMode != null) out.defaultMode = item.defaultMode;
  if (item.isPoa) out.isPoa = true;
  if (item.hour != null) {
    out.hour = { price: item.hour.price };
    // API does not allow hour.min - do not send it
  }
  if (item.day != null) {
    out.day = { price: item.day.price };
    if (item.day.min != null) out.day.min = item.day.min;
  }
  if (item.guest != null) {
    out.guest = { price: item.guest.price };
    if (item.guest.min != null) out.guest.min = item.guest.min;
  }
  return out;
}

/**
 * Builds the complete pricing structure for API submission.
 * Sanitizes pricing items so only allowed fields are sent (e.g. no hour.min).
 */
export const buildLocationPricingForAPI = (pricingData: LocationPricingData): {
  pricing?: PricingItem[];
  categoryPricing?: Array<{ id?: number; categoryId: number; pricing: PricingItem[] }>;
} => {
  const result: {
    pricing?: PricingItem[];
    categoryPricing?: Array<{ id?: number; categoryId: number; pricing: PricingItem[] }>;
  } = {};

  if (pricingData.defaultPricing) {
    result.pricing = pricingData.defaultPricing.map(sanitizePricingItemForAPI);
  }

  const categoryPricingEntries = Object.entries(pricingData.categoryPricing);
  if (categoryPricingEntries.length > 0) {
    result.categoryPricing = categoryPricingEntries.map(([categoryId, pricing]) => {
      const numericCategoryId = Number(categoryId);
      const item: { id?: number; categoryId: number; pricing: PricingItem[] } = {
        categoryId: numericCategoryId,
        pricing: pricing.map(sanitizePricingItemForAPI),
      };

      const existingId = pricingData.categoryPricingIds[numericCategoryId];
      if (existingId != null) {
        item.id = existingId;
      }

      return item;
    });
  }

  return result;
};

/** Backend response shape for pricing per category */
export type PricingCategoryFromAPI = {
  id?: number;
  categoryId: number;
  pricing: PricingItem[];
};

/**
 * Parses API response to LocationPricingData.
 * Backend returns `pricingCategories` (array with categoryId + pricing).
 */
export const parseLocationPricingFromAPI = (data: {
  pricing?: PricingItem[];
  categoryPricing?: Array<{ categoryId: number; pricing: PricingItem[] }>;
  pricingCategories?: PricingCategoryFromAPI[];
}): LocationPricingData => {
  const result: LocationPricingData = {
    defaultPricing: data.pricing || null,
    categoryPricing: {},
    categoryPricingIds: {},
  };

  if (data.pricingCategories && data.pricingCategories.length > 0) {
    data.pricingCategories.forEach(({ id, categoryId, pricing }) => {
      result.categoryPricing[categoryId] = pricing;
      if (id != null) {
        result.categoryPricingIds[categoryId] = id;
      }
    });
  } else if (data.categoryPricing) {
    data.categoryPricing.forEach(({ categoryId, pricing }) => {
      result.categoryPricing[categoryId] = pricing;
    });
  }

  return result;
};

const defaultSummaryLabels = {
  hour: "hour",
  day: "day",
  guest: "guest",
  priceOnApplication: "Price on application",
};

export function formatPricingSummary(
  values: PricingFormValues,
  options?: { t?: (key: string) => string }
): string {
  const t = options?.t;
  const labels = {
    hour: t?.("locations.price_per_hour_short") ?? defaultSummaryLabels.hour,
    day: t?.("locations.price_per_day_short") ?? defaultSummaryLabels.day,
    guest: t?.("locations.price_per_guest_short") ?? defaultSummaryLabels.guest,

     
  };
  const currency = values.currency || "EUR";
  const symbol = currency === "RON" ? "RON" : currency === "EUR" ? "€" : currency;

  if (values.isPoa) {
    return labels.priceOnApplication;
  }

  const parts: string[] = [];
  if (values.price_per_hour != null) {
    parts.push(`${values.price_per_hour} ${symbol} / ${labels.hour}`);
  }
  if (values.price_per_day != null) {
    parts.push(`${values.price_per_day} ${symbol} / ${labels.day}`);
  }
  if (values.price_per_guest != null) {
    parts.push(`${values.price_per_guest} ${symbol} / ${labels.guest}`);
  }
  return parts.length > 0 ? parts.join(", ") : "N/A";
}

