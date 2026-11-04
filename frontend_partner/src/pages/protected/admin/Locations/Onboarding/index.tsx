import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronLeft } from "lucide-react";
import AccountMenu from "./AccountMenu";
import StepGeneralInfo from "./StepGeneralInfo";
import StepLocationDetails from "./StepLocationDetails";
import GalleryPhotos from "../../../../../components/admin/GalleryPhotos";
import Pricing from "../Pricing";
import AvailabilitySettings from "../AvailabilitySettings";
import OnboardingComplete from "./OnboardingComplete";
import { useAdminStore } from "../../../../../store/admin.store";
import { getLocationById, getLocations, updateLocation } from "../../../../../api/locations/locations";
import {
  clearOnboardingPointer,
  getOnboardingPointer,
  setOnboardingPointer,
  type GeneralInfoDraft,
  type LocationDetailsDraft,
  type OnboardingStep,
} from "./onboardingStorage";

const EMPTY_GENERAL_INFO: GeneralInfoDraft = {
  name: "",
  address: "",
  googleMapsUrl: "",
  description: "",
};

const EMPTY_LOCATION_DETAILS: LocationDetailsDraft = {
  seatingPlans: [],
  categories: [],
  facilities: [],
  rules: [],
};

const STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 1, label: "Informații generale" },
  { key: 2, label: "Detalii locație" },
  { key: 3, label: "Poze" },
  { key: 4, label: "Preț" },
  { key: 5, label: "Disponibilitate" },
];

/** id-ul butonului intern (ascuns, dar funcțional) pe care îl declanșează footer-ul unic. */
const STEP_SUBMIT_ID: Record<4 | 5, string> = {
  4: "pricing-save-submit",
  5: "availability-save-submit",
};

function parseStepParam(raw: string | null): OnboardingStep | "complete" | null {
  if (raw === "complete") return "complete";
  const n = Number(raw);
  return n >= 1 && n <= 5 ? (n as OnboardingStep) : null;
}

const LocationOnboardingWizard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fetchMetrics = useAdminStore((s) => s.fetchMetrics);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  // Pasul e mereu oglindit în URL (?step=) — astfel Back/Forward din browser navighează
  // real între pașii wizard-ului, nu sar în afara lui. Sincronizat prin efectul de mai jos,
  // nu setat direct: orice schimbare de pas se face prin setSearchParams.
  const [step, setStep] = useState<OnboardingStep | "complete">(1);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoDraft>(EMPTY_GENERAL_INFO);
  const [locationDetails, setLocationDetails] = useState<LocationDetailsDraft>(EMPTY_LOCATION_DETAILS);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generalInfoErrors, setGeneralInfoErrors] = useState<{ name?: string; address?: string }>({});
  const [locationDetailsErrors, setLocationDetailsErrors] = useState<{ capacity?: string; categories?: string }>({});
  const [isCreating, setIsCreating] = useState(false);

  /** Singurul loc care schimbă pasul vizibil — scrie în URL (push, ca o navigare reală),
   * starea `step` se actualizează din efectul de mai jos, nu direct aici. */
  const goToUrlStep = (nextStep: OnboardingStep | "complete", options?: { replace?: boolean }) => {
    const next = new URLSearchParams(searchParams);
    next.set("step", String(nextStep));
    setSearchParams(next, { replace: options?.replace ?? false });
  };

  // Oglindește URL-ul (?step=) în starea locală — rulează la orice schimbare a URL-ului:
  // click pe Continuă/Înapoi (prin goToUrlStep), dar și Back/Forward reale din browser.
  useEffect(() => {
    const parsed = parseStepParam(searchParams.get("step"));
    if (parsed !== null) setStep(parsed);
  }, [searchParams]);

  const handleGeneralInfoChange = (next: GeneralInfoDraft) => {
    setGeneralInfo(next);
    setGeneralInfoErrors((prev) => ({
      name: next.name.trim() ? undefined : prev.name,
      address: next.address.trim() ? undefined : prev.address,
    }));
  };

  const handleLocationDetailsChange = (next: LocationDetailsDraft) => {
    setLocationDetails(next);
    setLocationDetailsErrors((prev) => ({
      capacity: next.seatingPlans.some((p) => p.guests > 0) ? undefined : prev.capacity,
      categories: next.categories.length > 0 ? undefined : prev.categories,
    }));
  };

  /** Populează pașii 1-2 cu datele reale salvate — folosit la orice reluare cu locație
   * deja existentă, ca întoarcerea la acei pași să arate ce e cu adevărat salvat, nu gol. */
  const hydrateFromLocation = (loc: {
    name?: string;
    address?: string;
    googleMapsUrl?: string;
    description?: string;
    // GET /locations/:id întoarce { id: <id tip așezare>, planId: <id rând asociere>,
    // name, disabled, guests } — id-ul tipului e în `id`, nu în `planId`.
    seatingPlans?: Array<{ id: string | number; planId?: string | number; name: string; disabled: boolean; guests: number }>;
    categories?: number[];
    facilities?: number[];
    rules?: number[];
  }) => {
    setGeneralInfo({
      name: loc.name || "",
      address: loc.address || "",
      googleMapsUrl: loc.googleMapsUrl || "",
      description: loc.description || "",
    });
    setLocationDetails({
      seatingPlans: (loc.seatingPlans || []).map((p) => ({
        id: p.id,
        name: p.name,
        disabled: p.disabled,
        guests: p.guests,
      })),
      categories: loc.categories || [],
      facilities: loc.facilities || [],
      rules: loc.rules || [],
    });
  };

  useEffect(() => {
    const restore = async () => {
      const pointer = getOnboardingPointer();

      if (pointer?.locationId) {
        const { environment, response } = await getLocationById(pointer.locationId);
        if (environment.status === 200 && response?.data) {
          hydrateFromLocation(response.data);
          setLocationId(pointer.locationId);
          goToUrlStep(pointer.step, { replace: true });
          setIsLoading(false);
          return;
        }
        clearOnboardingPointer();
      } else if (pointer?.draft) {
        setGeneralInfo(pointer.draft.generalInfo);
        setLocationDetails(pointer.draft.locationDetails);
        goToUrlStep(pointer.step, { replace: true });
        setIsLoading(false);
        return;
      }

      // Fără pointer local valid (prima dată pe acest device/browser, sau pointer vechi
      // invalid) — verificăm direct din backend dacă există deja o locație începută.
      const { status, response: locationsResponse } = await getLocations();
      const locations = status === 200 ? locationsResponse?.data || [] : [];

      if (locations.length === 0) {
        goToUrlStep(1, { replace: true });
        setIsLoading(false);
        return;
      }

      const target = locations[locations.length - 1];
      const { environment, response } = await getLocationById(target.id);
      const loc = environment.status === 200 ? response?.data : null;
      if (loc) hydrateFromLocation(loc);

      const derivedStep: 3 | 4 | 5 = loc?.pricing ? 5 : 3;
      setLocationId(target.id);
      goToUrlStep(derivedStep, { replace: true });
      setOnboardingPointer({ locationId: target.id, step: derivedStep });
      setIsLoading(false);
    };

    restore();
    // Rulează o singură dată la montare — `goToUrlStep` nu trebuie în deps (e redefinit
    // la fiecare render, ar reporni restore() în buclă).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cât locația nu există încă (pașii 1-2), ținem draftul în localStorage ca să poată
  // relua pe același device dacă închide browserul înainte de a termina pasul 2.
  useEffect(() => {
    if (locationId || isLoading) return;
    if (typeof step !== "number" || step > 2) return;
    setOnboardingPointer({ locationId: null, step, draft: { generalInfo, locationDetails } });
  }, [locationId, isLoading, step, generalInfo, locationDetails]);

  const goToStep = (nextStep: OnboardingStep, id: number) => {
    setLocationId(id);
    goToUrlStep(nextStep);
    setOnboardingPointer({ locationId: id, step: nextStep });
  };

  const handleBack = () => {
    if (typeof step !== "number" || step <= 1) return;
    const prevStep = (step - 1) as OnboardingStep;
    goToUrlStep(prevStep);
    if (locationId) {
      setOnboardingPointer({ locationId, step: prevStep });
    }
  };

  const handleFinish = async () => {
    clearOnboardingPointer();
    // Reîmprospătăm metricile ca dashboard-ul să afișeze noul procent de completare.
    await fetchMetrics();
    // Locația poate fi oricând editată mai departe din lista de proprietăți — nu trebuie
    // să te ducă direct pe ecranul de editare.
    navigate("/partner/dashboard");
  };

  /** Creează locația prima dată, sau o actualizează dacă utilizatorul s-a întors la
   * pașii 1-2 după ce a fost deja creată (editabil până la finalizarea completă). */
  const saveEssentials = async () => {
    setIsCreating(true);
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        name: generalInfo.name,
        address: generalInfo.address,
        description: generalInfo.description,
        googleMapsUrl: generalInfo.googleMapsUrl,
        categories: locationDetails.categories,
        facilities: locationDetails.facilities,
        rules: locationDetails.rules,
        isVisible: true,
        seatingPlans: locationDetails.seatingPlans.map((plan) => ({
          id: plan.id,
          disabled: plan.disabled,
          guests: plan.guests || 0,
        })),
      };

      if (locationId) {
        body.id = locationId;
      }

      const { environment, response } = await updateLocation(body);
      const resolvedId = locationId || response?.data?.id;

      if (environment.status === 200 && resolvedId) {
        goToStep(3, resolvedId);
      } else {
        setSaveError("Nu am putut salva locația. Încearcă din nou.");
      }
    } catch {
      setSaveError("Nu am putut salva locația. Încearcă din nou.");
    } finally {
      setIsCreating(false);
    }
  };

  /** Butonul unic din footer: validează + avansează pentru pașii 1-3 (date locale),
   * declanșează salvarea internă (buton ascuns) pentru pașii 4-5. */
  const handlePrimaryAction = () => {
    if (step === "complete" || isCreating) return;

    if (step === 1) {
      const nextErrors = {
        name: generalInfo.name.trim() ? undefined : "Numele locației este obligatoriu.",
        address: generalInfo.address.trim() ? undefined : "Adresa locației este obligatorie.",
      };
      setGeneralInfoErrors(nextErrors);
      if (nextErrors.name || nextErrors.address) return;
      goToUrlStep(2);
      return;
    }

    if (step === 2) {
      const nextErrors = {
        capacity: locationDetails.seatingPlans.some((p) => p.guests > 0)
          ? undefined
          : "Alege cel puțin un tip de așezare și numărul de oaspeți.",
        categories: locationDetails.categories.length > 0
          ? undefined
          : "Alege cel puțin un tip de eveniment acceptat.",
      };
      setLocationDetailsErrors(nextErrors);
      if (nextErrors.capacity || nextErrors.categories) return;
      saveEssentials();
      return;
    }

    if (step === 3) {
      if (locationId) goToStep(4, locationId);
      return;
    }

    document.getElementById(STEP_SUBMIT_ID[step])?.click();
  };

  const currentStepIndex = step === "complete" ? STEPS.length : step - 1;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="shrink-0 w-full bg-white border-b border-[var(--color-gray)] px-4 sm:px-6 py-3">
        <div className="relative flex items-center">
          {/* Pașii: centrați, max-w-3xl identic cu wrapper-ul conținutului de mai jos,
           * ca marginile barei de pași să se alinieze exact cu marginile cardurilor. */}
          <div className="w-full max-w-3xl mx-auto flex items-center gap-3 sm:gap-4 pr-12">
            <span className="sm:hidden text-xs font-medium text-gray-500 flex-shrink-0">
              {currentStepIndex + 1}/{STEPS.length}
            </span>
            <div className="flex-1 flex items-center justify-between">
              {STEPS.map((s, index) => {
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={s.key} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          isDone
                            ? "bg-green-600 text-white"
                            : isCurrent
                            ? "border-2 border-primary text-primary"
                            : "border border-[var(--color-gray)] text-gray-400"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : s.key}
                      </div>
                      <span
                        className={`hidden sm:block text-xs whitespace-nowrap ${
                          isDone ? "text-green-600" : isCurrent ? "text-primary font-medium" : "text-gray-500"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 ${isDone ? "bg-green-600" : "bg-[var(--color-gray)]"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meniul de cont: ancorat la marginea din dreapta a întregii bare, independent
           * de coloana centrată a pașilor — nu face parte din grupul centrat. */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <AccountMenu />
          </div>
        </div>
        {/* Eticheta pasului curent, vizibilă și pe mobil unde textul de sub cerculețe e ascuns. */}
        <p className="sm:hidden text-center text-xs font-medium text-primary mt-2">
          {step === "complete" ? "Finalizare" : STEPS[currentStepIndex]?.label}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {step === 1 && (
            <StepGeneralInfo value={generalInfo} onChange={handleGeneralInfoChange} errors={generalInfoErrors} />
          )}

          {step === 2 && (
            <StepLocationDetails
              value={locationDetails}
              onChange={handleLocationDetailsChange}
              errors={locationDetailsErrors}
            />
          )}

          {step === 3 && locationId && (
            <div className="bg-white rounded-xl border border-[var(--color-gray)] p-4">
              <p className="text-sm text-gray-500 mb-4">
                Adaugă poze reprezentative pentru locație. Acest pas e opțional — poți reveni oricând și
                adăuga poze mai târziu.
              </p>
              <GalleryPhotos locationId={locationId} />
            </div>
          )}

          {step === 4 && locationId && (
            <div className="bg-white rounded-xl border border-[var(--color-gray)] p-4">
              <Pricing slug={String(locationId)} embedded onSaved={() => goToStep(5, locationId)} />
            </div>
          )}

          {step === 5 && locationId && (
            <div className="bg-white rounded-xl border border-[var(--color-gray)] p-4">
              <AvailabilitySettings
                slug={String(locationId)}
                embedded
                onSaved={() => {
                  goToUrlStep("complete");
                  setOnboardingPointer({ locationId, step: 5 });
                }}
              />
            </div>
          )}

          {step === "complete" && locationId && (
            <OnboardingComplete locationId={locationId} onFinish={handleFinish} />
          )}
        </div>
      </div>

      {step !== "complete" && (
        <div className="sticky bottom-0 shrink-0 w-full bg-white border-t border-[var(--color-gray)] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {saveError && (
              <span className="text-sm font-medium px-3 py-1 rounded-lg bg-red-100 text-red-700 truncate">
                {saveError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {typeof step === "number" && step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline-transparent flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t("common.back") || "Înapoi"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isCreating}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? t("common.saving") : (t("common.continue") || "Continuă")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationOnboardingWizard;
