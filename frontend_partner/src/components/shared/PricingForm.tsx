import React from "react";
import { useTranslation } from "react-i18next";
import CustomInput from "./CustomInput";
import CustomSelect from "./CustomSelect";
import CustomSwitcher from "./CustomSwitcher";
import type { PricingFormValues } from "../../types/pricing";
import { getCurrencySymbol } from "../../utils/pricing";

type ModeCardProps = {
  title: string;
  description: string;
  active: boolean;
  onToggle: (on: boolean) => void;
  children?: React.ReactNode;
};

/** Card unificat pentru un mod de preț: titlu bold + descriere mai mică, sub text normal,
 * badge "Activ" + switch în dreapta (singurul control de activare — titlul e text simplu,
 * aliniat la stânga, nu mai e buton), iar câmpurile suplimentare de preț apar dedesubt
 * doar cât timp modul e activ. */
const ModeCard: React.FC<ModeCardProps> = ({ title, description, active, onToggle, children }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
    <div
      onClick={() => onToggle(!active)}
      className="flex items-center justify-between gap-4 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors rounded-lg"
    >
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          {active && (
            <span className="rounded px-2 py-0.5 text-xs font-medium bg-primary text-white">Activ</span>
          )}
        </div>
        {description && (
          <p className="text-xs font-normal text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <CustomSwitcher label="" checked={active} onChange={onToggle} />
      </div>
    </div>
    {active && children && (
      <div className="flex flex-wrap items-end gap-4 px-3 pb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        {children}
      </div>
    )}
  </div>
);

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
              value={currencyOptions.find((opt) => opt.value === (values.currency || "RON")) || null}
              onChange={(opt: any) => handleCurrencyChange(opt?.value || "RON")}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("locations.active_pricing_modes")}
        </label>
        <div className="space-y-3">
          <ModeCard
            title={t("locations.price_on_application")}
            description={t("locations.price_on_application_description")}
            active={poaActive}
            onToggle={setPoaMode}
          />

          <ModeCard
            title={t("locations.time_mode")}
            description={t("locations.time_mode_description")}
            active={timeModeActive}
            onToggle={setTimeMode}
          >
            <div className="w-32">
              <CustomInput
                label={t("locations.price_per_day")}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={values.price_per_day != null ? values.price_per_day : ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  handleValueChange("price_per_day", cleaned === "" ? null : parseFloat(cleaned));
                }}
                iconRight={<span className="text-xs text-gray-400">{getCurrencySymbol(values.currency)}</span>}
              />
            </div>
            <div className="w-32">
              <CustomInput
                label={t("locations.price_per_hour")}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={values.price_per_hour != null ? values.price_per_hour : ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  handleValueChange("price_per_hour", cleaned === "" ? null : parseFloat(cleaned));
                }}
                iconRight={<span className="text-xs text-gray-400">{getCurrencySymbol(values.currency)}</span>}
              />
            </div>
            <div className="w-24">
              <CustomInput
                label={t("locations.min_hours")}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values.min_hours != null ? values.min_hours : ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  handleValueChange("min_hours", digits === "" ? null : parseInt(digits, 10));
                }}
              />
            </div>
          </ModeCard>

          <ModeCard
            title={t("locations.guest_mode")}
            description={t("locations.guest_mode_description")}
            active={guestModeActive}
            onToggle={setGuestMode}
          >
            <div className="w-32">
              <CustomInput
                label={t("locations.price_per_guest")}
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={values.price_per_guest != null ? values.price_per_guest : ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  handleValueChange("price_per_guest", cleaned === "" ? null : parseFloat(cleaned));
                }}
                iconRight={<span className="text-xs text-gray-400">{getCurrencySymbol(values.currency)}</span>}
              />
            </div>
            <div className="w-24">
              <CustomInput
                label={t("locations.min_guests")}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values.min_guests != null ? values.min_guests : ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  handleValueChange("min_guests", digits === "" ? null : parseInt(digits, 10));
                }}
              />
            </div>
          </ModeCard>
        </div>
      </div>
    </div>
  );
};
