export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type SeatingPlanDraft = {
  id: string | number;
  name: string;
  disabled: boolean;
  guests: number;
};

export type GeneralInfoDraft = {
  name: string;
  address: string;
  googleMapsUrl: string;
  description: string;
};

export type LocationDetailsDraft = {
  seatingPlans: SeatingPlanDraft[];
  categories: number[];
  facilities: number[];
  rules: number[];
};

export type OnboardingDraft = {
  generalInfo: GeneralInfoDraft;
  locationDetails: LocationDetailsDraft;
};

export type OnboardingPointer = {
  /** null cât locația nu a fost încă creată (pașii 1-2, doar date locale, nesalvate). */
  locationId: number | null;
  step: OnboardingStep;
  /** Relevant doar cât locationId e null — reluare pe același device înainte de creare. */
  draft?: OnboardingDraft;
};

const STORAGE_KEY = "partner_location_onboarding";

export function getOnboardingPointer(): OnboardingPointer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || (typeof parsed.locationId !== "number" && parsed.locationId !== null)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setOnboardingPointer(pointer: OnboardingPointer): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pointer));
  } catch {
    // localStorage indisponibil (mod privat etc.) — reluarea nu va funcționa, dar fluxul continuă
  }
}

export function clearOnboardingPointer(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorăm — nu e critic
  }
}
