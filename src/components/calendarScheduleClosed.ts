import moment, { type Moment } from "moment";
import type { ApiAvailabilityBlockedItem } from "./calendarRecurringBlocks";
import { segmentsForTimedRuleOnCalendarDay, type TimedWeekdayRule } from "./calendarRecurringBlocks";

/** Regulă de program (API `schedule`): intervalul start–end = deschis; restul zilei = închis în timeline */
export type PreparedScheduleRule = TimedWeekdayRule & {
  id: number;
  label: string;
  periodDescriptionRo: string;
};

function apiDateToIsoDate(iso: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

const WEEKDAY_LABELS = ["L", "Ma", "Mi", "J", "V", "S", "D"] as const;

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

export function prepareScheduleRules(
  schedule: ApiAvailabilityBlockedItem[] | undefined | null
): PreparedScheduleRule[] {
  if (!schedule?.length) return [];

  return schedule
    .filter((s) => s.enabled && (!s.type || s.type === "schedule"))
    .map((s) => {
      const startMinutes = parseTimeToMinutes(s.startTime);
      const endMinutes = parseTimeToMinutes(s.endTime);
      const spansMidnight = endMinutes < startMinutes;

      return {
        id: s.id,
        label: s.label,
        dateFrom: apiDateToIsoDate(s.dateFrom),
        dateTo: apiDateToIsoDate(s.dateTo),
        enabled: s.enabled,
        isoWeekdays: mapDayLabelsToIsoWeekdays(s.days),
        startMinutes,
        endMinutes,
        spansMidnight,
        periodDescriptionRo: buildPeriodDescriptionRo(
          apiDateToIsoDate(s.dateFrom),
          apiDateToIsoDate(s.dateTo)
        ),
      };
    })
    .filter((r) => r.isoWeekdays.length > 0);
}

function hasDateBounds(rule: PreparedScheduleRule): boolean {
  return rule.dateFrom != null || rule.dateTo != null;
}

type Segment = { start: Moment; end: Moment };

function mergeIntervals(segments: Segment[]): Segment[] {
  if (!segments.length) return [];
  const sorted = [...segments].sort((a, b) => a.start.valueOf() - b.start.valueOf());
  const out: Segment[] = [];
  let cur = { start: sorted[0].start.clone(), end: sorted[0].end.clone() };
  for (let i = 1; i < sorted.length; i++) {
    const s = sorted[i];
    if (s.start.isSameOrBefore(cur.end)) {
      cur.end = moment.max(cur.end, s.end);
    } else {
      out.push(cur);
      cur = { start: s.start.clone(), end: s.end.clone() };
    }
  }
  out.push(cur);
  return out;
}

/** Elimină din `a` porțiunea acoperită de intervalul `b` */
function subtractOneSegment(a: Segment, b: Segment): Segment[] {
  if (b.end.isSameOrBefore(a.start) || b.start.isSameOrAfter(a.end)) {
    return [{ start: a.start.clone(), end: a.end.clone() }];
  }
  const out: Segment[] = [];
  if (a.start.isBefore(b.start)) {
    out.push({ start: a.start.clone(), end: moment.min(a.end, b.start) });
  }
  if (b.end.isBefore(a.end)) {
    out.push({ start: moment.max(a.start, b.end), end: a.end.clone() });
  }
  return out.filter((s) => s.end.isAfter(s.start));
}

function subtractMergedFromMerged(mergedA: Segment[], mergedB: Segment[]): Segment[] {
  let result = mergedA.map((s) => ({ start: s.start.clone(), end: s.end.clone() }));
  for (const b of mergedB) {
    result = result.flatMap((a) => subtractOneSegment(a, b));
  }
  return mergeIntervals(result);
}

/**
 * Ore deschise = reuniune(specific, permanent minus acoperit de specific).
 * Astfel, în weekendul de vară folosești doar regula S/D; luni dimineața după un weekend
 * păstrezi spill-ul din duminică (specific) și programul permanent (ex. 10–22).
 */
function mergedOpenIntervalsForDay(day: Moment, rules: PreparedScheduleRule[]): Segment[] {
  const specificRules = rules.filter((r) => r.enabled && hasDateBounds(r));
  const permanentRules = rules.filter((r) => r.enabled && !hasDateBounds(r));

  const specificRaw = specificRules.flatMap((r) => segmentsForTimedRuleOnCalendarDay(day, r));
  const permanentRaw = permanentRules.flatMap((r) => segmentsForTimedRuleOnCalendarDay(day, r));

  const specM = mergeIntervals(specificRaw);
  const permM = mergeIntervals(permanentRaw);
  const permAfterSubtract = subtractMergedFromMerged(permM, specM);

  return mergeIntervals([...specM, ...permAfterSubtract]);
}

/** Complementul intervalelor deschise în interiorul unei zile calendaristice = timp închis */
function closedSegmentsInDay(day: Moment, openMerged: Segment[]): Segment[] {
  const ds = day.clone().startOf("day");
  const de = day.clone().endOf("day");
  if (openMerged.length === 0) {
    return [];
  }

  const blocked: Segment[] = [];
  let cursor = ds.clone();

  for (const o of openMerged) {
    if (o.start.isAfter(cursor)) {
      blocked.push({
        start: cursor.clone(),
        end: moment.min(o.start.clone(), de),
      });
    }
    cursor = moment.max(cursor, o.end);
    if (cursor.isSameOrAfter(de)) {
      break;
    }
  }

  if (cursor.isBefore(de)) {
    blocked.push({ start: cursor.clone(), end: de.clone() });
  }

  return blocked.filter((b) => b.end.isAfter(b.start));
}

export type ScheduleClosedTimelineEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isBlocked: true;
  isScheduleClosed: true;
  status: "Blocked";
  scheduleRuleLabels: string;
  schedulePeriodNote: string;
};

export function expandScheduleClosedToTimelineEvents(
  rangeStart: Date,
  rangeEnd: Date,
  rules: PreparedScheduleRule[]
): ScheduleClosedTimelineEvent[] {
  if (!rules.length) return [];

  const startM = moment(rangeStart).startOf("day");
  const endM = moment(rangeEnd).startOf("day");
  const events: ScheduleClosedTimelineEvent[] = [];

  for (let d = startM.clone(); d.isSameOrBefore(endM, "day"); d.add(1, "day")) {
    const day = d.clone();
    const mergedOpen = mergedOpenIntervalsForDay(day, rules);
    if (mergedOpen.length === 0) {
      continue;
    }

    const closed = closedSegmentsInDay(day, mergedOpen);
    const ymd = day.format("YYYY-MM-DD");

    const contributing = rules.filter(
      (r) => r.enabled && segmentsForTimedRuleOnCalendarDay(day, r).length > 0
    );
    const labels = contributing.map((r) => r.label).join(", ");
    const periodNotes = [...new Set(contributing.map((r) => r.periodDescriptionRo))].join(" · ");

    const titleFromLabels = labels.trim() ? labels : "În afara programului";

    closed.forEach((seg, segIx) => {
      events.push({
        id: `avail-schedule-closed-${ymd}-${segIx}`,
        title: titleFromLabels,
        start: seg.start.toDate(),
        end: seg.end.toDate(),
        isBlocked: true,
        isScheduleClosed: true,
        status: "Blocked",
        scheduleRuleLabels: labels,
        schedulePeriodNote: periodNotes,
      });
    });
  }

  return events;
}
