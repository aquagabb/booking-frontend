/** 0 = Luni … 6 = Duminică */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type RecurrenceType = "weekly" | "custom_days";

export interface RecurringRule {
  id: string;
  enabled: boolean;
  days: WeekdayIndex[];
  startTime: string;
  endTime: string;
  dateFrom: string | null;
  dateTo: string | null;
  label: string;
}

export interface RecurringBlock {
  id: string;
  enabled: boolean;
  recurrence: RecurrenceType;
  /** Folosit pentru ambele tipuri de recurență */
  days: WeekdayIndex[];
  startTime: string;
  endTime: string;
  dateFrom: string | null;
  dateTo: string | null;
  reason: string;
}

export interface GeneralRules {
  minAdvanceHours: number;
  maxAdvanceDays: number;
  minDurationMinutes: number;
  bufferAfterMinutes: number;
  confirmationDeadlineHours: number;
  onlineSameDayEnabled: boolean;
}

export const DEFAULT_GENERAL_RULES: GeneralRules = {
  minAdvanceHours: 2,
  maxAdvanceDays: 90,
  minDurationMinutes: 60,
  bufferAfterMinutes: 60,
  confirmationDeadlineHours: 24,
  onlineSameDayEnabled: false,
};

export interface AvailabilityConfig {
  recurringSchedule: RecurringRule[];
  recurringBlocks: RecurringBlock[];
  generalRules: GeneralRules;
}

export const WEEKDAY_LABELS: readonly string[] = ["L", "Ma", "Mi", "J", "V", "S", "D"];
