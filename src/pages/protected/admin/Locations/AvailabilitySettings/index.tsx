import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityConfig, RecurringBlock, RecurringRule, WeekdayIndex } from "./types";
import { DEFAULT_GENERAL_RULES, WEEKDAY_LABELS } from "./types";
import defaultRecurringSchedule from "./defaultRecurringSchedule.json";
import RecurringSchedule from "./RecurringSchedule";
import RecurringBlocks from "./RecurringBlocks";
import GeneralRules from "./GeneralRules";
import { getAvailabilityRules } from "../../../../../api/bookings/bookings";

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

function mapApiDaysToWeekdayIndexes(days: string[]): WeekdayIndex[] {
  const out: WeekdayIndex[] = [];
  for (const d of days) {
    const idx = WEEKDAY_LABELS.indexOf(d as (typeof WEEKDAY_LABELS)[number]);
    if (idx >= 0 && idx <= 6) out.push(idx as WeekdayIndex);
  }
  return out;
}

type ApiAvailabilityItem = {
  id: number;
  days: string[];
  startTime: string;
  endTime: string;
  dateFrom: string | null;
  dateTo: string | null;
  enabled: boolean;
  label: string;
};

function mapScheduleToRecurringRules(items: ApiAvailabilityItem[]): RecurringRule[] {
  return items.map((r) => ({
    id: String(r.id),
    enabled: r.enabled,
    days: mapApiDaysToWeekdayIndexes(r.days),
    startTime: r.startTime,
    endTime: r.endTime,
    dateFrom: apiDateToIsoDate(r.dateFrom),
    dateTo: apiDateToIsoDate(r.dateTo),
    label: r.label,
  }));
}

function mapBlockedToRecurringBlocks(items: ApiAvailabilityItem[]): RecurringBlock[] {
  return items.map((r) => ({
    id: String(r.id),
    enabled: r.enabled,
    recurrence: "weekly",
    days: mapApiDaysToWeekdayIndexes(r.days),
    startTime: r.startTime,
    endTime: r.endTime,
    dateFrom: apiDateToIsoDate(r.dateFrom),
    dateTo: apiDateToIsoDate(r.dateTo),
    reason: r.label,
  }));
}

type AvailabilitySettingsProps = {
  slug?: string;
};

const AvailabilitySettingsPage: React.FC<AvailabilitySettingsProps> = ({ slug }) => {
  const locationId = useMemo(() => parseLocationIdFromSlug(slug), [slug]);

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
          const d = response.data as {
            schedule?: ApiAvailabilityItem[];
            blocked?: ApiAvailabilityItem[];
          };
          setConfig({
            recurringSchedule: mapScheduleToRecurringRules(d.schedule ?? []),
            recurringBlocks: mapBlockedToRecurringBlocks(d.blocked ?? []),
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

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(JSON.stringify(config, null, 2));
  }, [config]);

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

      <div className="sticky bottom-0 -mx-2 flex justify-end border-t border-gray-200 bg-white/95 px-2 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Salvează
        </button>
      </div>
    </form>
  );
};

export default AvailabilitySettingsPage;
