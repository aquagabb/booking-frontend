import type { PricingItem } from "../types/pricing";

export function currencySymbolFromCode(currency: string): string {
  const c = (currency || "EUR").toUpperCase();
  if (c === "RON" || c === "LEI") return "lei";
  if (c === "EUR") return "€";
  if (c === "USD") return "$";
  if (c === "GBP") return "£";
  return c;
}

/** API may return numeric prices as strings. */
export function parseNumericPrice(value: string | number | undefined | null): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function normalizeReservationPricing(
  pricing: PricingItem | PricingItem[] | null | undefined
): PricingItem | null {
  if (pricing == null) return null;
  return Array.isArray(pricing) ? pricing[0] ?? null : pricing;
}

function durationHoursBooking(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60));
}

function durationDaysBooking(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export type ClientPricingBreakdown =
  | { kind: "per_guest"; unitPrice: number; guests: number }
  | { kind: "per_hour"; unitPrice: number; hours: number }
  | { kind: "per_day"; unitPrice: number; days: number }
  | { kind: "poa" };

export type ClientPricingBreakdownArgs = {
  checkIn: string;
  checkOut: string;
  guests: number;
  bookingType?: "hour" | "day" | "guest";
  pricing: PricingItem | PricingItem[] | null | undefined;
  /** From booking root `currencyCode` when `pricing.currency` is missing */
  currencyCodeFallback: string;
};

/**
 * Resolves currency and per-unit breakdown for client reservation views (aligned with admin Overview).
 */
export function getClientPricingBreakdown(
  args: ClientPricingBreakdownArgs
): { currencyCode: string; breakdown: ClientPricingBreakdown | null } {
  const pricing = normalizeReservationPricing(args.pricing);
  const currencyCode = (pricing?.currency || args.currencyCodeFallback || "EUR").trim() || "EUR";

  if (!pricing) {
    return { currencyCode, breakdown: null };
  }

  const mode = pricing.defaultMode;

  if (mode === "per_guest") {
    const unitPrice = parseNumericPrice(pricing.guest?.price);
    if (unitPrice == null) {
      return { currencyCode, breakdown: null };
    }
    const guests = Math.max(1, args.guests || 1);
    return { currencyCode, breakdown: { kind: "per_guest", unitPrice, guests } };
  }

  if (mode === "per_time") {
    const bt = args.bookingType;
    const hourPrice = parseNumericPrice(pricing.hour?.price);
    const dayPrice = parseNumericPrice(pricing.day?.price);

    if (bt === "hour" && hourPrice != null) {
      const hours = Math.max(1, durationHoursBooking(args.checkIn, args.checkOut));
      return { currencyCode, breakdown: { kind: "per_hour", unitPrice: hourPrice, hours } };
    }
    if (bt === "day" && dayPrice != null) {
      const days = Math.max(1, durationDaysBooking(args.checkIn, args.checkOut));
      return { currencyCode, breakdown: { kind: "per_day", unitPrice: dayPrice, days } };
    }
    if (bt !== "hour" && bt !== "day") {
      if (dayPrice != null) {
        const days = Math.max(1, durationDaysBooking(args.checkIn, args.checkOut));
        return { currencyCode, breakdown: { kind: "per_day", unitPrice: dayPrice, days } };
      }
      if (hourPrice != null) {
        const hours = Math.max(1, durationHoursBooking(args.checkIn, args.checkOut));
        return { currencyCode, breakdown: { kind: "per_hour", unitPrice: hourPrice, hours } };
      }
    }
  }

  if (mode === "custom" || pricing.isPoa) {
    return { currencyCode, breakdown: { kind: "poa" } };
  }

  return { currencyCode, breakdown: null };
}

/** Format a total for display (symbol position depends on currency). */
export function formatMoneyWithSymbol(amount: number, currencyCode: string): string {
  const sym = currencySymbolFromCode(currencyCode);
  const n = typeof amount === "number" ? amount : parseFloat(String(amount));
  const formatted = Number.isFinite(n) ? n.toLocaleString() : String(amount);
  const c = currencyCode.toUpperCase();
  if (c === "RON" || c === "LEI") return `${formatted} ${sym}`;
  return `${sym}${formatted}`;
}

/** Format a unit rate for interpolation into translation strings. */
export function formatUnitMoney(amount: number, currencyCode: string): string {
  return formatMoneyWithSymbol(amount, currencyCode);
}
