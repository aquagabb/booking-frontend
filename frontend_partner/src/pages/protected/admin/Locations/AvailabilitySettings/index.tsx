import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityConfig, RecurringBlock, RecurringRule, WeekdayIndex } from "./types";
import { DEFAULT_GENERAL_RULES } from "./types";
import defaultRecurringSchedule from "./defaultRecurringSchedule.json";
import RecurringSchedule from "./RecurringSchedule";
import RecurringBlocks from "./RecurringBlocks";
import GeneralRules from "./GeneralRules";
import { useTranslation } from "react-i18next";
import { getAvailabilityRules, saveAvailabilityRules } from "../../../../../api/locations/locations";

const initialRecurringSchedule = defaultRecurringSchedule as RecurringRule[];

const defaultConfigWithoutApi: AvailabilityConfig = {
  recurringSchedule: initialRecurringSchedule,
  recurringBlocks: [],
  generalRules: DEFAULT_GENERAL_RULES,
};

const emptyConfigForLoad: AvailabilityConfig = {
  recurringSchedule: [],
  recurringBlocks: [],
  generalRules: DEFAULT_GENERAL_RULES,
};

function parseLocationIdFromSlug(slug: string | undefined): number | null {
  if (!slug || slug === "new") return null;
  const firstPart = slug.split("-")[0];
  const parsed = Number(firstPart);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Extrage `YYYY-MM-DD` din răspunsul API (ISO), fără shift de fus orar. */
function apiDateToIsoDate(iso: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** API-ul folosește 1=Luni … 7=Duminică (ISO); intern folosim 0=Luni … 6=Duminică. */
function mapApiDaysToWeekdayIndexes(days: number[]): WeekdayIndex[] {
  const out: WeekdayIndex[] = [];
  for (const d of days) {
    const idx = d - 1;
    if (idx >= 0 && idx <= 6) out.push(idx as WeekdayIndex);
  }
  return out;
}

/** API-ul trimite ora ca `HH:mm:ss`; componentele de UI așteaptă `HH:mm`. */
function apiTimeToHHmm(time: string): string {
  return time.slice(0, 5);
}

type ApiAvailabilityItem = {
  id: number;
  title: string;
  description: string | null;
  type: "schedule" | "block";
  locationId: number;
  dateFrom: string | null;
  dateTo: string | null;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isDefault: boolean;
  enabled: boolean;
};

function mapScheduleToRecurringRules(items: ApiAvailabilityItem[]): RecurringRule[] {
  return items.map((r) => ({
    id: String(r.id),
    enabled: r.enabled,
    days: mapApiDaysToWeekdayIndexes(r.daysOfWeek),
    startTime: apiTimeToHHmm(r.startTime),
    endTime: apiTimeToHHmm(r.endTime),
    dateFrom: apiDateToIsoDate(r.dateFrom),
    dateTo: apiDateToIsoDate(r.dateTo),
    label: r.title,
  }));
}

function mapBlockedToRecurringBlocks(items: ApiAvailabilityItem[]): RecurringBlock[] {
  return items.map((r) => ({
    id: String(r.id),
    enabled: r.enabled,
    recurrence: "weekly",
    days: mapApiDaysToWeekdayIndexes(r.daysOfWeek),
    startTime: apiTimeToHHmm(r.startTime),
    endTime: apiTimeToHHmm(r.endTime),
    dateFrom: apiDateToIsoDate(r.dateFrom),
    dateTo: apiDateToIsoDate(r.dateTo),
    reason: r.title,
  }));
}

/** Invers față de `mapApiDaysToWeekdayIndexes`: intern 0=Luni … API 1=Luni (ISO). */
function mapWeekdayIndexesToApiDays(days: WeekdayIndex[]): number[] {
  return days.map((d) => d + 1);
}

/** Invers față de `apiTimeToHHmm`: UI trimite `HH:mm`, API-ul așteaptă `HH:mm:ss`. */
function hhmmToApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function recurringRuleToApiPayload(rule: RecurringRule) {
  const numericId = Number(rule.id);
  return {
    id: Number.isNaN(numericId) ? undefined : numericId,
    title: rule.label,
    type: "schedule" as const,
    daysOfWeek: mapWeekdayIndexesToApiDays(rule.days),
    startTime: hhmmToApiTime(rule.startTime),
    endTime: hhmmToApiTime(rule.endTime),
    dateFrom: rule.dateFrom,
    dateTo: rule.dateTo,
    enabled: rule.enabled,
  };
}

function recurringBlockToApiPayload(block: RecurringBlock) {
  const numericId = Number(block.id);
  return {
    id: Number.isNaN(numericId) ? undefined : numericId,
    title: block.reason,
    type: "block" as const,
    daysOfWeek: mapWeekdayIndexesToApiDays(block.days),
    startTime: hhmmToApiTime(block.startTime),
    endTime: hhmmToApiTime(block.endTime),
    dateFrom: block.dateFrom,
    dateTo: block.dateTo,
    enabled: block.enabled,
  };
}

type AvailabilitySettingsProps = {
  slug?: string;
  onSaved?: () => void;
  /** Când e folosit într-un wizard cu footer propriu: ascunde butonul intern de salvare,
   * dar îl păstrează în DOM (cu id stabil) ca să poată fi declanșat din exterior. */
  embedded?: boolean;
};

const AvailabilitySettingsPage: React.FC<AvailabilitySettingsProps> = ({ slug, onSaved, embedded }) => {
  const { t } = useTranslation();
  const locationId = useMemo(() => parseLocationIdFromSlug(slug), [slug]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [isLoading, setIsLoading] = useState(() => !!locationId);
  const [config, setConfig] = useState<AvailabilityConfig>(() =>
    locationId ? emptyConfigForLoad : defaultConfigWithoutApi
  );

  useEffect(() => {
    if (!locationId) {
      setConfig(defaultConfigWithoutApi);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const { environment, response } = await getAvailabilityRules(locationId);
        if (cancelled) return;
        if (environment.status === 200 && response?.data) {
          const items = response.data as ApiAvailabilityItem[];
          const scheduleItems = items.filter((r) => r.type !== "block");
          const blockedItems = items.filter((r) => r.type === "block");
          setConfig({
            recurringSchedule: mapScheduleToRecurringRules(scheduleItems),
            recurringBlocks: mapBlockedToRecurringBlocks(blockedItems),
            generalRules: DEFAULT_GENERAL_RULES,
          });
        } else {
          setConfig(emptyConfigForLoad);
        }
      } catch {
        if (!cancelled) setConfig(emptyConfigForLoad);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  const setRecurringSchedule = useCallback((recurringSchedule: AvailabilityConfig["recurringSchedule"]) => {
    setConfig((c) => ({ ...c, recurringSchedule }));
  }, []);

  const setRecurringBlocks = useCallback((recurringBlocks: AvailabilityConfig["recurringBlocks"]) => {
    setConfig((c) => ({ ...c, recurringBlocks }));
  }, []);

  const setGeneralRules = useCallback((generalRules: AvailabilityConfig["generalRules"]) => {
    setConfig((c) => ({ ...c, generalRules: { ...DEFAULT_GENERAL_RULES, ...generalRules } }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!locationId) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const rules = [
        ...config.recurringSchedule.map(recurringRuleToApiPayload),
        ...config.recurringBlocks.map(recurringBlockToApiPayload),
      ];

      const { environment } = await saveAvailabilityRules(locationId, { rules });

      if (environment.status === 200) {
        setFeedback({ type: "success", message: t("common.update_success") });
        onSaved?.();
      } else {
        setFeedback({ type: "error", message: t("common.update_error") });
      }
    } catch {
      setFeedback({ type: "error", message: t("common.update_error") });
    } finally {
      setIsSubmitting(false);
    }
  }, [config, locationId, onSaved, t]);

  if (isLoading) {
    return (
      <div className="mx-auto  space-y-8 pb-24">
        <p className="text-sm text-gray-600 dark:text-gray-400">Se încarcă regulile de disponibilitate…</p>
      </div>
    );
  }

  return (
    <form className="mx-auto  space-y-8 pb-24" onSubmit={handleSubmit}>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Reguli de disponibilitate
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Configurează programul, blocările și regulile generale pentru această sală.
        </p>
      </header>

      <RecurringSchedule value={config.recurringSchedule} onChange={setRecurringSchedule} />
      <div className="border-t border-gray-200 dark:border-gray-700"></div>
      <RecurringBlocks value={config.recurringBlocks} onChange={setRecurringBlocks} />
      <div className="border-t border-gray-200 dark:border-gray-700"></div>
      <GeneralRules value={config.generalRules} onChange={setGeneralRules} />

      <div className={`sticky bottom-0 -mx-2 flex items-center justify-between gap-3 border-t border-gray-200 bg-white/95 px-2 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 ${embedded ? "hidden" : ""}`}>
        {feedback && (
          <div
            className={`text-sm font-medium px-3 py-1 rounded-lg ${
              feedback.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        )}
        <button
          id="availability-save-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isSubmitting ? t("common.saving") : t("common.save")}
        </button>
      </div>
    </form>
  );
};

export default AvailabilitySettingsPage;
