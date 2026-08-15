import React from "react";
import { useTranslation } from "react-i18next";
import CustomInput from "./CustomInput";
import CustomSelect from "./CustomSelect";
import CustomSwitcher from "./CustomSwitcher";
import type { PricingFormValues } from "../../types/pricing";

type PricingFormProps = {
  values: PricingFormValues;
  onChange: (values: PricingFormValues) => void;
  mode?: "default" | "category";
  showCurrency?: boolean;
};

export const PricingForm: React.FC<PricingFormProps> = ({
  values,
  onChange,
  showCurrency = true,
}) => {
  const { t } = useTranslation();

  const timeModeActive = values.pricing_mode === "per_time";
  const guestModeActive = values.pricing_mode === "per_guest";
  const poaActive = !!values.isPoa;

  const handleCurrencyChange = (currency: string) => {
    onChange({ ...values, currency });
  };

  const setTimeMode = (on: boolean) => {
    onChange({
      ...values,
      pricing_mode: on ? "per_time" : null,
      isPoa: false,
    });
  };

  const setPoaMode = (on: boolean) => {
    onChange({
      ...values,
      isPoa: on,
      pricing_mode: on ? null : values.pricing_mode,
    });
  };

  const setGuestMode = (on: boolean) => {
    onChange({
      ...values,
      pricing_mode: on ? "per_guest" : null,
      isPoa: false,
    });
  };

  const handleValueChange = (field: keyof PricingFormValues, value: number | null) => {
    onChange({ ...values, [field]: value });
  };

  const currencyOptions = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "RON", label: "RON (lei)" },
  ];

  return (
    <div className="space-y-4">
      {showCurrency && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("locations.currency")}
          </label>
          <div className="w-48">
            <CustomSelect
              label=""
              options={currencyOptions}
              value={currencyOptions.find((opt) => opt.value === (values.currency || "EUR")) || null}
              onChange={(opt: any) => handleCurrencyChange(opt?.value || "EUR")}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("locations.active_pricing_modes")}
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => !poaActive && setPoaMode(true)}
                  className={`block text-left text-sm font-medium text-gray-900 dark:text-gray-100 ${
                    poaActive ? "cursor-default" : "hover:text-primary"
                  }`}
                >
                  {t("locations.price_on_application")}
                </button>
                {poaActive && (
                  <span className="rounded px-2 py-0.5 text-xs font-medium bg-primary text-white">Active</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <CustomSwitcher label="" checked={poaActive} onChange={setPoaMode} />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between gap-4 p-3 text-left">
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => !timeModeActive && setTimeMode(true)}
                    className={`block text-left text-sm font-medium text-gray-900 dark:text-gray-100 ${
                      timeModeActive ? "cursor-default" : "hover:text-primary"
                    }`}
                  >
                    {t("locations.time_mode")}
                  </button>
                  {timeModeActive && (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-primary text-white">Active</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <CustomSwitcher label="" checked={timeModeActive} onChange={setTimeMode} />
              </div>
            </div>
            {timeModeActive && (
              <div className="flex flex-wrap items-end gap-4 px-3 pb-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                <div className="w-32 pt-3">
                  <CustomInput
                    label={t("locations.price_per_day")}
                    type="number"
                    placeholder="0"
                    value={values.price_per_day != null ? values.price_per_day : ""}
                    onChange={(e) => {
                      const v = e.target.value ? parseFloat(e.target.value) : null;
                      handleValueChange("price_per_day", v);
                    }}
                  />
                </div>
                <div className="w-32 pt-3">
                  <CustomInput
                    label={t("locations.price_per_hour")}
                    type="number"
                    placeholder="0"
                    value={values.price_per_hour != null ? values.price_per_hour : ""}
                    onChange={(e) => {
                      const v = e.target.value ? parseFloat(e.target.value) : null;
                      handleValueChange("price_per_hour", v);
                    }}
                  />
                </div>
                <div className="w-24 pt-3">
                  <CustomInput
                    label={t("locations.min_hours")}
                    type="number"
                    placeholder="0"
                    value={values.min_hours != null ? values.min_hours : ""}
                    onChange={(e) => {
                      const v = e.target.value ? parseInt(e.target.value) : null;
                      handleValueChange("min_hours", v);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between gap-4 p-3 text-left">
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => !guestModeActive && setGuestMode(true)}
                    className={`block text-left text-sm font-medium text-gray-900 dark:text-gray-100 ${
                      guestModeActive ? "cursor-default" : "hover:text-primary"
                    }`}
                  >
                    {t("locations.guest_mode")}
                  </button>
                  {guestModeActive && (
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-primary text-white">Active</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <CustomSwitcher label="" checked={guestModeActive} onChange={setGuestMode} />
              </div>
            </div>
            {guestModeActive && (
              <div className="flex flex-wrap items-end gap-4 px-3 pb-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                <div className="w-32 pt-3">
                  <CustomInput
                    label={t("locations.price_per_guest")}
                    type="number"
                    placeholder="0"
                    value={values.price_per_guest != null ? values.price_per_guest : ""}
                    onChange={(e) => {
                      const v = e.target.value ? parseFloat(e.target.value) : null;
                      handleValueChange("price_per_guest", v);
                    }}
                  />
                </div>
                <div className="w-24 pt-3">
                  <CustomInput
                    label={t("locations.min_guests")}
                    type="number"
                    placeholder="0"
                    value={values.min_guests != null ? values.min_guests : ""}
                    onChange={(e) => {
                      const v = e.target.value ? parseInt(e.target.value) : null;
                      handleValueChange("min_guests", v);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
