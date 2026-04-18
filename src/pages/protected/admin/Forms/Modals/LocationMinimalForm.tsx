import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { useTranslation } from "react-i18next";
import { createBooking, getBookingById, getBookingMetadata, updateBooking } from "../../../../../api/bookings/bookings";

import { toSelectOptions } from "../../../../../lib/utils";
import CustomSelect from "../../../../../components/shared/CustomSelect";
import CustomInput from "../../../../../components/shared/CustomInput";

type SelectOption = { value: string | number; label: string };

type FormValues = {
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
};

type BookingFormBunProps = {
    slug: string;
};

export const LocationMinimalForm: React.FC<BookingFormBunProps> = ({ slug }) => {
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: {
            categoryId: 0,
            locationId: 0,
            status: "pending",
            guests: 0,
            totalPrice: 0,
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            checkIn: "",
            checkOut: "",
        },
    });

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

        const action = bookingId ? () => updateBooking(bookingId, data) : () => createBooking(data);

        const { environment } = await action();

        if (environment.status === 200) {
            setFeedback({ type: "success", message: t("common.update_success") });
            fetchBooking();
            return;
        }
        setFeedback({ type: "error", message: t("common.update_error") });

    };

    const fetchBooking = async () => {
        if (!bookingId) return;

        const { environment, response } = await getBookingById(bookingId);
        if (environment.status === 200 && response?.data) {
            const b = response.data;

            reset({
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
            });

            setBookingData(b);
            setOptions({
                categories: toSelectOptions(b?.metadata_options?.categories),
                locations: toSelectOptions(b?.metadata_options?.locations),
            });
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
                }
                await fetchMetadataOptions();
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, [slug]);

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
            {isEditMode && (
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Edit Booking
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        #{bookingData.code}
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

                {/* 2. Check-in & Check-out */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Controller
                        name="checkIn"
                        control={control}
                        rules={{ required: t("common.required") as string }}
                        render={({ field }) => (
                            <CustomInput
                                label="Check In"
                                type="datetime-local"
                                value={field.value ? field.value.substring(0, 16) : ""}
                                onChange={field.onChange}
                                required
                                error={errors.checkIn?.message as string}
                            />
                        )}
                    />
                    <Controller
                        name="checkOut"
                        control={control}
                        rules={{ required: t("common.required") as string }}
                        render={({ field }) => (
                            <CustomInput
                                label="Check Out"
                                type="datetime-local"
                                value={field.value ? field.value.substring(0, 16) : ""}
                                onChange={field.onChange}
                                required
                                error={errors.checkOut?.message as string}
                            />
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

