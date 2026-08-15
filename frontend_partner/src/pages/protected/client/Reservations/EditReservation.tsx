import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Calendar, Users } from "lucide-react";
import { updateBooking, getBookingMetadata, requestBookingModifications } from "../../../../api/bookings/bookings";
import CustomSelect from "../../../../components/shared/CustomSelect";
import CustomInput from "../../../../components/shared/CustomInput";
import { toSelectOptions } from "../../../../lib/utils";

type SelectOption = { value: string | number; label: string };

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  bookingCode: string;
  currentCategoryId?: number | string;
  currentGuests: number;
  onSuccess?: () => void;
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingCode,
  currentCategoryId,
  currentGuests,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<SelectOption | null>(null);
  const [guests, setGuests] = useState<string>(currentGuests.toString());
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGuests(currentGuests.toString());
      fetchCategories();
    }
  }, [isOpen, currentGuests]);

  useEffect(() => {
    if (isOpen && categories.length > 0 && currentCategoryId !== undefined && currentCategoryId !== null) {
      const selectedCategory = categories.find(
        (cat) => {
          const catValue = typeof cat.value === 'string' ? Number(cat.value) : cat.value;
          const currentValue = typeof currentCategoryId === 'string' ? Number(currentCategoryId) : currentCategoryId;
          return cat.value === currentCategoryId || catValue === currentValue || cat.value === currentValue;
        }
      );
      if (selectedCategory) {
        setCategoryId(selectedCategory);
      } else {
        setCategoryId(null);
      }
    } else if (isOpen && categories.length > 0 && !currentCategoryId) {
      setCategoryId(null);
    }
  }, [isOpen, categories, currentCategoryId]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { status, response } = await getBookingMetadata();
      if (status === 200 && response?.data) {
        const categoryOptions = toSelectOptions(response.data.categories);
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!categoryId) {
      setError(t("edit_reservation.category_required") || "Please select an event type");
      return;
    }

    const guestsNum = parseInt(guests);
    if (!guests || isNaN(guestsNum) || guestsNum <= 0) {
      setError(t("edit_reservation.guests_required") || "Please enter a valid number of guests");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { status } = await requestBookingModifications({
        bookingCode: bookingCode,
        categoryId: categoryId.value,
        guests: guestsNum,
      });

      if (status === 200 || status === 201) {
        onSuccess?.();
        handleClose();
      } else {
        setError(t("edit_reservation.error") || "Failed to update reservation. Please try again.");
      }
    } catch (err) {
      console.error("Error updating reservation:", err);
      setError(t("edit_reservation.error") || "Failed to update reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setCategoryId(null);
    setGuests(currentGuests.toString());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("profile.edit_reservation")}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <CustomSelect
              label={t("bookings.category")}
              options={categories}
              value={categoryId}
              onChange={(option: any) => {
                setCategoryId(option || null);
                setError(null);
              }}
              placeholder={t("edit_reservation.select_category") || "Select event type"}
              iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
              required
              isDisabled={isLoadingCategories}
              error={error && !categoryId ? error : undefined}
            />

            <CustomInput
              label={t("reservations.guests")}
              type="number"
              value={guests}
              onChange={(e) => {
                setGuests(e.target.value);
                setError(null);
              }}
              placeholder={t("edit_reservation.guests_placeholder") || "Enter number of guests"}
              iconLeft={<Users className="w-4 h-4 text-gray-400" />}
              required
              error={error && (!guests || parseInt(guests) <= 0) ? error : undefined}
            />

            {error && categoryId && guests && parseInt(guests) > 0 && (
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
              disabled={isSubmitting || !categoryId || !guests || parseInt(guests) <= 0}
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

export default EditReservationModal;

