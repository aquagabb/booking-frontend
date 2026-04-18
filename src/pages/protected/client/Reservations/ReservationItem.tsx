import React from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Calendar, Users, Clock, ChevronRight, AlertTriangle, Hash } from "lucide-react";
import type { Reservation } from "./types";

type Props = {
  reservation: Reservation;
  activeTab: "current" | "past" | "cancelled";
  onClick: () => void;
};

const ReservationItem: React.FC<Props> = ({ reservation, onClick }) => {
  const { t } = useTranslation();

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Reservation["status"]) => {
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
          <Clock size={11} />
          {t("bookings.pending")}
        </span>
      );
    } else if (status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30">
          <Clock size={11} />
          {t("bookings.confirmed")}
        </span>
      );
    } else if (status === "past") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
          {t("bookings.completed")}
        </span>
      );
    } else if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30">
          <AlertTriangle size={11} />
          {t("bookings.expired")}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {t("bookings.cancelled")}
        </span>
      );
    }
  };



  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-3 sm:gap-4">
        {/* Image Section - Square, centered */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="w-[160px] h-[160px] rounded-lg overflow-hidden">
            <img
              src={reservation.image}
              alt={reservation.locationName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col sm:flex-row justify-between gap-3 min-w-0">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-primary transition-colors">
              {reservation.locationName}
            </h3>
            
            <div className="space-y-1.5 mb-3">
              <div className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={14} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{reservation.address}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Users size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span>
                  {reservation.guests} {t("profile.guests")}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 tracking-widest">
                <Hash size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span>
                Reservation ID: {reservation.code}
                </span>
              </div>
            </div>

            {reservation.status === "pending" && reservation.expiresAt ? (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                    Rezervarea asteapta aprobare până la {formatDateTime(reservation.expiresAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {getStatusBadge(reservation.status)}
              </div>
            )}
          </div>

          {/* Right Content - Date/Time */}
          <div className="flex-shrink-0 sm:border-l sm:border-gray-200 dark:sm:border-gray-800 sm:pl-4">
            <div className="space-y-3 min-w-[160px]">
              {/* Check In */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <Calendar size={12} />
                  {t("profile.check_in")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(reservation.checkIn)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formatTime(reservation.checkIn)}
                </div>
              </div>

              {/* Check Out */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <Calendar size={12} />
                  {t("profile.check_out")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(reservation.checkOut)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formatTime(reservation.checkOut)}
                </div>
              </div>
            </div>

            {/* View Details Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 mt-3 text-xs text-primary group-hover:gap-2 transition-all">
              <span className="font-medium">{t("profile.view_reservation")}</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationItem;
