// src/pages/protected/client/Reservations/types.ts

export interface Reservation {
  id: string;
  code: string;
  locationName: string;
  address: string;
  image: string;
  status: "confirmed" | "pending" | "cancelled" | "past" | "expired";
  checkIn: string;
  checkOut: string;
  guests: number;
  expiresAt?: string;
}
