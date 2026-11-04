import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomCheckbox from "../../../../../components/shared/CustomCheckbox";
import CustomInput from "../../../../../components/shared/CustomInput";
import CustomSelect from "../../../../../components/shared/CustomSelect";
import { getGeneralData } from "../../../../../api/others/others";
import { toSelectOptions, translateReferenceLabel } from "../../../../../lib/utils";
import type { SelectOption } from "../../../../../types/pricing";
import type { LocationDetailsDraft } from "./onboardingStorage";

type StepLocationDetailsProps = {
  value: LocationDetailsDraft;
  onChange: (value: LocationDetailsDraft) => void;
  errors?: { capacity?: string; categories?: string };
};

const StepLocationDetails: React.FC<StepLocationDetailsProps> = ({ value, onChange, errors }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<{
    categories: SelectOption[];
    facilities: SelectOption[];
    rules: SelectOption[];
    seatingPlans: Array<{ id: string | number; name: string }>;
  }>({ categories: [], facilities: [], rules: [], seatingPlans: [] });

  useEffect(() => {
    const fetchGeneralData = async () => {
      const { environment, response } = await getGeneralData();
      if (environment.status === 200) {
        setOptions({
          categories: toSelectOptions(response?.data?.categories).map((o) => ({
            ...o,
            label: translateReferenceLabel(t, "event_categories", o.label),
          })),
          facilities: toSelectOptions(response?.data?.facilities).map((o) => ({
            ...o,
            label: translateReferenceLabel(t, "features", o.label),
          })),
          rules: toSelectOptions(response?.data?.rules).map((o) => ({
            ...o,
            label: translateReferenceLabel(t, "rules", o.label),
          })),
          seatingPlans: (response?.data?.seatingPlans || []).map((p: { id: string | number; name: string }) => ({
            ...p,
            name: translateReferenceLabel(t, "locations.seating_types", p.name),
          })),
        });
      }
      setIsLoading(false);
    };
    fetchGeneralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (options.seatingPlans.length > 0 && value.seatingPlans.length === 0) {
      onChange({
        ...value,
        seatingPlans: options.seatingPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          disabled: true,
          guests: 0,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.seatingPlans]);

  const updateSeatingPlan = (planId: string | number, patch: Partial<{ disabled: boolean; guests: number }>) => {
    const current = value.seatingPlans.length > 0
      ? value.seatingPlans
      : options.seatingPlans.map((p) => ({ id: p.id, name: p.name, disabled: true, guests: 0 }));

    const index = current.findIndex((p) => p.id === planId);
    const updated = [...current];
    if (index >= 0) {
      updated[index] = { ...updated[index], ...patch };
    }
    onChange({ ...value, seatingPlans: updated });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-500 text-sm">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-gray)] p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Capacitate și tipuri de așezare</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Alege aranjamentele disponibile și numărul maxim de oaspeți pentru fiecare.
          </p>
        </div>
        <div className="space-y-3">
          {options.seatingPlans.map((optionPlan) => {
            const plan = value.seatingPlans.find((p) => p.id === optionPlan.id) || {
              id: optionPlan.id,
              name: optionPlan.name,
              disabled: true,
              guests: 0,
            };

            return (
              <div
                key={plan.id}
                className="flex items-center justify-between gap-4 p-3 border border-[var(--color-gray)] rounded-lg"
              >
                <CustomCheckbox
                  label={optionPlan.name}
                  checked={!plan.disabled}
                  onChange={(checked) => updateSeatingPlan(optionPlan.id, { disabled: !checked })}
                />
                <div className="w-32">
                  <CustomInput
                    label=""
                    type="text"
                    inputMode="numeric"
                    placeholder="Oaspeți"
                    value={plan.guests || ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      updateSeatingPlan(optionPlan.id, { guests: digits === "" ? 0 : parseInt(digits, 10) });
                    }}
                    disabled={plan.disabled}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {errors?.capacity && <p className="text-xs text-red-600">{errors.capacity}</p>}
      </div>

      <div className="border-t border-[var(--color-gray)] pt-6 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Tipuri de evenimente acceptate</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ce tipuri de evenimente poți găzdui în această locație.</p>
        </div>
        <CustomSelect
          isMulti
          options={options.categories}
          value={options.categories.filter((o) => value.categories.includes(Number(o.value)))}
          onChange={(opts: SelectOption[] | null) =>
            onChange({ ...value, categories: opts ? opts.map((o) => Number(o.value)) : [] })
          }
          placeholder="Selectează tipurile de evenimente"
          error={errors?.categories}
        />
        {errors?.categories && <p className="text-xs text-red-600">{errors.categories}</p>}
      </div>

      <div className="border-t border-[var(--color-gray)] pt-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Facilități și reguli <span className="text-xs font-normal text-gray-400">(opțional)</span>
          </h2>
        </div>
        <CustomSelect
          label="Facilități"
          isMulti
          options={options.facilities}
          value={options.facilities.filter((o) => value.facilities.includes(Number(o.value)))}
          onChange={(opts: SelectOption[] | null) =>
            onChange({ ...value, facilities: opts ? opts.map((o) => Number(o.value)) : [] })
          }
        />
        <CustomSelect
          label="Reguli spațiu"
          isMulti
          options={options.rules}
          value={options.rules.filter((o) => value.rules.includes(Number(o.value)))}
          onChange={(opts: SelectOption[] | null) =>
            onChange({ ...value, rules: opts ? opts.map((o) => Number(o.value)) : [] })
          }
        />
      </div>
    </div>
  );
};

export default StepLocationDetails;
