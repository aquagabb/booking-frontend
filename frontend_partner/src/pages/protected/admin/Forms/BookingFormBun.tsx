import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomInput from "../../../../components/shared/CustomInput";
import CustomTextarea from "../../../../components/shared/CustomTextarea";
import CustomDatePicker from "../../../../components/shared/CustomDatePicker";
import { useTranslation } from "react-i18next";
import { createBooking, getBookingById, getBookingMetadata, updateBooking } from "../../../../api/bookings/bookings";
import CustomSelect from "../../../../components/shared/CustomSelect";
import { toSelectOptions } from "../../../../lib/utils";
import { Clock } from "lucide-react";

type SelectOption = { value: string | number; label: string };

type FormValues = {
  name: string;
  code: string;
  categoryId: number;
  locationId: number;
  status: string;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  additionalInfo: string;
};

type BookingFormBunProps = {
  slug: string;
  isTitleHidden?: boolean;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onSuccess?: () => void;
};

export const BookingFormBun: React.FC<BookingFormBunProps> = ({ slug, isTitleHidden = false, initialCheckIn, initialCheckOut, onSuccess }) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      categoryId: 0,
      locationId: 0,
      status: "pending",
      guests: 0,
      totalPrice: 0,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      checkIn: initialCheckIn || "",
      checkOut: initialCheckOut || "",
      additionalInfo: "",
    },
  });

  // Separate state for date and time
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    initialCheckIn ? new Date(initialCheckIn) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    initialCheckOut ? new Date(initialCheckOut) : null
  );
  const [checkInTime, setCheckInTime] = useState<string>(
    initialCheckIn ? new Date(initialCheckIn).toTimeString().slice(0, 5) : ""
  );
  const [checkOutTime, setCheckOutTime] = useState<string>(
    initialCheckOut ? new Date(initialCheckOut).toTimeString().slice(0, 5) : ""
  );

  // Combine date and time into ISO string for form submission
  const combineDateTime = (date: Date | null, time: string): string => {
    if (!date) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
    return combined.toISOString();
  };

  // Update form values when date or time changes
  useEffect(() => {
    if (checkInDate && checkInTime) {
      const combined = combineDateTime(checkInDate, checkInTime);
      setValue("checkIn", combined, { shouldDirty: true });
    }
  }, [checkInDate, checkInTime, setValue]);

  useEffect(() => {
    if (checkOutDate && checkOutTime) {
      const combined = combineDateTime(checkOutDate, checkOutTime);
      setValue("checkOut", combined, { shouldDirty: true });
    }
  }, [checkOutDate, checkOutTime, setValue]);

  const { t } = useTranslation();

  let bookingId: number | null = null;
  if (slug && slug !== "new") {
    const firstPart = slug.split("-")[0];
    const parsed = Number(firstPart);
    if (!Number.isNaN(parsed)) {
      bookingId = parsed;
    }
  }

  const [bookingData, setBookingData] = useState<any>({});
  const [options, setOptions] = useState<{ categories: SelectOption[]; locations: SelectOption[] }>({
    categories: [],
    locations: []
  })

  const isEditMode = Boolean(bookingId);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onSubmit = async (data: FormValues) => {
    // Ensure check-in and check-out are set from date/time combination
    if (checkInDate && checkInTime) {
      data.checkIn = combineDateTime(checkInDate, checkInTime);
    }
    if (checkOutDate && checkOutTime) {
      data.checkOut = combineDateTime(checkOutDate, checkOutTime);
    }

    // Validate that both dates and times are set
    if (!data.checkIn || !data.checkOut) {
      setFeedback({ type: "error", message: t("common.required") as string });
      return;
    }

    // Validate that check-out is after check-in
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    if (checkOut <= checkIn) {
      setFeedback({ type: "error", message: "Check-out must be after check-in" });
      return;
    }

    const action = bookingId ? () => updateBooking(bookingId, data) : () => createBooking(data);

    const { environment } = await action();

    if (environment.status === 200) {
      setFeedback({ type: "success", message: t("bookings.update_success") });
      // Refresh both booking data and metadata options to ensure selects have values
      await Promise.all([
        fetchBooking(),
        fetchMetadataOptions()
      ]);
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      return;
    }
    setFeedback({ type: "error", message: t("bookings.update_error") });

  };

  const fetchBooking = async () => {
    if (!bookingId) return;

    const { environment, response } = await getBookingById(bookingId, {}, true);
    if (environment.status === 200 && response?.data) {
      const b = response.data;

      const checkIn = b.checkIn ? new Date(b.checkIn) : null;
      const checkOut = b.checkOut ? new Date(b.checkOut) : null;

      reset({
        name: b.name || "",
        categoryId: b.categoryId || 0,
        locationId: b.locationId || 0,
        status: b.status || "pending",
        guests: b.guests || 0,
        totalPrice: b.totalPrice || 0,
        customerName: b.customerName || "",
        customerEmail: b.customerEmail || "",
        customerPhone: b.customerPhone || "",
        checkIn: b.checkIn || "",
        checkOut: b.checkOut || "",
        additionalInfo: b.additionalInfo || b.observations || "",
      });

      // Set date and time separately
      if (checkIn) {
        setCheckInDate(checkIn);
        setCheckInTime(checkIn.toTimeString().slice(0, 5));
      }
      if (checkOut) {
        setCheckOutDate(checkOut);
        setCheckOutTime(checkOut.toTimeString().slice(0, 5));
      }

      setBookingData(b);

      if (b?.metadata_options?.categories || b?.metadata_options?.locations) {
        setOptions((prevOptions) => ({
          categories: b?.metadata_options?.categories 
            ? toSelectOptions(b.metadata_options.categories) 
            : prevOptions.categories,
          locations: b?.metadata_options?.locations 
            ? toSelectOptions(b.metadata_options.locations) 
            : prevOptions.locations,
        }));
      }
    }
  };

  const fetchMetadataOptions = async () => {
    const { status, response } = await getBookingMetadata();
    if (status === 200 && response?.data) {
      setOptions({
        categories: toSelectOptions(response.data.categories),
        locations: toSelectOptions(response.data.locations),
      });
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        if (isEditMode) {
          await fetchBooking();
        } else {
          // For new bookings, set initial values if provided
          if (initialCheckIn) {
            const date = new Date(initialCheckIn);
            setCheckInDate(date);
            setCheckInTime(date.toTimeString().slice(0, 5));
            setValue("checkIn", initialCheckIn);
          }
          if (initialCheckOut) {
            const date = new Date(initialCheckOut);
            setCheckOutDate(date);
            setCheckOutTime(date.toTimeString().slice(0, 5));
            setValue("checkOut", initialCheckOut);
          }
        }
        await fetchMetadataOptions();
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [slug, initialCheckIn, initialCheckOut, setValue]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl h-full flex flex-col p-2">
      {/* Header */}
      {isEditMode && !isTitleHidden && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Booking -   #{bookingData.code}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          
          </p>
        </div>
      )}

      {/* Form scrollable */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        id="booking-form"
        className="flex-1 overflow-y-auto space-y-4 p-2"
      >
        {/* 0. Name */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Name"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message as string}
            />
          )}
        />

        {/* 1. Locatie & Event */}
        <div>
          <Controller
            name="locationId"
            control={control}
            rules={{
              required: t("common.required") as string,
              validate: (v) =>
                (v && Number(v) > 0) || (t("common.required") as string),
            }}
            render={({ field }) => (
              <CustomSelect
                label={t("bookings.location")}
                options={options.locations}
                value={options.locations.filter((o) => field.value === o.value)}
                onChange={(option: any) => field.onChange(option?.value ?? 0)}
                required
                error={errors.locationId?.message as string}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="categoryId"
            control={control}
            rules={{
              required: t("common.required") as string,
              validate: (v) =>
                (v && Number(v) > 0) || (t("common.required") as string),
            }}
            render={({ field }) => (
              <CustomSelect
                label={t("bookings.category")}
                options={options.categories}
                value={options.categories.filter((o) => field.value === o.value)}
                onChange={(option: any) => field.onChange(option?.value ?? 0)}
                required
                error={errors.categoryId?.message as string}
              />
            )}
          />
        </div>

        {/* 2. Check-in & Check-out - Split Date and Time */}
        <div className="space-y-4">
          <Controller
            name="checkIn"
            control={control}
            rules={{ 
              required: t("common.required") as string,
              validate: () => {
                if (!checkInDate || !checkInTime) {
                  return t("common.required") as string;
                }
                return true;
              }
            }}
            render={() => (
              <div>
                <label className="block text-sm font-semibold text-gray-dark mb-2">
                  Check In <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomDatePicker
                    label=""
                    selected={checkInDate}
                    onChange={(date) => {
                      setCheckInDate(date);
                      // If check-out is before new check-in, update it
                      if (date && checkOutDate && date > checkOutDate) {
                        const newCheckOut = new Date(date);
                        newCheckOut.setHours(date.getHours() + 1);
                        setCheckOutDate(newCheckOut);
                      }
                    }}
                    showTimeSelect={false}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                  <CustomInput
                    label=""
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                    required
                  />
                </div>
                {errors.checkIn && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkIn.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="checkOut"
            control={control}
            rules={{ 
              required: t("common.required") as string,
              validate: () => {
                if (!checkOutDate || !checkOutTime) {
                  return t("common.required") as string;
                }
                if (checkInDate && checkOutDate && checkInTime && checkOutTime) {
                  const checkIn = combineDateTime(checkInDate, checkInTime);
                  const checkOut = combineDateTime(checkOutDate, checkOutTime);
                  if (new Date(checkOut) <= new Date(checkIn)) {
                    return "Check-out must be after check-in";
                  }
                }
                return true;
              }
            }}
            render={() => (
              <div>
                <label className="block text-sm font-semibold text-gray-dark mb-2">
                  Check Out <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomDatePicker
                    label=""
                    selected={checkOutDate}
                    onChange={(date) => setCheckOutDate(date)}
                    showTimeSelect={false}
                    minDate={checkInDate || new Date()}
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                  <CustomInput
                    label=""
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                    required
                  />
                </div>
                {errors.checkOut && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkOut.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* 3. Guests */}
        <Controller
          name="guests"
          control={control}
          rules={{
            required: t("common.required") as string,
            min: { value: 1, message: t("common.required") as string },
          }}
          render={({ field }) => (
            <CustomInput
              label="Guests"
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              required
              error={errors.guests?.message as string}
            />
          )}
        />

        {/* 4. Status & Price */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Status"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="totalPrice"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Total Price"
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        {/* 5. Customer info */}
        <Controller
          name="customerName"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Customer Name"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="customerEmail"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Customer Email"
              type="email"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="customerPhone"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Customer Phone"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* 6. Additional Info / Observations */}
        <Controller
          name="additionalInfo"
          control={control}
          render={({ field }) => (
            <CustomTextarea
              label="Additional Info / Observations"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter any additional information or observations about this booking..."
              rows={4}
            />
          )}
        />
      </form>

      {/* Footer fix */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDirty && !feedback && (
              <span className="rounded-full px-4 py-1.5 text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                {t("common.modified")}
              </span>
            )}
            {feedback && (
              <div
                className={`text-sm font-medium px-3 py-1 rounded-lg ${feedback.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
          <div>
            <button
              type="submit"
              form="booking-form"
              disabled={isSubmitting}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              {isSubmitting ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

