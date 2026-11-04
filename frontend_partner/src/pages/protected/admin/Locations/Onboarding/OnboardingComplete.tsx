import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import CustomSwitcher from "../../../../../components/shared/CustomSwitcher";
import { getLocationById, updateLocation } from "../../../../../api/locations/locations";

type OnboardingCompleteProps = {
  locationId: number;
  onFinish: (isVisible: boolean) => void;
};

/** `GET /locations/:id` întoarce fiecare seatingPlan ca { id: <id tip așezare>,
 * planId: <id rând asociere>, name, disabled, guests }. Endpoint-ul de
 * salvare vrea însă { id: <id tip așezare>, guests, disabled } — id-ul tipului, nu al
 * rândului, și fără `planId`/`name` (respinse cu „is not allowed”). */
type FetchedSeatingPlan = {
  id: string | number;
  planId?: string | number;
  disabled: boolean;
  guests: number;
};

type FetchedLocation = {
  name?: string;
  address?: string;
  description?: string;
  googleMapsUrl?: string;
  categories?: number[];
  facilities?: number[];
  rules?: number[];
  seatingPlans?: FetchedSeatingPlan[];
};

function toSeatingPlansForAPI(plans: FetchedSeatingPlan[] | undefined) {
  return (plans || []).map((p) => ({
    id: p.id,
    disabled: p.disabled,
    guests: p.guests || 0,
  }));
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ locationId, onFinish }) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<FetchedLocation | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const { environment, response } = await getLocationById(locationId);
      if (environment.status === 200 && response?.data) {
        setLocation(response.data);
      }
    };
    fetchLocation();
  }, [locationId]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    setSaveError(null);
    try {
      // Trimitem body complet (nu doar isVisible): updateLocation face overwrite pe toate
      // câmpurile trimise, la fel ca în LocationForm.onSubmit — un body parțial ar risca
      // să șteargă restul datelor locației.
      const { environment } = await updateLocation({
        id: locationId,
        name: location?.name,
        address: location?.address,
        description: location?.description,
        googleMapsUrl: location?.googleMapsUrl,
        categories: location?.categories || [],
        facilities: location?.facilities || [],
        rules: location?.rules || [],
        seatingPlans: toSeatingPlansForAPI(location?.seatingPlans),
        isVisible,
      });

      if (environment.status === 200) {
        onFinish(isVisible);
      } else {
        setSaveError("Nu am putut finaliza locația. Încearcă din nou.");
      }
    } catch {
      setSaveError("Nu am putut finaliza locația. Încearcă din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--color-gray)] p-6 space-y-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {(t("locations.onboarding.complete_title") || "Locația este configurată") +
              (location?.name ? ` — ${location.name}` : "")}
          </h3>
          <p className="text-sm text-gray-600">
            {t("locations.onboarding.complete_description") ||
              "Ai completat detaliile, pozele, prețul și disponibilitatea. Poți oricând reveni și edita locația din lista de proprietăți."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--color-gray)] pt-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {t("locations.onboarding.publish_now") || "Publică locația acum"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("locations.onboarding.publish_now_description") ||
              "Dacă o lași nepublicată, poți oricând să o faci vizibilă mai târziu din Detalii locație."}
          </p>
        </div>
        <CustomSwitcher label="" checked={isVisible} onChange={setIsVisible} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saveError && (
          <span className="text-sm font-medium px-3 py-1 rounded-lg bg-red-100 text-red-700">
            {saveError}
          </span>
        )}
        <button
          type="button"
          onClick={handleFinish}
          disabled={isSubmitting || !location}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("common.saving") : (t("locations.onboarding.finish") || "Finalizează")}
        </button>
      </div>
    </div>
  );
};

export default OnboardingComplete;
