import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Calendar, Clock } from "lucide-react";
import { updateBookingDates } from "../../../../api/bookings/bookings";
import CustomDatePicker from "../../../../components/shared/CustomDatePicker";
import CustomInput from "../../../../components/shared/CustomInput";

interface ChangeDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  bookingCode: string;
  currentCheckIn: string;
  currentCheckOut: string;
  onSuccess?: () => void;
}

const ChangeDatesModal: React.FC<ChangeDatesModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  currentCheckIn,
  currentCheckOut,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentCheckIn && currentCheckOut) {

      const checkInDateObj = new Date(currentCheckIn);
      const checkOutDateObj = new Date(currentCheckOut);

      setCheckInDate(checkInDateObj);
      setCheckOutDate(checkOutDateObj);

      const startTimeStr = checkInDateObj.toTimeString().slice(0, 5);
      const endTimeStr = checkOutDateObj.toTimeString().slice(0, 5);

      setStartTime(startTimeStr);
      setEndTime(endTimeStr);
    }
  }, [isOpen, currentCheckIn, currentCheckOut]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!checkInDate || !checkOutDate) {
      setError(t("change_dates.date_required") || "Please select both check-in and check-out dates");
      return;
    }

    if (!startTime || !endTime) {
      setError(t("change_dates.time_required") || "Please provide both start and end times");
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError(t("change_dates.invalid_dates") || "Check-out date must be after check-in date");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {

      const [startHours, startMinutes] = startTime.split(":");
      const [endHours, endMinutes] = endTime.split(":");

      const newCheckIn = new Date(checkInDate);
      newCheckIn.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const newCheckOut = new Date(checkOutDate);
      newCheckOut.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      if (newCheckOut <= newCheckIn) {
        setError(t("change_dates.invalid_times"));
        setIsSubmitting(false);
        return;
      }

      const { status } = await updateBookingDates({
        bookingCode: bookingCode,
        checkIn: newCheckIn.toISOString(),
        checkOut: newCheckOut.toISOString(),
      });

      if (status === 200 || status === 201) {
        onSuccess?.();
        handleClose();
      } else {
        setError(t("change_dates.error"));
      }
    } catch (err) {
      console.error("Error updating booking dates:", err);
      setError(t("change_dates.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("reservations.change_dates")}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <CustomDatePicker
                  label={t("profile.check_in")}
                  selected={checkInDate}
                  onChange={(date) => {
                    setCheckInDate(date);
                    setError(null);
                  }}
                  placeholder={t("change_dates.select_date") || "Select date"}
                  iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
                  minDate={today}
                  showTimeSelect={false}
                  dateFormat="dd/MM/yyyy"
                  required
                />
              </div>
              <div>
                <CustomDatePicker
                  label={t("profile.check_out")}
                  selected={checkOutDate}
                  onChange={(date) => {
                    setCheckOutDate(date);
                    setError(null);
                  }}
                  placeholder={t("change_dates.select_date") || "Select date"}
                  iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
                  minDate={checkInDate || today}
                  showTimeSelect={false}
                  dateFormat="dd/MM/yyyy"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label={t("change_dates.start_time") || "Start time"}
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
                iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                required
              />
              <CustomInput
                label={t("change_dates.end_time") || "End time"}
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-outline-transparent"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !checkInDate || !checkOutDate || !startTime || !endTime}
              className="btn-primary"
            >
              {isSubmitting
                ? t("common.saving")
                : t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeDatesModal;
