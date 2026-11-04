import { Building2, CalendarDays, Camera, FileText, Tag, type LucideIcon } from 'lucide-react';
import { parseLocationPricingFromAPI, parsePricingData } from '../utils/pricing';
import type { PricingItem } from '../types/pricing';

/**
 * Regulile de calitate ale unei locații, grupate pe pașii din onboarding.
 *
 * - `required`: fără ea pasul nu e considerat finalizat (blochează "configurată").
 * - `recommended`: pasul e finalizat, dar regula apare ca sfat de îmbunătățire.
 *
 * Pentru a schimba un prag (ex. câte facilități recomandăm) se modifică doar
 * LOCATION_QUALITY_THRESHOLDS; pentru o regulă nouă se adaugă un obiect în `rules`.
 */

export const LOCATION_QUALITY_THRESHOLDS = {
  minDescriptionLength: 150,
  minSeatingPlans: 2,
  minFacilities: 10,
  minRules: 3,
  minPhotos: 10,
} as const;

type SeatingPlan = { id: number | string; name: string; disabled: boolean; guests: number };

export type LocationQualityData = {
  name?: string;
  address?: string;
  description?: string;
  googleMapsUrl?: string;
  categories?: number[];
  facilities?: number[];
  rules?: number[];
  seatingPlans?: SeatingPlan[];
  pricing?: PricingItem[];
  categoryPricing?: Array<{ categoryId: number; pricing: PricingItem[] }>;
  pricingCategories?: Array<{ id?: number; categoryId: number; pricing: PricingItem[] }>;
  isVisible?: boolean;
};

export type LocationQualityContext = {
  location: LocationQualityData;
  photosCount: number;
  hasAvailability: boolean;
};

export type SetupTab = 'details' | 'pricing' | 'rules';

export type QualityRule = {
  id: string;
  level: 'required' | 'recommended';
  /** Ce trebuie făcut, ex. „Adaugă minim 10 facilități”. */
  label: string;
  /** De ce contează — afișat ca text secundar în sfaturi. */
  hint: string;
  /** Pentru reguli numerice: valoarea curentă și ținta, afișate ca „4/10”. */
  current?: (ctx: LocationQualityContext) => number;
  target?: number;
  isMet: (ctx: LocationQualityContext) => boolean;
};

export type QualityStep = {
  key: number;
  title: string;
  description: string;
  actionLabel: string;
  tab: SetupTab;
  icon: LucideIcon;
  rules: QualityRule[];
};

const T = LOCATION_QUALITY_THRESHOLDS;

const filled = (value?: string) => Boolean(value && value.trim());
const activeSeatingPlans = (ctx: LocationQualityContext) =>
  (ctx.location.seatingPlans || []).filter((p) => !p.disabled && p.guests > 0);

const hasDefaultPricing = (ctx: LocationQualityContext) => {
  const values = parsePricingData(ctx.location.pricing);
  return Boolean(values.isPoa || values.price_per_hour || values.price_per_day || values.price_per_guest);
};

const categoryPricingCount = (ctx: LocationQualityContext) =>
  Object.keys(parseLocationPricingFromAPI(ctx.location).categoryPricing).length;

/** Aceiași 5 pași ca în wizard-ul de onboarding (Locations/Onboarding). */
export const LOCATION_SETUP_STEPS: QualityStep[] = [
  {
    key: 1,
    title: 'Informații generale',
    description: 'Nume, adresă, descriere și Google Maps',
    actionLabel: 'Completează',
    tab: 'details',
    icon: FileText,
    rules: [
      {
        id: 'name',
        level: 'required',
        label: 'Adaugă numele locației',
        hint: 'Numele apare în căutări și pe pagina publică.',
        isMet: (ctx) => filled(ctx.location.name),
      },
      {
        id: 'address',
        level: 'required',
        label: 'Adaugă adresa locației',
        hint: 'Organizatorii caută locații după oraș și zonă.',
        isMet: (ctx) => filled(ctx.location.address),
      },
      {
        id: 'description',
        level: 'recommended',
        label: `Adaugă o descriere de minim ${T.minDescriptionLength} de caractere`,
        hint: 'Descrie spațiul, atmosfera și ce îl face potrivit pentru evenimente.',
        current: (ctx) => (ctx.location.description || '').trim().length,
        target: T.minDescriptionLength,
        isMet: (ctx) => (ctx.location.description || '').trim().length >= T.minDescriptionLength,
      },
      {
        id: 'google_maps',
        level: 'recommended',
        label: 'Adaugă linkul Google Maps',
        hint: 'Îi ajută pe clienți să te găsească și să te contacteze mai ușor.',
        isMet: (ctx) => filled(ctx.location.googleMapsUrl),
      },
    ],
  },
  {
    key: 2,
    title: 'Detalii locație',
    description: 'Capacitate, tipuri de evenimente, facilități și reguli',
    actionLabel: 'Configurează',
    tab: 'details',
    icon: Building2,
    rules: [
      {
        id: 'categories',
        level: 'required',
        label: 'Alege cel puțin un tip de eveniment',
        hint: 'Locația apare doar în căutările pentru tipurile de evenimente alese.',
        isMet: (ctx) => (ctx.location.categories || []).length > 0,
      },
      {
        id: 'seating_plan',
        level: 'required',
        label: 'Setează capacitatea pentru cel puțin un tip de aranjare',
        hint: 'Organizatorii filtrează locațiile după numărul de invitați.',
        isMet: (ctx) => activeSeatingPlans(ctx).length > 0,
      },
      {
        id: 'seating_plans_min',
        level: 'recommended',
        label: `Adaugă minim ${T.minSeatingPlans} tipuri de aranjare`,
        hint: 'Mai multe aranjări (dining, standing, teatru…) acoperă mai multe tipuri de evenimente.',
        current: (ctx) => activeSeatingPlans(ctx).length,
        target: T.minSeatingPlans,
        isMet: (ctx) => activeSeatingPlans(ctx).length >= T.minSeatingPlans,
      },
      {
        id: 'facilities_min',
        level: 'recommended',
        label: `Adaugă minim ${T.minFacilities} facilități`,
        hint: 'Facilitățile (parcare, sonorizare, aer condiționat…) sunt printre primele lucruri verificate.',
        current: (ctx) => (ctx.location.facilities || []).length,
        target: T.minFacilities,
        isMet: (ctx) => (ctx.location.facilities || []).length >= T.minFacilities,
      },
      {
        id: 'rules_min',
        level: 'recommended',
        label: `Adaugă minim ${T.minRules} reguli ale spațiului`,
        hint: 'Regulile clare evită neînțelegeri și întrebări repetate.',
        current: (ctx) => (ctx.location.rules || []).length,
        target: T.minRules,
        isMet: (ctx) => (ctx.location.rules || []).length >= T.minRules,
      },
    ],
  },
  {
    key: 3,
    title: 'Poze',
    description: 'Prezintă spațiul organizatorilor',
    actionLabel: 'Adaugă',
    tab: 'details',
    icon: Camera,
    rules: [
      {
        id: 'photos',
        level: 'required',
        label: 'Adaugă cel puțin o fotografie',
        hint: 'Locațiile fără poze sunt rareori deschise de organizatori.',
        isMet: (ctx) => ctx.photosCount > 0,
      },
      {
        id: 'photos_min',
        level: 'recommended',
        label: `Adaugă minim ${T.minPhotos} fotografii`,
        hint: `Locațiile cu peste ${T.minPhotos} fotografii primesc cu până la 3x mai multe solicitări.`,
        current: (ctx) => ctx.photosCount,
        target: T.minPhotos,
        isMet: (ctx) => ctx.photosCount >= T.minPhotos,
      },
    ],
  },
  {
    key: 4,
    title: 'Preț',
    description: 'Tarife de bază și pe tip de eveniment',
    actionLabel: 'Setează',
    tab: 'pricing',
    icon: Tag,
    rules: [
      {
        id: 'default_pricing',
        level: 'required',
        label: 'Setează prețul de bază',
        hint: 'Un preț orientativ îi ajută pe clienți să știe dacă locația se încadrează în buget.',
        isMet: hasDefaultPricing,
      },
      {
        id: 'category_pricing',
        level: 'recommended',
        label: 'Setează prețuri pe tip de eveniment',
        hint: 'Ajută clienții să înțeleagă mai ușor oferta pentru evenimentul lor.',
        isMet: (ctx) => categoryPricingCount(ctx) > 0,
      },
    ],
  },
  {
    key: 5,
    title: 'Disponibilitate',
    description: 'Program și intervale rezervabile',
    actionLabel: 'Setează',
    tab: 'rules',
    icon: CalendarDays,
    rules: [
      {
        id: 'schedule',
        level: 'required',
        label: 'Setează programul locației',
        hint: 'Fără program, clienții nu pot vedea când e liberă locația.',
        isMet: (ctx) => ctx.hasAvailability,
      },
    ],
  },
];

/** Regulă neîndeplinită, cu valoarea curentă calculată (pentru reguli numerice). */
export type MissingRule = QualityRule & { currentValue?: number };

export type EvaluatedStep = QualityStep & {
  done: boolean;
  missingRequired: MissingRule[];
  missingRecommended: MissingRule[];
};

export type LocationTip = MissingRule & { step: EvaluatedStep };

export type LocationQualityResult = {
  steps: EvaluatedStep[];
  doneCount: number;
  isComplete: boolean;
  /** Toate regulile neîndeplinite, cele obligatorii primele — folosite ca sfaturi. */
  tips: LocationTip[];
};

export function evaluateLocationQuality(ctx: LocationQualityContext): LocationQualityResult {
  const steps: EvaluatedStep[] = LOCATION_SETUP_STEPS.map((step) => {
    const missing: MissingRule[] = step.rules
      .filter((rule) => !rule.isMet(ctx))
      .map((rule) => ({ ...rule, currentValue: rule.current?.(ctx) }));
    const missingRequired = missing.filter((r) => r.level === 'required');
    return {
      ...step,
      done: missingRequired.length === 0,
      missingRequired,
      missingRecommended: missing.filter((r) => r.level === 'recommended'),
    };
  });

  const doneCount = steps.filter((s) => s.done).length;
  const tips: LocationTip[] = [
    ...steps.flatMap((step) => step.missingRequired.map((rule) => ({ ...rule, step }))),
    ...steps.flatMap((step) => step.missingRecommended.map((rule) => ({ ...rule, step }))),
  ];

  return { steps, doneCount, isComplete: doneCount === steps.length, tips };
}
