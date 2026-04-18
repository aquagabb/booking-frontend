import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Users,
  MapPin,
  MessageCircle,
  Clock,
  Hash,
  Edit,
  X,
  Phone,
  Mail,
  Copy,
  Check,
  Euro,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { getBookingById } from "../../../../api/bookings/bookings";
import { formatDate } from "../../../../lib/utils";
import CancelReservationModal from "./CancelReservationModal";
import ChangeDatesModal from "./ChangeDatesModal";
import EditReservationModal from "./EditReservation";

import { useUserStore } from '../../../../store/user.store';
import LoginModal from "./LoginModal";
import type { PricingItem } from "../../../../types/pricing";
import {
  formatMoneyWithSymbol,
  formatUnitMoney,
  getClientPricingBreakdown,
} from "../../../../utils/bookingPricingDisplay";

type Reservation = {
  id: string | number;
  code: string;
  eventName?: string;
  venue?: string;
  location?: string;
  address?: string;
  type?: string;
  guests: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  checkIn: string;
  checkOut: string;
  createdAt?: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  image: string;
  price: string | number;
  additionalInfo?: string;
  locationGoogleMapsLink?: string;
  locationSlug?: string;
  locationId?: string | number;
  categoryId?: number | string;
  /** Snapshot pricing from API (object or array) */
  pricing?: PricingItem | PricingItem[];
  currencyCode?: string;
  /** For `per_time`: hour vs day rate */
  bookingType?: "hour" | "day" | "guest";
  pendingModification?: boolean;
  pendingDateChange?: boolean;
  modificationRequestExpiresAt?: string;
  /** API may send `expiresAt` and/or `pendingConfirmationExpiresAt` for pending confirmation deadline */
  expiresAt?: string;
  pendingConfirmationExpiresAt?: string;
  requestedGuests?: number;
  requestedEventName?: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  cancellationReason?: {
    reason: string;
    cancelledAt: string;
  };
};

const ReservationClient = () => {
  const { id, code } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangeDatesModal, setShowChangeDatesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [copied, setCopied] = useState(false);


  const { user } = useUserStore();
  const isLogged = user?.email ? true : false;

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const queryParams: any = { type: "customer", code: code };

        const { status, response } = await getBookingById(id, queryParams, isLogged);

        if (status === 200 && response?.data) {
          const bookingData = response.data;

          const reservationData: Reservation = {
            id: bookingData.id,
            code: bookingData.code,
            eventName: bookingData.eventName || "Event",
            venue: bookingData.locationName || "Venue",
            location: bookingData.locationAddress || "",
            address: bookingData.locationAddress || "",
            type: bookingData.eventName || "Event",
            guests: bookingData.guests || 0,
            customer: {
              name: bookingData.customerName || "",
              email: bookingData.customerEmail || "",
              phone: bookingData.customerPhone || "",
            },
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            createdAt: bookingData.createdAt,
            status: bookingData.status as "confirmed" | "pending" | "cancelled" | "completed",
            image: bookingData.locationPhoto || "",
            price: bookingData.totalPrice || 0,
            additionalInfo: bookingData.additionalInfo || bookingData.observations || "",
            locationGoogleMapsLink: bookingData.locationGoogleMapsLink,
            locationSlug: bookingData.locationSlug,
            locationId: bookingData.locationId,
            categoryId: bookingData.categoryId,
            pricing: bookingData.pricing,
            currencyCode: bookingData.currencyCode,
            bookingType:
              bookingData.bookingType === "hour" ||
              bookingData.bookingType === "day" ||
              bookingData.bookingType === "guest"
                ? bookingData.bookingType
                : undefined,
            cancellationReason: bookingData.cancellationReason,
            pendingModification: bookingData.pendingModification || false,
            pendingDateChange: bookingData.pendingDateChange || false,
            modificationRequestExpiresAt: bookingData.modificationRequestExpiresAt,
            expiresAt: bookingData.expiresAt,
            pendingConfirmationExpiresAt: bookingData.pendingConfirmationExpiresAt,
            requestedGuests: bookingData.requestedGuests,
            requestedEventName: bookingData.requestedEventName,
            requestedCheckIn: bookingData.requestedCheckIn,
            requestedCheckOut: bookingData.requestedCheckOut,
          };

          setReservation(reservationData);
        } else {
          setError(t("reservations.not_found") || "Reservation not found");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError(t("reservations.load_error") || "Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, code, isLogged]);

  const pricingDisplay = useMemo(() => {
    if (!reservation) {
      return {
        resolvedCurrency: "EUR",
        pricingDetailLine: null as string | null,
        pricingModeLine: null as string | null,
        totalFormatted: "",
        showTotal: false,
      };
    }
    const { currencyCode: resolvedCurrency, breakdown } = getClientPricingBreakdown({
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
      bookingType: reservation.bookingType,
      pricing: reservation.pricing,
      currencyCodeFallback: reservation.currencyCode || "EUR",
    });

    const totalRaw =
      typeof reservation.price === "number"
        ? reservation.price
        : parseFloat(String(reservation.price));
    const showTotal = Number.isFinite(totalRaw) && totalRaw > 0;

    let pricingDetailLine: string | null = null;
    let pricingModeLine: string | null = null;
    if (breakdown) {
      if (breakdown.kind === "poa") {
        pricingDetailLine = t("reservations.pricing_poa");
        pricingModeLine = t("reservations.pricing_poa");
      } else {
        const unitStr = formatUnitMoney(breakdown.unitPrice, resolvedCurrency);
        if (breakdown.kind === "per_guest") {
          pricingDetailLine = t("reservations.pricing_detail_guest", {
            guests: breakdown.guests,
            unit: unitStr,
          });
          pricingModeLine = t("reservations.pricing_mode_guest", { unit: unitStr });
        } else if (breakdown.kind === "per_hour") {
          pricingDetailLine = t("reservations.pricing_detail_hour", {
            hours: breakdown.hours,
            unit: unitStr,
          });
          pricingModeLine = t("reservations.pricing_mode_hour", { unit: unitStr });
        } else if (breakdown.kind === "per_day") {
          pricingDetailLine = t("reservations.pricing_detail_day", {
            days: breakdown.days,
            unit: unitStr,
          });
          pricingModeLine = t("reservations.pricing_mode_day", { unit: unitStr });
        }
      }
    }

    const totalFormatted = showTotal
      ? formatMoneyWithSymbol(totalRaw, resolvedCurrency)
      : "";

    return { resolvedCurrency, pricingDetailLine, pricingModeLine, totalFormatted, showTotal };
  }, [reservation, t]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        {t("reservations.loading") || "Loading reservation..."}
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="mb-6 text-sm flex items-center gap-2 text-gray-500">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate("/account/bookings")}
            className="cursor-pointer font-semibold text-primary"
          >
            {t("reservations.breadcrumb_bookings")}
          </span>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold text-gray-900">{t("reservations.details_title")}</span>
        </div>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          {error || t("reservations.not_found") || "Reservation not found."}
        </div>
      </div>
    );
  }

  const handleLocationClick = () => {
    if (reservation.locationSlug) {
      navigate(`/restaurants/${reservation.locationSlug}`);
    }
  };

  const handleCopyCode = async () => {
    if (reservation?.code) {
      try {
        await navigator.clipboard.writeText(reservation.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  const getStatusBadge = () => {
    const status = reservation.status;
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
          <Clock className="w-3 h-3" />
          {t("bookings.pending")}
        </span>
      );
    } else if (status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30">
          <Check className="w-3 h-3" />
          {t("bookings.confirmed")}
        </span>
      );
    } else if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          <X className="w-3 h-3" />
          {t("bookings.cancelled")}
        </span>
      );
    } else {
      // completed or past
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
          {t("bookings.completed")}
        </span>
      );
    }
  };

  const isModificationPending = reservation.pendingModification || reservation.pendingDateChange;
  const canEditOrChangeDates = reservation.status === "confirmed" && !isModificationPending;
  const canCancel = reservation.status === "confirmed" || reservation.status === "pending";
  const isPending = reservation.status === "pending";
  const isConfirmed = reservation.status === "confirmed";

  const pendingConfirmationDeadline =
    reservation.expiresAt || reservation.pendingConfirmationExpiresAt || null;

  const formatPendingConfirmationDeadline = (iso: string) => {
    const locale = i18n.language?.startsWith("ro") ? "ro-RO" : i18n.resolvedLanguage || "en-US";
    return new Date(iso).toLocaleString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusMessage = () => {
    const venue = reservation.venue || t("reservations.restaurant");
    switch (reservation.status) {
      case "confirmed":
        return t("reservations.confirmed_message", { venue });
      case "pending":
        return t("reservations.pending_message", { venue });
      case "cancelled":
        return t("reservations.cancelled_message", { venue });
      case "completed":
        return t("reservations.completed_message", { venue });
      default:
        return t("reservations.confirmed_message", { venue });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="mb-6 text-sm flex items-center gap-2 text-gray-500">
        <span
          role="button"
          tabIndex={0}
          onClick={() => navigate("/account/bookings")}
          className="cursor-pointer font-semibold text-primary"
        >
          {t("reservations.breadcrumb_bookings")}
        </span>
        <span className="text-gray-400">&gt;</span>
        <span className="font-semibold text-gray-900">{t("reservations.details_title")}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getStatusMessage()}
          </h1>
        </div>
        {isModificationPending && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                  {reservation.pendingDateChange 
                    ? t("reservations.date_change_pending_title")
                    : t("reservations.modification_pending_title")}
                </p>
                {reservation.pendingDateChange ? (
                  <div className="space-y-2">
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                      {t("reservations.date_change_pending_message")}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        {t("reservations.you_requested")}:
                      </p>
                      <div className="pl-4 space-y-1.5 text-amber-700 dark:text-amber-400">
                        {reservation.requestedGuests && reservation.requestedGuests !== reservation.guests && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {reservation.requestedGuests} {t("profile.guests")}
                            </span>
                          </div>
                        )}
                        {reservation.requestedEventName && reservation.requestedEventName !== reservation.eventName && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{reservation.requestedEventName}</span>
                          </div>
                        )}
                        {(reservation.requestedCheckIn || reservation.requestedCheckOut) && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {reservation.requestedCheckIn && formatDate(reservation.requestedCheckIn)}
                              {reservation.requestedCheckIn && reservation.requestedCheckOut && " - "}
                              {reservation.requestedCheckOut && formatDate(reservation.requestedCheckOut)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t("reservations.modification_pending_message")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {isPending && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                  {t("reservations.pending_confirmation_title")}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {pendingConfirmationDeadline
                    ? t("reservations.pending_confirmation_message_until", {
                        deadline: formatPendingConfirmationDeadline(pendingConfirmationDeadline),
                      })
                    : t("reservations.pending_confirmation_message")}
                </p>
              </div>
            </div>
          </div>
        )}
        {reservation.status === "cancelled" && reservation.cancellationReason && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  {t("reservations.cancellation_info_title")}
                </p>
                <div className="space-y-2 text-sm">
                  {reservation.cancellationReason.reason && (
                    <div className="text-blue-700 dark:text-blue-400">
                      <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                        {t("reservations.cancellation_reason")}:
                      </p>
                      <p className="text-blue-700 dark:text-blue-400">
                        {reservation.cancellationReason.reason}
                      </p>
                    </div>
                  )}
                  {reservation.cancellationReason.cancelledAt && (
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {t("reservations.cancelled_at")}:
                        </span>{" "}
                        {formatDate(reservation.cancellationReason.cancelledAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("reservations.details_title")}
          </h2>
        </div>
        <div className="space-y-4">
          {reservation.code && (
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.code")}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono tracking-widest">
                    {reservation.code}
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    title={copied ? t("reservations.copied") || "Copied!" : t("reservations.copy_code") || "Copy code"}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("profile.check_in")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(reservation.checkIn)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("profile.check_out")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(reservation.checkOut)}
                </p>
              </div>
            </div>
            {(pricingDisplay.showTotal || pricingDisplay.pricingDetailLine) && (
              <div className="flex items-center gap-3">
                <Euro className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.total_price")}</p>
                  {pricingDisplay.showTotal && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pricingDisplay.totalFormatted}
                    </p>
                  )}
                  
                </div>
              </div>
            )}
          </div>


          {pricingDisplay.pricingModeLine && (
            <div className="flex items-center gap-3">
              <Euro className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("reservations.pricing_mode_label")}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pricingDisplay.pricingModeLine}
                </p>
              </div>
            </div>
          )}

          
          {(pricingDisplay.showTotal || pricingDisplay.pricingDetailLine) && (
             <div className="flex items-center gap-3">
                <Euro className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.total_price")}</p>
                  {pricingDisplay.showTotal && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pricingDisplay.totalFormatted}
                    </p>
                  )}
                  
                </div>
              </div>
          )}
          
          {reservation.createdAt && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.reserved_at")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(reservation.createdAt)}
                </p>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t("bookings.location")}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-1/4">
                <img
                  src={reservation.image}
                  alt={reservation.venue}
                  className="w-full h-48 sm:h-full object-cover rounded-lg"
                />
              </div>
              <div className="sm:flex-1 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("reservations.name")}</p>
                  {reservation.locationSlug ? (
                    <h2
                      onClick={handleLocationClick}
                      className="text-sm font-medium hover:text-primary/80 hover:underline transition-all cursor-pointer text-gray-900 dark:text-white inline-block"
                    >
                      {reservation.venue}
                    </h2>
                  ) : (
                    <h2 className="text-sm font-medium text-gray-900 dark:text-white inline-block">
                      {reservation.venue}
                    </h2>
                  )}
                </div>
                {reservation.address && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("locations.address")}</p>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {reservation.address}
                      </p>
                      {reservation.locationGoogleMapsLink && (
                        <a
                          href={reservation.locationGoogleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors text-sm inline-flex items-center gap-1 w-fit"
                        >
                          <MapPin className="w-4 h-4" />
                          {t("reservations.view_on_maps")}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("bookings.category")}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {reservation.eventName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.guests")}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {reservation.guests} {t("profile.guests")}
              </p>
            </div>
          </div>
          {reservation.additionalInfo && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t("reservations.observations")}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {reservation.additionalInfo}
              </p>
            </div>
          )}
        </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("reservations.customer_info")}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.name")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {reservation.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("auth.email")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {reservation.customer.email}
                </p>
              </div>
              {reservation.customer.phone && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("reservations.phone")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reservation.customer.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-80 space-y-4">
          {(canCancel || (isConfirmed && !canEditOrChangeDates)) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("reservations.manage_reservation")}
              </h3>
              <div className="space-y-2">
                {isConfirmed && canEditOrChangeDates && (
                  <>
                    <button
                      onClick={() => isLogged ? setShowEditModal(true) : setShowLoginModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t("profile.edit_reservation")}</span>
                    </button>
                    <button
                      onClick={() => isLogged ? setShowChangeDatesModal(true) : setShowLoginModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span>{t("reservations.change_dates")}</span>
                    </button>
                  </>
                )}
                {canCancel && (
                  <button
                    onClick={() => isLogged ? setShowCancelModal(true) : setShowLoginModal(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{t("profile.cancel_reservation")}</span>
                  </button>
                )}
                {isConfirmed && !canEditOrChangeDates && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    {t("reservations.wait_for_modification")}
                  </p>
                )}
              </div>
            </div>
          )}

          {(isPending || isConfirmed) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 ">
                {t("reservations.contact_property")}
              </h3>
              <div className="space-y-3">
                {isConfirmed && reservation.customer.phone && (
                  <a 
                    href={`tel:+${reservation.customer.phone}`}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>+{reservation.customer.phone}</span>
                  </a>
                )}
                <button
                  onClick={() => isLogged ? navigate(`/account/messages?conversationId=${reservation.id}`) : setShowLoginModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t("reservations.send_message")}</span>
                </button>
                {isConfirmed && (
                  <button
                    onClick={() => isLogged ? window.location.href = `mailto:${reservation.customer.email}` : setShowLoginModal(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{t("reservations.send_email")}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CancelReservationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        bookingCode={reservation.code}
        onSuccess={() => {
          // Refresh the reservation data after successful cancellation
          window.location.reload();
        }}
      />

      <ChangeDatesModal
        isOpen={showChangeDatesModal}
        onClose={() => setShowChangeDatesModal(false)}
        bookingCode={reservation.code}
        bookingId={reservation.id}
        currentCheckIn={reservation.checkIn}
        currentCheckOut={reservation.checkOut}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      <EditReservationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        bookingId={reservation.id}
        bookingCode={reservation.code}
        currentCategoryId={reservation.categoryId}
        currentGuests={reservation.guests}
        onSuccess={() => {
          // Refresh the reservation data after successful edit
          window.location.reload();
        }}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ReservationClient;
