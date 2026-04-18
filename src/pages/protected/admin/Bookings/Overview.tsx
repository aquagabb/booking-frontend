import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Globe,
  Building2,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar
} from 'lucide-react';
import { getBookingById, getBookingMetadata, getBookingNotes, updateBookingStatus, getBookingPayments, createAdvancePayment, deleteAdvancePayment } from '../../../../api/bookings/bookings';
import clsx from 'clsx';
import ReservationDetails from './ReservationDetails';
import ClientDetails from './ClientDetails';
import Notes from './Notes';
import ConfirmModal from '../../../../components/shared/Modals/ConfirmModal';
import CustomModal from '../../../../components/shared/Modals/CustomModal';
import { BookingFormBun } from '../Forms/BookingFormBun';

import type { PricingItem } from '../../../../types/pricing';
import type {
  ReservationStatus,
  BookingDetails,
  OverviewProps,
  AdvancePayment,
} from './types';

function normalizeReservationPricing(
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

function currencySymbolFromCode(currency: string): string {
  const c = (currency || 'EUR').toUpperCase();
  if (c === 'RON' || c === 'LEI') return 'lei';
  if (c === 'EUR') return '€';
  if (c === 'USD') return '$';
  if (c === 'GBP') return '£';
  return c;
}

type PricingBreakdown =
  | {
      kind: 'per_guest';
      currency: string;
      unitPrice: number;
      guests: number;
      lineTotal: number;
    }
  | {
      kind: 'per_hour';
      currency: string;
      unitPrice: number;
      hours: number;
      lineTotal: number;
    }
  | {
      kind: 'per_day';
      currency: string;
      unitPrice: number;
      days: number;
      lineTotal: number;
    }
  | { kind: 'poa'; currency: string };

function buildPricingBreakdown(
  reservation: BookingDetails,
  pricing: PricingItem
): PricingBreakdown | null {
  const mode = pricing.defaultMode;
  const currency = pricing.currency || 'EUR';

  if (mode === 'per_guest' && pricing.guest?.price != null) {
    const unitPrice = pricing.guest.price;
    const guests = Math.max(1, reservation.guests || 1);
    return {
      kind: 'per_guest',
      currency,
      unitPrice,
      guests,
      lineTotal: unitPrice * guests,
    };
  }

  if (mode === 'per_time') {
    const bt = reservation.bookingType;
    const hourPrice = pricing.hour?.price;
    const dayPrice = pricing.day?.price;

    if (bt === 'hour' && hourPrice != null) {
      const unitPrice = hourPrice;
      const hours = Math.max(1, durationHoursBooking(reservation.checkIn, reservation.checkOut));
      return {
        kind: 'per_hour',
        currency,
        unitPrice,
        hours,
        lineTotal: unitPrice * hours,
      };
    }
    if (bt === 'day' && dayPrice != null) {
      const unitPrice = dayPrice;
      const days = Math.max(1, durationDaysBooking(reservation.checkIn, reservation.checkOut));
      return {
        kind: 'per_day',
        currency,
        unitPrice,
        days,
        lineTotal: unitPrice * days,
      };
    }
    if (bt !== 'hour' && bt !== 'day') {
      if (dayPrice != null) {
        const unitPrice = dayPrice;
        const days = Math.max(1, durationDaysBooking(reservation.checkIn, reservation.checkOut));
        return {
          kind: 'per_day',
          currency,
          unitPrice,
          days,
          lineTotal: unitPrice * days,
        };
      }
      if (hourPrice != null) {
        const unitPrice = hourPrice;
        const hours = Math.max(1, durationHoursBooking(reservation.checkIn, reservation.checkOut));
        return {
          kind: 'per_hour',
          currency,
          unitPrice,
          hours,
          lineTotal: unitPrice * hours,
        };
      }
    }
  }

  if (mode === 'custom' || pricing.isPoa) {
    return { kind: 'poa', currency };
  }

  return null;
}
import { formatDate } from '../../../../lib/utils';
import Attachements from './Attachements';
import CustomInput from '../../../../components/shared/CustomInput';
import CustomDatePicker from '../../../../components/shared/CustomDatePicker';
import CustomTextarea from '../../../../components/shared/CustomTextarea';

type MetadataResponse = {
  categories: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
};

const Overview = ({ bookingId }: OverviewProps) => {
  const [reservation, setReservation] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectPendingModal, setShowRejectPendingModal] = useState(false);
  const [editingBookingSlug, setEditingBookingSlug] = useState<string | null>(null);
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [addingPayment, setAddingPayment] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const fetchMetadataOptions = useCallback(async (): Promise<MetadataResponse | undefined> => {
    const { status, response } = await getBookingMetadata();
    if (status === 200 && response?.data) {
      return {
        categories: response.data.categories,
        locations: response.data.locations,
      };
    }
    return undefined;
  }, []);

  const fetchReservation = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const metadata = await fetchMetadataOptions();
      const { response } = await getBookingById(bookingId, {}, true);

      if (response?.data) {
        const reservationData = response.data;

        const location = metadata?.locations.find(
          (loc) => loc.id === reservationData.locationId
        );
        const category = metadata?.categories.find(
          (cat) => cat.id === reservationData.categoryId
        );

        // Fetch notes
        let notes = [];
        try {
          const notesResponse = await getBookingNotes(bookingId);
          if (notesResponse.status === 200 && notesResponse.response?.data) {
            notes = notesResponse.response.data;
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
        }

        // Fetch advance payments
        let payments: AdvancePayment[] = [];
        try {
          const paymentsResponse = await getBookingPayments(bookingId);
          if (paymentsResponse.status === 200 && paymentsResponse.response?.data) {
            payments = paymentsResponse.response.data;
          }
        } catch (error) {
          console.error('Error fetching advance payments:', error);
        }

        const raw = reservationData as {
          additionalInfo?: string;
          observations?: string;
          pricing?: PricingItem | PricingItem[] | null;
          bookingType?: 'hour' | 'day' | 'guest';
          bookingSource?: string;
          source?: string;
        };
        const additionalInfo =
          (raw.additionalInfo?.trim() || raw.observations?.trim()) || undefined;

        const reservationDetails: BookingDetails = {
          ...reservationData,
          additionalInfo,
          locationName: location?.name ?? reservationData.locationName ?? '',
          eventName: category?.name ?? reservationData.eventName ?? '',
          basePrice: reservationData.basePrice ?? 0,
          totalPrice: reservationData.totalPrice ?? 0,
          unreadMessages: reservationData.unreadMessages ?? 5,
          services: reservationData.services ?? [],
          notes: notes,
          attachments: reservationData.attachments ?? [],
          paymentStatus: reservationData.paymentStatus ?? 'pending',
          bookingSource:
            raw.bookingSource ??
            (raw.source === 'custom' ? 'internal' : 'website'),
          advancePayments: payments,
          pricing: raw.pricing ?? undefined,
          bookingType: raw.bookingType,
        };

        setReservation(reservationDetails);
        setAdvancePayments(payments);
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId, fetchMetadataOptions]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  const handleStatusChange = useCallback(async (newStatus: ReservationStatus) => {
    if (!reservation) return;

    try {
      setProcessing(true);
      const { status } = await updateBookingStatus({
        status: newStatus,
        bookingId: parseInt(reservation.id, 10),
      });


      if (status === 200) {
        setReservation((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(false);
    }
  }, [reservation]);

  const pricingItem = useMemo(
    () => (reservation ? normalizeReservationPricing(reservation.pricing) : null),
    [reservation?.pricing]
  );

  const pricingBreakdown = useMemo(() => {
    if (!reservation || !pricingItem) return null;
    return buildPricingBreakdown(reservation, pricingItem);
  }, [reservation, pricingItem]);

  /** Moneda rezervării: din `pricing.currency` (ex. EUR → €, RON → lei); fără pricing → RON. */
  const bookingCurrencyCode = useMemo(() => {
    const c = pricingItem?.currency?.trim();
    return c && c.length > 0 ? c : 'RON';
  }, [pricingItem?.currency]);

  const bookingCurrencySymbol = useMemo(
    () => currencySymbolFromCode(bookingCurrencyCode),
    [bookingCurrencyCode]
  );

  const notesTotal = useMemo(() => {
    return reservation?.notes.reduce((sum, note) => {
      const price = note.price ?? 0;
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return sum + (isNaN(numPrice) ? 0 : numPrice);
    }, 0) ?? 0;
  }, [reservation?.notes]);

  const totalAdvancePayments = useMemo(() => {
    return advancePayments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [advancePayments]);

  const remainingAmount = useMemo(() => {
    if (!reservation) return 0;
    const total = parseInt(reservation.totalPrice.toString()) + parseInt(notesTotal.toString());
    return Math.max(0, total - totalAdvancePayments);
  }, [reservation, notesTotal, totalAdvancePayments]);

  const daysUntilEvent = useMemo(() => {
    if (!reservation?.checkIn) return null;
    const eventDate = new Date(reservation.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [reservation?.checkIn]);

  const showReminder = useMemo(() => {
    return (
      reservation?.status === 'confirmed' &&
      daysUntilEvent !== null &&
      daysUntilEvent >= 0 &&
      daysUntilEvent <= 7
    );
  }, [reservation?.status, daysUntilEvent]);

  /** Single deadline for pending confirmation: API `expiresAt` first, then fallbacks. */
  const pendingConfirmationDeadline = useMemo((): string | null => {
    if (!reservation || reservation.status !== 'pending') return null;
    const raw =
      reservation.expiresAt ||
      reservation.expirationDate ||
      reservation.pendingConfirmationExpiresAt ||
      (reservation.createdAt
        ? new Date(new Date(reservation.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
        : null);
    return raw ?? null;
  }, [
    reservation?.status,
    reservation?.expiresAt,
    reservation?.expirationDate,
    reservation?.pendingConfirmationExpiresAt,
    reservation?.createdAt,
  ]);

  const handleEdit = useCallback(() => {
    if (reservation) {
      setDropdownOpen(false);
      setEditingBookingSlug(`${reservation.id}-${reservation.code}`);
    }
  }, [reservation]);

  const handleCancel = useCallback(() => {
    setDropdownOpen(false);
    setShowCancelModal(true);
  }, []);

  const confirmCancel = useCallback(async () => {
    if (!reservation) return;
    setShowCancelModal(false);
    await handleStatusChange('rejected');
  }, [reservation, handleStatusChange]);

  const confirmRejectPending = useCallback(async () => {
    if (!reservation) return;
    setShowRejectPendingModal(false);
    await handleStatusChange('rejected');
  }, [reservation, handleStatusChange]);

  const handleAddPayment = useCallback(async () => {
    if (!reservation || !paymentDate || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vă rugăm introduceți o sumă validă');
      return;
    }

    try {
      setAddingPayment(true);
      const { status, response } = await createAdvancePayment({
        bookingId: parseInt(reservation.id, 10),
        amount: amount,
        date: paymentDate.toISOString(),
        notes: paymentNotes.trim() || undefined,
      });

      if (status === 200 || status === 201) {
        const newPayment: AdvancePayment = {
          id: response?.data?.id,
          bookingId: parseInt(reservation.id, 10),
          amount: amount,
          date: paymentDate.toISOString(),
          notes: paymentNotes.trim() || undefined,
        };
        setAdvancePayments((prev) => [...prev, newPayment]);
        setReservation((prev) => 
          prev ? { ...prev, advancePayments: [...(prev.advancePayments || []), newPayment] } : null
        );
        setShowAddPaymentModal(false);
        setPaymentAmount('');
        setPaymentDate(new Date());
        setPaymentNotes('');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Eroare la adăugarea plății');
    } finally {
      setAddingPayment(false);
    }
  }, [reservation, paymentAmount, paymentDate]);

  const handleDeletePaymentClick = useCallback((paymentId: number) => {
    setPaymentToDelete(paymentId);
    setShowDeletePaymentModal(true);
  }, []);

  const handleDeletePaymentConfirm = useCallback(async () => {
    if (!paymentToDelete) return;

    try {
      const { status } = await deleteAdvancePayment(paymentToDelete);
      if (status === 200 || status === 204) {
        setAdvancePayments((prev) => prev.filter((p) => p.id !== paymentToDelete));
        setReservation((prev) => 
          prev ? { ...prev, advancePayments: prev.advancePayments?.filter((p) => p.id !== paymentToDelete) } : null
        );
        setShowDeletePaymentModal(false);
        setPaymentToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Eroare la ștergerea plății');
      setShowDeletePaymentModal(false);
      setPaymentToDelete(null);
    }
  }, [paymentToDelete]);

  const statusConfig = useMemo(() => {
    if (!reservation) return null;

    const configs = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle2,
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle2,
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
      },
      expired: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: AlertTriangle,
      },
    };

    return configs[reservation.status];
  }, [reservation?.status]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading reservation details...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Reservation not found</p>
      </div>
    );
  }

  const StatusIcon = statusConfig?.icon ?? Clock;

  return (
    <div className="space-y-6 p-2">
      {reservation.status === 'pending' && (
        <div className="rounded-xl border  p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center">
              <Clock className="w-5 h-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900">
                Rezervare în așteptare
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Confirmă sau respinge această cerere înainte să expire.
              </p>
              {pendingConfirmationDeadline && (
                <p className="text-xs text-gray-600 mt-2">
                  Expiră la: {formatDate(pendingConfirmationDeadline)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:flex-shrink-0 sm:justify-end">
            <button
              type="button"
              onClick={() => handleStatusChange('confirmed')}
              disabled={processing}
              className="px-3 py-1 rounded-md text-xs font-semibold capitalize bg-green-100 text-green-700 ring-1 ring-green-200 transition-colors hover:bg-green-200/70 hover:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Aproba
            </button>
            <button
              type="button"
              onClick={() => setShowRejectPendingModal(true)}
              disabled={processing}
              className="px-3 py-1 rounded-md text-xs font-semibold capitalize bg-red-100 text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-200/70 hover:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Respinge
            </button>
          </div>
        </div>
      )}
                
      {showReminder && daysUntilEvent !== null && (
        <div className={clsx(
          "rounded-xl border-2 p-4 flex items-center gap-3",
          daysUntilEvent === 0
            ? "bg-red-50 border-red-200"
            : daysUntilEvent <= 3
              ? "bg-orange-50 border-orange-200"
              : "bg-yellow-50 border-yellow-200"
        )}>
          <AlertTriangle className={clsx(
            "w-5 h-5 flex-shrink-0",
            daysUntilEvent === 0 ? "text-red-600" : daysUntilEvent <= 3 ? "text-orange-600" : "text-yellow-600"
          )} />
          <div className="flex-1">
            <p className={clsx(
              "font-semibold text-sm",
              daysUntilEvent === 0 ? "text-red-900" : daysUntilEvent <= 3 ? "text-orange-900" : "text-yellow-900"
            )}>
              {daysUntilEvent === 0
                ? "Event is today!"
                : daysUntilEvent === 1
                  ? "Event is tomorrow"
                  : `Event in ${daysUntilEvent} days`}
            </p>
            <p className={clsx(
              "text-sm mt-0.5",
              daysUntilEvent === 0 ? "text-red-700" : daysUntilEvent <= 3 ? "text-orange-700" : "text-yellow-700"
            )}>
              {formatDate(reservation.checkIn)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <div className="pr-6 border-r border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 space-y-3">

                <div className="flex items-center gap-3">
                  <h1 className="text-base font-bold text-gray-900">
                    Booking #{reservation.code}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">

                  {statusConfig && (
                    <div
                      className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium",
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </div>
                  )}

                  {/* Booking Source */}
                  {reservation.bookingSource && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {reservation.bookingSource === 'website' ? (
                        <>
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Website</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Internal</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* {reservation.bookingSource === 'website' && 
                 reservation.unreadMessages && 
                 reservation.unreadMessages > 0 && (
                  <div
                    onClick={handleNavigateToMessages}
                    className="bg-blue-50 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-semibold text-sm">
                        {reservation.unreadMessages} unread message{reservation.unreadMessages !== 1 ? 's' : ''}
                      </p>
                      <p className="text-blue-700 text-xs mt-0.5">
                        Click here to respond to the guest's inquiries.
                      </p>
                    </div>
      
                  </div>
                )} */}

                <div className='border-b border-gray-200 my-4'></div>
                <div className="">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">
                      Pricing Summary
                    </h2>
                 {(reservation.status === 'confirmed' || reservation.status === 'completed') &&    <button
                      onClick={() => setShowAddPaymentModal(true)}
                      className="btn-outline "
                    >
                      Adaugă plată in avans
                    </button>}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm text-gray-600">Preț de bază</p>
                        {pricingBreakdown?.kind === 'per_guest' && (
                          <p className="text-xs text-gray-600">
                            {pricingBreakdown.guests}{' '}
                            {pricingBreakdown.guests === 1 ? 'persoană' : 'persoane'} ×{' '}
                            {pricingBreakdown.unitPrice.toLocaleString()}{' '}
                            {currencySymbolFromCode(pricingBreakdown.currency)} / persoană
                          </p>
                        )}
                        {pricingBreakdown?.kind === 'per_hour' && (
                          <p className="text-xs text-gray-600">
                            {pricingBreakdown.hours}{' '}
                            {pricingBreakdown.hours === 1 ? 'oră' : 'ore'} ×{' '}
                            {pricingBreakdown.unitPrice.toLocaleString()}{' '}
                            {currencySymbolFromCode(pricingBreakdown.currency)} / oră
                          </p>
                        )}
                        {pricingBreakdown?.kind === 'per_day' && (
                          <p className="text-xs text-gray-600">
                            {pricingBreakdown.days}{' '}
                            {pricingBreakdown.days === 1 ? 'zi' : 'zile'} ×{' '}
                            {pricingBreakdown.unitPrice.toLocaleString()}{' '}
                            {currencySymbolFromCode(pricingBreakdown.currency)} / zi
                          </p>
                        )}
                        {pricingBreakdown?.kind === 'poa' && (
                          <p className="text-xs text-gray-500">Preț la cerere</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 tabular-nums flex-shrink-0 text-right">
                        {`${reservation.totalPrice.toLocaleString()} ${bookingCurrencySymbol}`}
                      </p>
                    </div>

                    {notesTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Notes Adjustments</p>
                        <p className="text-sm font-medium text-gray-900">
                          {notesTotal.toLocaleString()} {bookingCurrencySymbol}
                        </p>
                      </div>
                    )}

                    {totalAdvancePayments > 0 && (
                      <>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-900">Plăți în avans</p>
                          </div>
                          <div className="space-y-2">
                            {advancePayments.map((payment) => (
                              <div key={payment.id} className="flex items-start justify-between bg-green-50 rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {payment.amount.toLocaleString()} {bookingCurrencySymbol}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {formatDate(payment.date)}
                                  </p>
                                  {payment.notes && (
                                    <p className="text-xs text-gray-600 mt-1.5 italic">
                                      {payment.notes}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => payment.id && handleDeletePaymentClick(payment.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors flex-shrink-0 ml-2"
                                  title="Șterge plată"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                            <p className="text-sm text-gray-600">Total plătit</p>
                            <p className="text-sm font-medium text-green-700">
                              {totalAdvancePayments.toLocaleString()} {bookingCurrencySymbol}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Total</p>
                        <p className="text-sm font-bold text-gray-900">
                          {(parseInt(reservation.totalPrice.toString()) + parseInt(notesTotal.toString())).toLocaleString()}{' '}
                          {bookingCurrencySymbol}
                        </p>
                      </div>
                      {totalAdvancePayments > 0 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">Rămas de plată</p>
                          <p className={`text-sm font-bold ${remainingAmount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {remainingAmount.toLocaleString()} lei
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='border-b border-gray-200 my-4'></div>
                <ReservationDetails item={reservation} />
                <div className='border-b border-gray-200 my-4'></div>
                <ClientDetails item={reservation} />
                <div className='border-b border-gray-200 my-4'></div>


                {bookingId && <Attachements bookingId={bookingId} />}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end gap-3">
                {/* Dropdown Menu for Confirmed Status */}
                {reservation.status === 'confirmed' && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <button
                            onClick={handleEdit}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={processing}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">


          <Notes bookingId={bookingId} onNotesChange={fetchReservation} />


          {/* Pricing Summary */}

        </div>
      </div>

      {/* Edit Booking Modal */}
      <CustomModal
        open={!!editingBookingSlug}
        onClose={() => {
          setEditingBookingSlug(null);
        }}
        title={`Edit Booking - #${editingBookingSlug?.split("-")[1]}`}
      >
        {editingBookingSlug && (
          <BookingFormBun
            slug={editingBookingSlug}
            isTitleHidden={true}
            onSuccess={() => {
              fetchReservation();
              setEditingBookingSlug(null);
            }}
          />
        )}
      </CustomModal>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Booking"
        text="Are you sure you want to cancel this booking? This action cannot be undone."
        cancelText="No, keep it"
        confirmText="Yes, cancel"
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
      />

      {/* Reject pending booking confirmation */}
      <ConfirmModal
        isOpen={showRejectPendingModal}
        title="Respinge rezervarea"
        text="Sigur doriți să respingeți această cerere de rezervare? Această acțiune nu poate fi anulată."
        cancelText="Anulează"
        confirmText="Respinge"
        onClose={() => setShowRejectPendingModal(false)}
        onConfirm={confirmRejectPending}
      />

      {/* Delete Payment Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeletePaymentModal}
        title="Șterge plată în avans"
        text="Sigur doriți să ștergeți această plată? Această acțiune nu poate fi anulată."
        cancelText="Anulează"
        confirmText="Șterge"
        onClose={() => {
          setShowDeletePaymentModal(false);
          setPaymentToDelete(null);
        }}
        onConfirm={handleDeletePaymentConfirm}
      />

      {/* Add Advance Payment Modal */}
      <CustomModal
        open={showAddPaymentModal}
        onClose={() => {
          setShowAddPaymentModal(false);
          setPaymentAmount('');
          setPaymentDate(new Date());
          setPaymentNotes('');
        }}
        title="Adaugă plată în avans"
        className="relative bg-white rounded-xl w-full max-w-md flex flex-col overflow-hidden"
      >
        <div className="p-6 space-y-4">
          <CustomInput
            label={`Sumă (${bookingCurrencySymbol})`}
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="150"
            required
          />
          <CustomDatePicker
            label="Data plății"
            selected={paymentDate}
            onChange={(date) => setPaymentDate(date)}
            placeholder="Selectează data"
            iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
            showTimeSelect={false}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            required
          />
          <CustomTextarea
            label="Detalii / Note"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Ex: Plată parțială, avans pentru rezervare, etc."
            rows={3}
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAddPaymentModal(false);
                setPaymentAmount('');
                setPaymentDate(new Date());
                setPaymentNotes('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Anulează
            </button>
            <button
              onClick={handleAddPayment}
              disabled={addingPayment || !paymentAmount || !paymentDate}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {addingPayment ? 'Se adaugă...' : 'Adaugă'}
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default Overview;
