import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ReservationList from "./client/Reservations/ReservationList";
import { getBookings } from "../../api/bookings/bookings";
import type { Reservation } from "./client/Reservations/types";
import { useUserStore } from "../../store/user.store";

const BookingHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<"current" | "past" | "cancelled">(
    "current"
  );
  const [confirmedReservations, setConfirmedReservations] = useState<Reservation[]>([]);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [completedReservations, setCompletedReservations] = useState<Reservation[]>([]);

  const transformBookingToReservation = (booking: any): Reservation => {
    // Map "completed" status to "past" to match Reservation type
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

  const filteredReservations = (() => {
    if (activeTab === "past") return completedReservations;
    if (activeTab === "cancelled") return cancelledReservations;
    if (activeTab === "current")
      return [...confirmedReservations, ...pendingReservations];
    return [];
  })();

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition mb-4"
      >
        <ArrowLeft size={18} />
        {t("common.back")}
      </button>

      {/* Tabs */}
      <div className="flex justify-start gap-8 border-b mb-6">
        {[
          { key: "current", label: t("profile.current_reservations") },
          { key: "past", label: t("profile.past_reservations") },
          { key: "cancelled", label: t("profile.cancelled_reservations") },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`relative py-4 text-sm font-medium transition-colors 
              ${activeTab === tab.key
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-900 dark:text-gray-100 hover:text-blue-500"
              }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content (folosim ReservationList) */}
      <ReservationList items={filteredReservations} />
    </div>
  );
};

export default BookingHistory;
