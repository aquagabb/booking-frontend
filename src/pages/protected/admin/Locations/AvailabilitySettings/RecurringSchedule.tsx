import React, { useCallback, useState } from "react";
import { Trash2, Plus, Pencil, Calendar, Clock } from "lucide-react";
import CustomInput from "../../../../../components/shared/CustomInput";
import CustomSwitcher from "../../../../../components/shared/CustomSwitcher";
import CustomDatePicker from "../../../../../components/shared/CustomDatePicker";
import CustomTimePicker from "../../../../../components/shared/CustomTimePicker";
import FormErrorMessage from "../../../../../components/shared/FormErrorMessage";
import ConfirmModal from "../../../../../components/shared/Modals/ConfirmModal";
import type { RecurringRule, WeekdayIndex } from "./types";
import { WEEKDAY_LABELS } from "./types";

function newId(): string {
  return crypto.randomUUID();
}

function timeOrderValid(start: string, end: string): boolean {
  return start < end;
}

function dateRangeValid(from: string | null, to: string | null): boolean {
  if (!from || !to) return true;
  return from < to;
}

/** Parse `YYYY-MM-DD` în dată locală (fără UTC shift). */
function parseISODateLocal(s: string | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODateString(d: Date | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Primul slot la 15 min strict după `start` (HH:mm), ca în ReservationRight pentru end time. */
function minEndTimeAfterStart(startTime: string): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  let newMinutes = minutes + 15;
  let newHours = hours;
  if (newMinutes >= 60) {
    newMinutes = 0;
    newHours = (newHours + 1) % 24;
  }
  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}

function validateRule(r: RecurringRule): string | null {
  if (r.days.length === 0) return "Selectează cel puțin o zi din săptămână.";
  if (!timeOrderValid(r.startTime, r.endTime)) {
    return "Ora de sfârșit trebuie să fie după început.";
  }
  if (!dateRangeValid(r.dateFrom, r.dateTo)) {
    return "Data „până la” trebuie să fie după „de la”.";
  }
  return null;
}

function sameDays(a: WeekdayIndex[], b: WeekdayIndex[]): boolean {
  if (a.length !== b.length) return false;
  const as = [...a].sort((x, y) => x - y);
  const bs = [...b].sort((x, y) => x - y);
  return as.every((v, i) => v === bs[i]);
}

function rulesEqual(a: RecurringRule, b: RecurringRule): boolean {
  return (
    a.enabled === b.enabled &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    a.label === b.label &&
    sameDays(a.days, b.days)
  );
}

function formatISODateForDisplay(iso: string | null): string {
  if (!iso) return "—";
  const d = parseISODateLocal(iso);
  if (!d) return iso;
  return d.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDaysLine(rule: RecurringRule): string {
  if (rule.days.length === 0) return "Nicio zi selectată";
  return rule.days.map((d) => WEEKDAY_LABELS[d]).join(", ");
}

type RecurringScheduleProps = {
  value: RecurringRule[];
  onChange: (rules: RecurringRule[]) => void;
};

const RecurringSchedule: React.FC<RecurringScheduleProps> = ({ value, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftById, setDraftById] = useState<Record<string, RecurringRule>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  /** Reguli create local, încă neconfirmate cu „Salvează”. */
  const [unsavedNewRuleIds, setUnsavedNewRuleIds] = useState<Set<string>>(() => new Set());

  const updateRule = useCallback(
    (id: string, patch: Partial<RecurringRule>) => {
      onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [value, onChange]
  );

  const removeRule = useCallback(
    (id: string) => {
      onChange(value.filter((r) => r.id !== id));
      setDraftById((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setUnsavedNewRuleIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editingId === id) {
        setEditingId(null);
        setSaveError(null);
      }
    },
    [value, onChange, editingId]
  );

  const confirmDeleteRule = useCallback(() => {
    if (deleteRuleId === null) return;
    removeRule(deleteRuleId);
    setDeleteRuleId(null);
  }, [deleteRuleId, removeRule]);

  const cancelDeleteRule = useCallback(() => {
    setDeleteRuleId(null);
  }, []);

  const updateDraft = useCallback(
    (id: string, patch: Partial<RecurringRule>) => {
      setDraftById((d) => {
        const base = d[id] ?? value.find((r) => r.id === id);
        if (!base) return d;
        return { ...d, [id]: { ...base, ...patch } };
      });
      setSaveError(null);
    },
    [value]
  );

  const toggleDayDraft = useCallback(
    (ruleId: string, day: WeekdayIndex) => {
      setDraftById((d) => {
        const base = d[ruleId] ?? value.find((r) => r.id === ruleId);
        if (!base) return d;
        const has = base.days.includes(day);
        const days = has
          ? base.days.filter((x) => x !== day)
          : [...base.days, day].sort((a, b) => a - b);
        return { ...d, [ruleId]: { ...base, days } };
      });
      setSaveError(null);
    },
    [value]
  );

  const setDraftStartTime = useCallback((ruleId: string, startTime: string) => {
    setDraftById((d) => {
      const base = d[ruleId] ?? value.find((r) => r.id === ruleId);
      if (!base) return d;
      const minEnd = minEndTimeAfterStart(startTime);
      const endTime = base.endTime > startTime ? base.endTime : minEnd;
      return { ...d, [ruleId]: { ...base, startTime, endTime } };
    });
    setSaveError(null);
  }, [value]);

  const startEdit = useCallback(
    (id: string) => {
      const rule = value.find((r) => r.id === id);
      if (!rule) return;
      setEditingId(id);
      setDraftById((d) => ({ ...d, [id]: { ...rule } }));
      setSaveError(null);
    },
    [value]
  );

  const saveEdit = useCallback(
    (id: string) => {
      const draft = draftById[id];
      if (!draft) return;
      const err = validateRule(draft);
      if (err) {
        setSaveError(err);
        return;
      }
      onChange(value.map((r) => (r.id === id ? draft : r)));
      setEditingId(null);
      setDraftById((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setUnsavedNewRuleIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSaveError(null);
    },
    [draftById, value, onChange]
  );

  const cancelEdit = useCallback(
    (id: string) => {
      if (unsavedNewRuleIds.has(id)) {
        onChange(value.filter((r) => r.id !== id));
        setUnsavedNewRuleIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
      setEditingId(null);
      setDraftById((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setSaveError(null);
    },
    [unsavedNewRuleIds, value, onChange]
  );

  const addRule = useCallback(() => {
    const rule: RecurringRule = {
      id: newId(),
      enabled: true,
      days: [],
      startTime: "09:00",
      endTime: "18:00",
      dateFrom: null,
      dateTo: null,
      label: "",
    };
    onChange([...value, rule]);
    setEditingId(rule.id);
    setDraftById((d) => ({ ...d, [rule.id]: { ...rule } }));
    setUnsavedNewRuleIds((prev) => new Set(prev).add(rule.id));
    setSaveError(null);
  }, [value, onChange]);

  const pendingDeleteRule = deleteRuleId ? value.find((x) => x.id === deleteRuleId) : undefined;
  const deleteConfirmText =
    pendingDeleteRule?.label.trim()
      ? `Sigur vrei să ștergi regula „${pendingDeleteRule.label.trim()}"?`
      : "Sigur vrei să ștergi această regulă?";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Program recurent</h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Reguli de disponibilitate repetate pe zile și intervale orare.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {value.map((rule) => {
          const isEditing = editingId === rule.id;
          const draft = isEditing ? (draftById[rule.id] ?? rule) : rule;

          if (isEditing) {
            const timeOk = timeOrderValid(draft.startTime, draft.endTime);
            const datesOk = dateRangeValid(draft.dateFrom, draft.dateTo);
            const isUnsavedNew = unsavedNewRuleIds.has(rule.id);
            const savedBaseline = value.find((r) => r.id === rule.id);
            const isModified =
              !isUnsavedNew &&
              savedBaseline !== undefined &&
              !rulesEqual(draft, savedBaseline);
            return (
              <article
                key={rule.id}
                className="rounded-xl bg-gray-50/90 p-5 shadow-sm dark:bg-gray-800/50 sm:p-6"
              >
                <div className="space-y-6">
                  <FormErrorMessage message={saveError} />

                  {(isUnsavedNew || isModified) && (
                    <p
                      className="text-xs font-medium text-amber-700 dark:text-amber-300"
                      role="status"
                    >
                      {isUnsavedNew
                        ? "Regula nu este salvată. Apasă „Salvează” pentru a o confirma."
                        : "Modificată — salvează sau anulează pentru a reveni la varianta anterioară."}
                    </p>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CustomSwitcher
                      label="Regulă activă"
                      checked={draft.enabled}
                      onChange={(v) => updateDraft(rule.id, { enabled: v })}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(rule.id)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                      >
                        Salvează
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelEdit(rule.id)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/80 dark:text-gray-300 dark:hover:bg-gray-700/80"
                      >
                        Anulează
                      </button>
                    <button
                      type="button"
                      onClick={() => setDeleteRuleId(rule.id)}
                      className="rounded-lg p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      aria-label="Șterge regula"
                    >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Zile</p>
                    <div className="flex flex-wrap gap-2">
                      {(WEEKDAY_LABELS as readonly string[]).map((label, idx) => {
                        const d = idx as WeekdayIndex;
                        const on = draft.days.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDayDraft(rule.id, d)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              on
                                ? "bg-primary text-white"
                                : "bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-600"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Interval orar
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CustomTimePicker
                        key={`${rule.id}-start`}
                        label="Început"
                        value={draft.startTime}
                        onChange={(v) => setDraftStartTime(rule.id, v)}
                        iconLeft={<Clock className="h-4 w-4 text-gray-400" />}
                      />
                      <CustomTimePicker
                        key={`${rule.id}-end`}
                        label="Sfârșit"
                        value={draft.endTime}
                        onChange={(v) => updateDraft(rule.id, { endTime: v })}
                        iconLeft={<Clock className="h-4 w-4 text-gray-400" />}
                        minTime={minEndTimeAfterStart(draft.startTime)}
                        error={
                          !timeOk ? "Ora de sfârșit trebuie să fie după început." : undefined
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Perioadă (opțional)
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CustomDatePicker
                        key={`${rule.id}-from`}
                        label="De la"
                        selected={parseISODateLocal(draft.dateFrom)}
                        onChange={(d) =>
                          updateDraft(rule.id, { dateFrom: toISODateString(d) })
                        }
                        placeholder="Selectează data"
                        iconLeft={<Calendar className="h-4 w-4 text-gray-400" />}
                        disablePastDates={false}
                        dateFormat="dd/MM/yyyy"
                      />
                      <CustomDatePicker
                        key={`${rule.id}-to`}
                        label="Până la"
                        selected={parseISODateLocal(draft.dateTo)}
                        onChange={(d) =>
                          updateDraft(rule.id, { dateTo: toISODateString(d) })
                        }
                        placeholder="Selectează data"
                        iconLeft={<Calendar className="h-4 w-4 text-gray-400" />}
                        disablePastDates={false}
                        minDate={parseISODateLocal(draft.dateFrom) ?? undefined}
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                    {!datesOk && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
                        Data „până la” trebuie să fie după „de la”.
                      </p>
                    )}
                  </div>

                  <CustomInput
                    label="Denumire (opțional)"
                    type="text"
                    value={draft.label}
                    onChange={(e) => updateDraft(rule.id, { label: e.target.value })}
                    placeholder="ex: Program vară, Weekend"
                  />
                </div>
              </article>
            );
          }

          const hasDateRange = Boolean(rule.dateFrom || rule.dateTo);
          const periodLine = `${formatISODateForDisplay(rule.dateFrom)} → ${formatISODateForDisplay(rule.dateTo)}`;

          return (
            <article
              key={rule.id}
              className={`rounded-md border border-gray-200 p-4 sm:p-4 ${
                rule.enabled ? "" : "opacity-55"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CustomSwitcher
                      label=""
                      checked={rule.enabled}
                      onChange={(v) => updateRule(rule.id, { enabled: v })}
                    />
                    <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                      {rule.label.trim() || "Regulă fără denumire"}
                    </p>
                  </div>
                  <dl className="grid max-w-xl grid-cols-1 gap-y-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3">
                    <div className="contents">
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">
                        Zile
                      </dt>
                      <dd className="min-w-0 text-sm text-gray-900 dark:text-gray-100">
                        {formatDaysLine(rule)}
                      </dd>
                    </div>
                    <div className="contents">
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">
                        Ore
                      </dt>
                      <dd className="min-w-0 text-sm text-gray-900 dark:text-gray-100">
                        {rule.startTime} – {rule.endTime}
                      </dd>
                    </div>
                    {hasDateRange && (
                      <div className="contents">
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">
                          Perioadă
                        </dt>
                        <dd className="min-w-0 text-sm text-gray-900 dark:text-gray-100">{periodLine}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:pt-0.5">
                  <button
                    type="button"
                    onClick={() => startEdit(rule.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:border-primary/30 hover:text-primary dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary"
                    aria-label="Editează regula"
                  >
                    <Pencil className="h-4 w-4" />
                    Editează
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteRuleId(rule.id)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Șterge regula"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>


      {editingId === null && (
        <button
          type="button"
          onClick={addRule}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-600 dark:text-gray-200"
        >
          <Plus className="h-4 w-4" />
          Adaugă regulă
        </button>
      )}

      <ConfirmModal
        isOpen={deleteRuleId !== null}
        title="Ștergi regula?"
        text={deleteConfirmText}
        cancelText="Nu"
        confirmText="Da"
        onClose={cancelDeleteRule}
        onConfirm={confirmDeleteRule}
      />
    </section>
  );
};

export default RecurringSchedule;
