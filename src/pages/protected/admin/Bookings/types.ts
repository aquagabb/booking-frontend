import type { PricingItem } from '../../../../types/pricing';

// Booking Status Types
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';

/** How per-time bookings distinguish hour vs day pricing (matches checkout flow). */
export type BookingPricingTimeVariant = 'hour' | 'day';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';

export type BookingSource = 'website' | 'internal';

export type BookingNote = {
  id: number;
  bookingId: number;
  note: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
};

// Advance Payment Types
export type AdvancePayment = {
  id?: number;
  bookingId: number;
  amount: number;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Attachment Types
export type Attachment = {
  id: number;
  name: string;
  url: string;
  type?: string;
  size?: number;
  createdAt: string;
  uploadedAt?: string; // For backward compatibility
};

// Service Addon Types
export type ServiceAddon = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

// Main Reservation Details Type
export type BookingDetails = {
  id: string;
  code: string;
  locationName: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  /** Guest / checkout notes; API may also send `observations` */
  additionalInfo?: string;
  status: ReservationStatus;
  paymentStatus?: PaymentStatus;
  bookingSource?: BookingSource;
  totalPrice: number;
  basePrice: number;
  notes: BookingNote[];
  attachments: Attachment[];
  services: ServiceAddon[];
  unreadMessages?: number;
  createdAt: string;
  expirationDate?: string;
  pendingConfirmationExpiresAt?: string;
  /** Some APIs expose this alias for confirmation deadline */
  expiresAt?: string;
  advancePayments?: AdvancePayment[];
  /** Snapshot of category/location pricing at booking time (object or single-element array from API). */
  pricing?: PricingItem | PricingItem[] | null;
  /** For `per_time` mode: whether hourly or daily rate applies */
  bookingType?: BookingPricingTimeVariant | 'guest';
};

// Component Props Types
export type OverviewProps = {
  bookingId?: string;
};

export type ReservationDetailsProps = {
  item: {
    locationName: string;
    eventName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    additionalInfo?: string;
    createdAt?: string;
  };
};

export type ClientDetailsProps = {
  item: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  };
};

export type ServicesProps = {
  item: {
    services: ServiceAddon[];
  };
};

export type NotesProps = {
  bookingId?: string;
  onNotesChange?: () => void;
};

export type AttachmentsProps = {
  bookingId: string;
};

export type PricingSummaryProps = {
  booking: BookingDetails;
};

export type BookingHeaderProps = {
  booking: BookingDetails;
  processing: boolean;
  onStatusChange: (status: ReservationStatus) => void;
};

