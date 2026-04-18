import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cancelBooking } from "../../../../api/bookings/bookings";
import CustomTextarea from "../../../../components/shared/CustomTextarea";
import CustomRadioButton from "../../../../components/shared/CustomRadioButton";

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  onSuccess?: () => void;
}

const CANCEL_REASONS = [
  { value: "found_another_property", label: "cancel_reason.found_another_property" },
  { value: "change_of_plans", label: "cancel_reason.change_of_plans" },
  { value: "price_too_high", label: "cancel_reason.price_too_high" },
  { value: "other", label: "cancel_reason.other" },
];

const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError(t("cancel_reason.required") || "Please select a cancellation reason");
      return;
    }

    if (selectedReason === "other" && !customReason.trim()) {
      setError(t("cancel_reason.custom_required") || "Please provide a reason");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reasonText = selectedReason === "other" 
        ? customReason 
        : t(`cancel_reason.${selectedReason}`);
      
      const { status } = await cancelBooking({
        bookingCode,
        reason: reasonText,
      });

      if (status === 200 || status === 201) {
        onSuccess?.();
        handleClose();
      } else {
        setError(t("cancel_reason.error") || "Failed to cancel reservation. Please try again.");
      }
    } catch (err) {
      console.error("Error canceling booking:", err);
      setError(t("cancel_reason.error") || "Failed to cancel reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("reservations.cancel_title")}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("reservations.cancel_text")}
          </p>

          <div className="space-y-4 mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t("cancel_reason.title") || "Reason for cancellation"}
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <CustomRadioButton
                  key={reason.value}
                  name="cancelReason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(value) => {
                    setSelectedReason(value);
                    setError(null);
                  }}
                  label={t(reason.label)}
                  error={!!error && !selectedReason}
                />
              ))}
            </div>

            {selectedReason === "other" && (
              <div className="mt-4">
                <CustomTextarea
                  label={t("cancel_reason.custom_label") || "Please provide details"}
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    setError(null);
                  }}
                  placeholder={t("cancel_reason.custom_placeholder") || "Enter your reason..."}
                  rows={4}
                  required
                  error={error && !customReason.trim() ? error : undefined}
                />
              </div>
            )}

            {error && selectedReason !== "other" && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t("common.saving") || "Saving..."
                : t("reservations.confirm_cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal;

