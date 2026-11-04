import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import CustomInput from "../../../../../components/shared/CustomInput";
import CustomTextarea from "../../../../../components/shared/CustomTextarea";
import { searchAddressSuggestions, type AddressSuggestion } from "./addressSuggestions";
import type { GeneralInfoDraft } from "./onboardingStorage";

type StepGeneralInfoProps = {
  value: GeneralInfoDraft;
  onChange: (value: GeneralInfoDraft) => void;
  errors?: { name?: string; address?: string };
};

const StepGeneralInfo: React.FC<StepGeneralInfoProps> = ({ value, onChange, errors }) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    searchAddressSuggestions(value.address).then((results) => {
      if (!cancelled) setSuggestions(results);
    });
    return () => {
      cancelled = true;
    };
  }, [value.address]);

  useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    onChange({ ...value, address: suggestion.label });
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--color-gray)] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Informații generale</h2>
        <p className="text-sm text-gray-500 mt-0.5">Identitatea și localizarea locației</p>
      </div>

      <div>
        <CustomInput
          id="onboarding-name"
          label="Numele locației"
          required
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Ex. Grădina cu Nuci"
          error={errors?.name}
        />
        {errors?.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
      </div>

      <div className="relative" ref={containerRef}>
        <CustomInput
          id="onboarding-address"
          label="Adresa locației"
          required
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Introdu adresa completă"
          iconLeft={<MapPin className="w-4 h-4 text-gray-400" />}
          error={errors?.address}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full border border-[var(--color-gray)] rounded-lg bg-white overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {errors?.address && <p className="text-xs text-red-600 mt-1.5">{errors.address}</p>}
        <p className="text-xs text-gray-400 mt-1.5">
          Pregătit pentru integrare Google Maps / Places. Deocamdată, câmp text și date
          demonstrative, fără request-uri externe.
        </p>
      </div>

      <CustomInput
        id="onboarding-maps-url"
        label="Link Google Maps (opțional)"
        value={value.googleMapsUrl}
        onChange={(e) => onChange({ ...value, googleMapsUrl: e.target.value })}
        placeholder="https://maps.google.com/..."
      />

      <CustomTextarea
        id="onboarding-description"
        label="Descriere (opțional)"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Descrie pe scurt locația..."
        rows={4}
      />
    </div>
  );
};

export default StepGeneralInfo;
