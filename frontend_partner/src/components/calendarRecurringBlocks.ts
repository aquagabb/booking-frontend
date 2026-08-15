import moment, { type Moment } from "moment";

/** Zile API: L = Luni … D = Duminică (aceeași convenție ca AvailabilitySettings) */
const WEEKDAY_LABELS = ["L", "Ma", "Mi", "J", "V", "S", "D"] as const;

export type ApiAvailabilityBlockedItem = {
  id: number;
  locationId?: number;
  type?: string;
  label: string;
  days: string[];
  startTime: string;
  endTime: string;
  dateFrom: string | null;
  dateTo: string | null;
  enabled: boolean;
};

export type PreparedRecurringBlockedRule = {
  id: number;
  label: string;
  dateFrom: string | null;
  dateTo: string | null;
  enabled: boolean;
  /** moment.isoWeekday(): 1 = luni … 7 = duminică */
  isoWeekdays: number[];
  startMinutes: number;
  endMinutes: number;
  spansMidnight: boolean;
  /** Text pentru UI (permanentă sau interval de date) */
  periodDescriptionRo: string;
};

function apiDateToIsoDate(iso: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function mapDayLabelsToIsoWeekdays(days: string[]): number[] {
  const out: number[] = [];
  for (const d of days) {
    const idx = WEEKDAY_LABELS.indexOf(d as (typeof WEEKDAY_LABELS)[number]);
    if (idx >= 0) out.push(idx + 1);
  }
  return out;
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function buildPeriodDescriptionRo(dateFrom: string | null, dateTo: string | null): string {
  if (!dateFrom && !dateTo) {
    return "Permanentă (orice săptămână, în zilele selectate)";
  }
  const fmt = (ymd: string) => moment(ymd, "YYYY-MM-DD").format("DD/MM/YYYY");
  if (dateFrom && dateTo) {
    return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  }
  if (dateFrom) {
    return `De la ${fmt(dateFrom)}`;
  }
  return `Până la ${fmt(dateTo!)}`;
}

/** Regulă cu intervale orare pe zile (folosit la block și la schedule / deschidere) */
export type TimedWeekdayRule = {
  enabled: boolean;
  isoWeekdays: number[];
  dateFrom: string | null;
  dateTo: string | null;
  startMinutes: number;
  endMinutes: number;
  spansMidnight: boolean;
};

export function calendarDayInRuleRange(ymd: string, rule: Pick<TimedWeekdayRule, "dateFrom" | "dateTo">): boolean {
  if (rule.dateFrom && ymd < rule.dateFrom) return false;
  if (rule.dateTo && ymd > rule.dateTo) return false;
  return true;
}

/**
 * Normalizează răspunsul API `blocked` pentru reguli recurente (tip block).
 */
export function prepareRecurringBlockedRules(
  blocked: ApiAvailabilityBlockedItem[] | undefined | null
): PreparedRecurringBlockedRule[] {
  if (!blocked?.length) return [];

  return blocked
    .filter((b) => b.enabled && (!b.type || b.type === "block"))
    .map((b) => {
      const startMinutes = parseTimeToMinutes(b.startTime);
      const endMinutes = parseTimeToMinutes(b.endTime);
      const spansMidnight = endMinutes < startMinutes;

      return {
        id: b.id,
        label: b.label,
        dateFrom: apiDateToIsoDate(b.dateFrom),
        dateTo: apiDateToIsoDate(b.dateTo),
        enabled: b.enabled,
        isoWeekdays: mapDayLabelsToIsoWeekdays(b.days),
        startMinutes,
        endMinutes,
        spansMidnight,
        periodDescriptionRo: buildPeriodDescriptionRo(
          apiDateToIsoDate(b.dateFrom),
          apiDateToIsoDate(b.dateTo)
        ),
      };
    })
    .filter((r) => r.isoWeekdays.length > 0);
}

type Segment = { start: Moment; end: Moment };

function clipSegmentToDay(seg: Segment, dayStart: Moment, dayEnd: Moment): Segment | null {
  const clipStart = moment.max(seg.start, dayStart);
  const clipEnd = moment.min(seg.end, dayEnd);
  if (!clipEnd.isAfter(clipStart)) return null;
  return { start: clipStart, end: clipEnd };
}

/** Intervale [start,end) care acoperă ziua calendaristică pentru o regulă cu start/end (blocare sau program deschis). */
export function segmentsForTimedRuleOnCalendarDay(day: Moment, rule: TimedWeekdayRule): Segment[] {
  if (!rule.enabled) return [];

  const dayStart = day.clone().startOf("day");
  const dayEnd = day.clone().endOf("day");
  const ymd = day.format("YYYY-MM-DD");
  const out: Segment[] = [];

  const isoWd = day.isoWeekday();

  if (rule.isoWeekdays.includes(isoWd) && calendarDayInRuleRange(ymd, rule)) {
    const segStart = day.clone().startOf("day").add(rule.startMinutes, "minutes");
    const segEnd = rule.spansMidnight
      ? day.clone().add(1, "day").startOf("day").add(rule.endMinutes, "minutes")
      : day.clone().startOf("day").add(rule.endMinutes, "minutes");
    const clipped = clipSegmentToDay({ start: segStart, end: segEnd }, dayStart, dayEnd);
    if (clipped) out.push(clipped);
  }

  if (rule.spansMidnight) {
    const yesterday = day.clone().subtract(1, "day");
    const yYmd = yesterday.format("YYYY-MM-DD");
    const yIso = yesterday.isoWeekday();

    if (rule.isoWeekdays.includes(yIso) && calendarDayInRuleRange(yYmd, rule)) {
      const segStart = yesterday.clone().startOf("day").add(rule.startMinutes, "minutes");
      const segEnd = yesterday
        .clone()
        .add(1, "day")
        .startOf("day")
        .add(rule.endMinutes, "minutes");
      const clipped = clipSegmentToDay({ start: segStart, end: segEnd }, dayStart, dayEnd);
      if (clipped) out.push(clipped);
    }
  }

  return out;
}

function segmentsForRuleOnCalendarDay(day: Moment, rule: PreparedRecurringBlockedRule): Segment[] {
  return segmentsForTimedRuleOnCalendarDay(day, rule);
}

export type RecurringBlockCalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isBlocked: true;
  isRecurringRuleBlock: true;
  status: "Blocked";
  reason: string;
  recurrencePeriodNote: string;
};

/**
 * Generează evenimente de calendar pentru regulile pregătite, pe intervalul [rangeStart, rangeEnd].
 */
export function expandPreparedRecurringBlocksToEvents(
  rangeStart: Date,
  rangeEnd: Date,
  rules: PreparedRecurringBlockedRule[]
): RecurringBlockCalendarEvent[] {
  if (!rules.length) return [];

  const startM = moment(rangeStart).startOf("day");
  const endM = moment(rangeEnd).startOf("day");
  const events: RecurringBlockCalendarEvent[] = [];

  for (let d = startM.clone(); d.isSameOrBefore(endM, "day"); d.add(1, "day")) {
    const day = d.clone();
    for (const rule of rules) {
      const segments = segmentsForRuleOnCalendarDay(day, rule);
      segments.forEach((seg, segIx) => {
        const ymd = day.format("YYYY-MM-DD");
        events.push({
          id: `avail-recur-block-${rule.id}-${ymd}-${segIx}`,
          title: `${rule.label}`,
          start: seg.start.toDate(),
          end: seg.end.toDate(),
          isBlocked: true,
          isRecurringRuleBlock: true,
          status: "Blocked",
          reason: rule.label,
          recurrencePeriodNote: rule.periodDescriptionRo,
        });
      });
    }
  }

  return events;
}
