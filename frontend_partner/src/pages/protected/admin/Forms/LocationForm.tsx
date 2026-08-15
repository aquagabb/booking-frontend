import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import CustomInput from "../../../../components/shared/CustomInput";
import CustomSelect from "../../../../components/shared/CustomSelect";
import CustomTextarea from "../../../../components/shared/CustomTextarea";
import { useTranslation } from "react-i18next";
import { getLocationById, updateLocation } from "../../../../api/locations/locations";
import { getGeneralData } from "../../../../api/others/others";
import { toSelectOptions } from "../../../../lib/utils";
import GalleryPhotos from "../../../../components/admin/GalleryPhotos";
import CustomCheckbox from "../../../../components/shared/CustomCheckbox";
import CustomSwitcher from "../../../../components/shared/CustomSwitcher";
import type { SelectOption } from "../../../../types/pricing";

type FormValues = {
  name: string;
  address: string;
  description: string;
  googleMapsUrl?: string;
  categories: number[];
  facilities: number[];
  rules: number[];
  status?: string;
  isVisible: boolean;
  seatingPlans: Array<{
    id: string | number;
    name: string;
    disabled: boolean;
    guests: number;
  }>;
};

type LocationFormProps = {
  slug: string;
};

export const LocationForm: React.FC<LocationFormProps> = ({ slug }) => {
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
      address: "",
      description: "",
      googleMapsUrl: "",
      categories: [],
      facilities: [],
      rules: [],
      status: "Draft",
      isVisible: true,
      seatingPlans: [],
    },
  });


  const { t } = useTranslation();

  const seatingPlans = useWatch({
    control,
    name: "seatingPlans",
    defaultValue: []
  });

  const isVisible = useWatch({
    control,
    name: "isVisible",
    defaultValue: true
  });


  const name = useWatch({
    control,
    name: "name",
    defaultValue: ""
  });

  const address = useWatch({
    control,
    name: "address",
    defaultValue: ""
  });

  const description = useWatch({
    control,
    name: "description",
    defaultValue: ""
  });

  const categories = useWatch({
    control,
    name: "categories",
    defaultValue: []
  });


  // Validare pentru a verifica dacă locația este completă
  const isValid = Boolean(
    name && 
    address && 
    description && 
    categories.length > 0 && 
    seatingPlans.some(plan => plan.guests > 0)
  );

  let locationId: number | null = null;
  if (slug && slug !== "new") {
    const firstPart = slug.split("-")[0];
    const parsed = Number(firstPart);
    if (!Number.isNaN(parsed)) {
      locationId = parsed;
    }
  }

  const [, setLocationData] = useState<any>({});
  const [options, setOptions] = useState<{
    categories: SelectOption[];
    facilities: SelectOption[];
    rules: SelectOption[];
    seatingPlans: Array<{ id: string | number; name: string }>;
  }>({
    categories: [],
    facilities: [],
    rules: [],
    seatingPlans: []
  });

  const isEditMode = Boolean(locationId);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (options.seatingPlans.length > 0 && (!seatingPlans || seatingPlans.length === 0)) {
      const initialSeatingPlans = options.seatingPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        disabled: true,
        guests: 0,
      }));
      setValue('seatingPlans', initialSeatingPlans);
    }
  }, [options.seatingPlans, seatingPlans, setValue]);

  const onSubmit = async (data: FormValues) => {
    const body: any = { 
      id: locationId, 
      name: data.name,
      address: data.address,
      description: data.description,
      googleMapsUrl: data.googleMapsUrl,
      categories: data.categories,
      facilities: data.facilities,
      rules: data.rules,
      isVisible: data.isVisible,
      seatingPlans: data.seatingPlans?.map(plan => ({
        id: plan.id,
        disabled: plan.disabled,
        guests: plan.guests || 0
      })),
    };

    if (slug === "new") {
      delete body.id;
    }

    const { environment } = await updateLocation(body);

    if (environment.status === 200) {
      setFeedback({ type: "success", message: t("common.update_success") });
      fetchLocation();
      return;
    }
    setFeedback({ type: "error", message: t("common.update_error") });
  };

  const fetchLocation = async () => {
    if (!locationId) return;

    const { environment, response } = await getLocationById(locationId);

    if (environment.status === 200 && response?.data) {
      const loc = response.data;

      reset({
        name: loc.name || "",
        address: loc.address || "",
        description: loc.description || "",
        googleMapsUrl: loc.googleMapsUrl || "",
        categories: loc.categories || [],
        facilities: loc.facilities || [],
        rules: loc.rules || [],
        status: "Published",
        isVisible: loc.isVisible !== undefined ? loc.isVisible : true,
        seatingPlans: loc.seatingPlans || [],
      });

      setLocationData(loc);
    }
  };

  const fetchGeneralData = async () => {
    const { environment, response } = await getGeneralData();

    if (environment.status !== 200) return;

    const seatingPlans = response?.data?.seatingPlans || [];

    setOptions({
      categories: toSelectOptions(response?.data?.categories),
      facilities: toSelectOptions(response?.data?.facilities),
      rules: toSelectOptions(response?.data?.rules),
      seatingPlans: seatingPlans,
    });

  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await fetchGeneralData();
        if (isEditMode) {
          await fetchLocation();
        }
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
      {isEditMode && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("locations.edit_location")}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Controller
                name="isVisible"
                control={control}
                render={({ field }) => (
                  <CustomSwitcher
                    label={t("locations.visibility")}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isVisible ? t("locations.visible") : t("locations.hidden")}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isValid && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {t("locations.incomplete_warning") || "Locația are nevoie de următoarele câmpuri pentru a fi disponibilă pentru oameni:"}
              </p>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
                {!name && <li>{t("locations.name")}</li>}
                {!address && <li>{t("locations.address")}</li>}
                {!description && <li>{t("locations.description")}</li>}
                {categories.length === 0 && <li>{t("locations.categories")}</li>}
                {!seatingPlans.some(plan => plan.guests > 0) && <li>{t("locations.capacity_layout")} (cel puțin un plan cu oaspeți)</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        id="location-form"
        className="flex-1 overflow-y-auto space-y-4 p-2"
      >
        <Controller
          name="name"
          control={control}
          rules={{ required: t("common.required") as string }}
          render={({ field }) => (
            <CustomInput
              label={t("locations.name")}
              placeholder={t("locations.name_placeholder")}
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.name?.message as string}
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <CustomInput
              label={t("locations.address")}
              placeholder={t("locations.address_placeholder")}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <CustomTextarea
              label={t("locations.description")}
              placeholder={t("locations.description_placeholder")}
              rows={4}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="googleMapsUrl"
          control={control}
          render={({ field }) => (
            <CustomInput
              label={t("locations.google_maps")}
              placeholder="Starting with https://maps.app.goo.gl/..."
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("locations.categories")}
          </label>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <CustomSelect
                isMulti
                options={options.categories}
                value={options.categories.filter((o) =>
                  field.value?.includes(Number(o.value)) || false
                )}
                onChange={(opts: any) =>
                  field.onChange(opts ? opts.map((o: any) => o.value) : [])
                }
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("locations.facilities")}
          </label>
          <Controller
            name="facilities"
            control={control}
            render={({ field }) => (
              <CustomSelect
                isMulti
                options={options.facilities}
                value={options.facilities.filter((o) =>
                  field.value?.includes(Number(o.value)) || false
                )}
                onChange={(opts: any) =>
                  field.onChange(opts ? opts.map((o: any) => o.value) : [])
                }
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("locations.space_rules")}
          </label>
          <Controller
            name="rules"
            control={control}
            render={({ field }) => (
              <CustomSelect
                isMulti
                options={options.rules}
                value={options.rules.filter((o) =>
                  field.value?.includes(Number(o.value)) || false
                )}
                onChange={(opts: any) =>
                  field.onChange(opts ? opts.map((o: any) => o.value) : [])
                }
              />
            )}
          />
        </div>


        <div>
          <label className="block text-sm font-medium mb-2">
            {t("locations.capacity_layout")}
          </label>
          <div className="space-y-3">
            {(() => {
              return null;
            })()}
            {options.seatingPlans.map((optionPlan) => {
              const existingPlan = seatingPlans?.find((p: any) => p.id === optionPlan.id);

              const plan = existingPlan || {
                id: optionPlan.id,
                name: optionPlan.name,
                disabled: true,
                guests: 0
              };

              return (
                <div key={plan.id} className="flex items-center justify-between gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CustomCheckbox
                    label={plan.name}
                    checked={!plan.disabled}
                    onChange={(checked) => {
                      const currentPlans = seatingPlans && seatingPlans.length > 0
                        ? seatingPlans
                        : options.seatingPlans.map(p => ({
                          id: p.id,
                          name: p.name,
                          disabled: true,
                          guests: 0
                        }));

                      const planIndex = currentPlans.findIndex(p => p.id === optionPlan.id);
                      if (planIndex >= 0) {
                        currentPlans[planIndex] = { ...currentPlans[planIndex], disabled: !checked };
                      } else {
                        currentPlans.push({
                          id: optionPlan.id,
                          name: optionPlan.name,
                          disabled: !checked,
                          guests: 0
                        });
                      }

                      setValue('seatingPlans', currentPlans);
                    }}
                  />
                  <div className="w-32">
                    <CustomInput
                      label=""
                      type="number"
                      placeholder="Max guests"
                      value={plan.guests || ""}
                      onChange={(e) => {
                        const currentPlans = seatingPlans && seatingPlans.length > 0
                          ? seatingPlans
                          : options.seatingPlans.map(p => ({
                            id: p.id,
                            name: p.name,
                            disabled: true,
                            guests: 0
                          }));

                        const planIndex = currentPlans.findIndex(p => p.id === optionPlan.id);
                        if (planIndex >= 0) {
                          currentPlans[planIndex] = { ...currentPlans[planIndex], guests: parseInt(e.target.value) || 0 };
                        } else {
                          currentPlans.push({
                            id: optionPlan.id,
                            name: optionPlan.name,
                            disabled: true,
                            guests: parseInt(e.target.value) || 0
                          });
                        }

                        setValue('seatingPlans', currentPlans);
                      }}
                      disabled={plan.disabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {slug !== "new" && locationId && <GalleryPhotos locationId={locationId} />}
      </form>

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
              form="location-form"
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
