import React, { useCallback } from "react";
import CustomInput from "../../../../../components/shared/CustomInput";
import type { GeneralRules as GeneralRulesValues } from "./types";
import { DEFAULT_GENERAL_RULES } from "./types";

type GeneralRulesProps = {
  value?: GeneralRulesValues | null;
  onChange: (rules: GeneralRulesValues) => void;
};

const GeneralRules: React.FC<GeneralRulesProps> = ({ value, onChange }) => {
  const rules = value ?? DEFAULT_GENERAL_RULES;

  const patch = useCallback(
    (p: Partial<GeneralRulesValues>) => {
      onChange({ ...rules, ...p });
    },
    [rules, onChange]
  );

  const num = (v: string): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Alte reguli</h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Limite de rezervare.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomInput
          label="Ore minime înainte de rezervare"
          type="number"
          value={rules.minAdvanceHours}
          onChange={(e) => patch({ minAdvanceHours: num(e.target.value) })}
        />

        <CustomInput
          label="Durată minimă de rezervare (minute)"
          type="number"
          value={rules.minDurationMinutes}
          onChange={(e) => patch({ minDurationMinutes: num(e.target.value) })}
        />

        <div className="sm:col-span-2">
          <CustomInput
            label="Buffer după eveniment (minute)"
            type="number"
            value={rules.bufferAfterMinutes}
            onChange={(e) => patch({ bufferAfterMinutes: num(e.target.value) })}
          />
        </div>
      </div>
    </section>
  );
};

export default GeneralRules;
