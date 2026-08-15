import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ReservationItem from "../../pages/protected/client/Reservations/ReservationItem";
import type { Reservation } from "../../pages/protected/client/Reservations/types";
import { getBookings } from "../../api/bookings/bookings";
import { useUserStore } from "../../store/user.store";

type ReservationsProps = {
  reservations?: Reservation[];
};

const Reservations: React.FC<ReservationsProps> = ({ reservations = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [confirmedReservations, setConfirmedReservations] = useState<Reservation[]>([]);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [completedReservations, setCompletedReservations] = useState<Reservation[]>([]);

  const transformBookingToReservation = (booking: any): Reservation => {
    let status = booking.status;
    if (status === "completed") {
      status = "past";
    }
    
    return {
      id: booking.id,
      code: booking.code,
      locationName: booking.locationName,
      address: booking.locationAddress,
      image: booking.locationPhoto,
      status: status as Reservation["status"],
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests || 0,
      expiresAt: booking.expiresAt,
    };
  };

  const fetchConfirmedBookings = async () => {
    try {
      const { status, response } = await getBookings({ type: 'customer', status: 'confirmed' });
      if (status === 200 && response?.data) {
        const transformed = response.data.map(transformBookingToReservation);
        setConfirmedReservations(transformed);
      }
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const { status, response } = await getBookings({ type: 'customer', status: 'pending' });
      if (status === 200 && response?.data) {
        const transformed = response.data.map(transformBookingToReservation);
        setPendingReservations(transformed);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const fetchCancelledBookings = async () => {
    try {
      const { status, response } = await getBookings({ type: 'customer', status: 'cancelled' });
      if (status === 200 && response?.data) {
        const transformed = response.data.map(transformBookingToReservation);
        setCancelledReservations(transformed);
      }
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error);
    }
  };

  const fetchCompletedBookings = async () => {
    try {
      const { status, response } = await getBookings({ type: 'customer', status: 'completed' });
      if (status === 200 && response?.data) {
        const transformed = response.data.map(transformBookingToReservation);
        setCompletedReservations(transformed);
      }
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConfirmedBookings();
      fetchPendingBookings();
      fetchCancelledBookings();
      fetchCompletedBookings();
    }
  }, [user]);

  const isExpired = (reservation: Reservation): boolean => {
    if (reservation.status !== "pending" || !reservation.expiresAt) {
      return false;
    }
    const expirationDate = new Date(reservation.expiresAt);
    const now = new Date();
    return expirationDate < now;
  };

  const normalizeReservationStatus = (reservation: Reservation): Reservation => {
    // Transform pending reservations that are expired to "expired" status
    if (reservation.status === "pending" && isExpired(reservation)) {
      return {
        ...reservation,
        status: "expired",
      };
    }
    return reservation;
  };

  const filteredReservations = (() => {
    const allReservations = [
      ...confirmedReservations,
      ...pendingReservations,
      ...cancelledReservations,
      ...completedReservations,
    ];

    // If no fetched data, use props as fallback
    const dataToUse = allReservations.length > 0 ? allReservations : reservations;

    // Normalize statuses (transform expired pending to expired)
    const normalizedReservations = dataToUse.map(normalizeReservationStatus);

    if (activeTab === "upcoming") {
      return normalizedReservations.filter(r => {
        // Include confirmed or pending that are NOT expired
        if (r.status === "confirmed") return true;
        if (r.status === "pending") return !isExpired(r);
        return false;
      });
    }
    if (activeTab === "completed") {
      return normalizedReservations.filter(r => r.status === "past");
    }
    if (activeTab === "cancelled") {
      return normalizedReservations.filter(r => {
        // Include cancelled status OR expired status
        return r.status === "cancelled" || r.status === "expired";
      });
    }
    return [];
  })();

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "upcoming":
        return t("dashboard.reservations_upcoming");
      case "completed":
        return t("dashboard.reservations_completed");
      case "cancelled":
        return t("dashboard.reservations_cancelled");
      default:
        return tab;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="">
        {/* Filter Buttons */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 inline-flex gap-1">
            {(["upcoming", "completed", "cancelled"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-2.5 py-1 text-xs font-normal whitespace-nowrap transition-all rounded-md flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span>{getTabLabel(tab)}</span>
                
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {filteredReservations.length > 0 ? (
            <div className="space-y-3">
              {filteredReservations.map((reservation) => (
                <ReservationItem
                  key={reservation.id}
                  reservation={reservation}
                  activeTab={activeTab === "upcoming" ? "current" : activeTab === "completed" ? "past" : "cancelled"}
                  onClick={() => navigate(`/booking/view/${reservation.id}/${reservation.code}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {t("dashboard.no_reservations")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reservations;

