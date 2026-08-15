import { useState, useEffect, useCallback } from 'react';
import { getBookingById, getBookingMetadata, updateBooking } from '../../../../../api/bookings/bookings';
import type { BookingDetails, ReservationStatus } from '../types';

type UseBookingReturn = {
  booking: BookingDetails | null;
  loading: boolean;
  processing: boolean;
  error: Error | null;
  updateStatus: (status: ReservationStatus) => Promise<void>;
  updateBookingData: (updates: Partial<BookingDetails>) => void;
};

export const useBooking = (bookingId?: string): UseBookingReturn => {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const metadataResult = await getBookingMetadata();
      const metadata = metadataResult.status === 200 && metadataResult.response?.data
        ? {
            categories: metadataResult.response.data.categories,
            locations: metadataResult.response.data.locations,
          }
        : null;

      const { response } = await getBookingById(bookingId);
      
      if (response?.data) {
        const bookingData = response.data as BookingDetails & {
          locationId?: string;
          categoryId?: string;
        };

        // Enrich booking data with metadata if available
        if (metadata && bookingData.locationId) {
          const location = metadata.locations.find(
            (loc: { id: string; name: string }) => loc.id === bookingData.locationId
          );
          if (location) {
            bookingData.locationName = location.name;
          }
        }

        if (metadata && bookingData.categoryId) {
          const category = metadata.categories.find(
            (cat: { id: string; name: string }) => cat.id === bookingData.categoryId
          );
          if (category) {
            bookingData.eventName = category.name;
          }
        }

        setBooking(bookingData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch booking'));
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const updateStatus = useCallback(async (newStatus: ReservationStatus) => {
    if (!booking) return;

    try {
      setProcessing(true);
      const { status } = await updateBooking(booking.id, { status: newStatus });

      if (status) {
        setBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [booking]);

  const updateBookingData = useCallback((updates: Partial<BookingDetails>) => {
    setBooking(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return {
    booking,
    loading,
    processing,
    error,
    updateStatus,
    updateBookingData,
  };
};

