import React, { useCallback, useState } from "react";
import { Trash2, Plus, Pencil, Calendar, Clock } from "lucide-react";
import CustomInput from "../../../../../components/shared/CustomInput";
import CustomSwitcher from "../../../../../components/shared/CustomSwitcher";
import CustomDatePicker from "../../../../../components/shared/CustomDatePicker";
import CustomTimePicker from "../../../../../components/shared/CustomTimePicker";
import FormErrorMessage from "../../../../../components/shared/FormErrorMessage";
import ConfirmModal from "../../../../../components/shared/Modals/ConfirmModal";
import CustomModal from "../../../../../components/shared/Modals/CustomModal";
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
  /** "new" = modal de adăugare, un id = modal de editare pentru acea regulă, null = închis. */
  const [editingRuleId, setEditingRuleId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<RecurringRule | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  const isModalOpen = editingRuleId !== null && draft !== null;

  const openAddModal = useCallback(() => {
    setEditingRuleId("new");
    setDraft({
      id: newId(),
      enabled: true,
      days: [],
      startTime: "09:00",
      endTime: "18:00",
      dateFrom: null,
      dateTo: null,
      label: "",
    });
    setSaveError(null);
  }, []);

  const openEditModal = useCallback(
    (id: string) => {
      const rule = value.find((r) => r.id === id);
      if (!rule) return;
      setEditingRuleId(id);
      setDraft({ ...rule });
      setSaveError(null);
    },
    [value]
  );

  const closeModal = useCallback(() => {
    setEditingRuleId(null);
    setDraft(null);
    setSaveError(null);
  }, []);

  const updateDraft = useCallback((patch: Partial<RecurringRule>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setSaveError(null);
  }, []);

  const toggleDayDraft = useCallback((day: WeekdayIndex) => {
    setDraft((d) => {
      if (!d) return d;
      const has = d.days.includes(day);
      const days = has ? d.days.filter((x) => x !== day) : [...d.days, day].sort((a, b) => a - b);
      return { ...d, days };
    });
    setSaveError(null);
  }, []);

  const setDraftStartTime = useCallback((startTime: string) => {
    setDraft((d) => {
      if (!d) return d;
      const minEnd = minEndTimeAfterStart(startTime);
      const endTime = d.endTime > startTime ? d.endTime : minEnd;
      return { ...d, startTime, endTime };
    });
    setSaveError(null);
  }, []);

  const saveModal = useCallback(() => {
    if (!draft) return;
    const err = validateRule(draft);
    if (err) {
      setSaveError(err);
      return;
    }
    if (editingRuleId === "new") {
      onChange([...value, draft]);
    } else {
      onChange(value.map((r) => (r.id === editingRuleId ? draft : r)));
    }
    closeModal();
  }, [draft, editingRuleId, value, onChange, closeModal]);

  const removeRule = useCallback(
    (id: string) => {
      onChange(value.filter((r) => r.id !== id));
    },
    [value, onChange]
  );

  const confirmDeleteRule = useCallback(() => {
    if (deleteRuleId === null) return;
    removeRule(deleteRuleId);
    setDeleteRuleId(null);
  }, [deleteRuleId, removeRule]);

  const cancelDeleteRule = useCallback(() => {
    setDeleteRuleId(null);
  }, []);

  const pendingDeleteRule = deleteRuleId ? value.find((x) => x.id === deleteRuleId) : undefined;
  const deleteConfirmText =
    pendingDeleteRule?.label.trim()
      ? `Sigur vrei să ștergi regula „${pendingDeleteRule.label.trim()}"?`
      : "Sigur vrei să ștergi această regulă?";

  const timeOk = draft ? timeOrderValid(draft.startTime, draft.endTime) : true;
  const datesOk = draft ? dateRangeValid(draft.dateFrom, draft.dateTo) : true;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Program de disponibilitate</h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Reguli de disponibilitate repetate pe zile și intervale orare.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="btn-outline flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Adaugă regulă
        </button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-gray)] px-4 py-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nu există reguli de disponibilitate configurate.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {value.map((rule) => {
            const hasDateRange = Boolean(rule.dateFrom || rule.dateTo);
            const periodLine = `${formatISODateForDisplay(rule.dateFrom)} → ${formatISODateForDisplay(rule.dateTo)}`;

            return (
              <article
                key={rule.id}
                className={`rounded-md border border-gray-200 p-4 sm:p-4 ${rule.enabled ? "" : "opacity-55"}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CustomSwitcher
                        label=""
                        checked={rule.enabled}
                        onChange={(v) => onChange(value.map((r) => (r.id === rule.id ? { ...r, enabled: v } : r)))}
                      />
                      <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                        {rule.label.trim() || "Regulă fără denumire"}
                      </p>
                    </div>
                    <dl className="grid max-w-xl grid-cols-1 gap-y-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3">
                      <div className="contents">
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">Zile</dt>
                        <dd className="min-w-0 text-sm text-gray-900 dark:text-gray-100">{formatDaysLine(rule)}</dd>
                      </div>
                      <div className="contents">
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">Ore</dt>
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
                      onClick={() => openEditModal(rule.id)}
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
      )}

      <CustomModal
        open={isModalOpen}
        onClose={closeModal}
        title={editingRuleId === "new" ? "Adaugă regulă" : "Editează regula"}
        className="relative bg-white rounded-xl h-[90vh] w-full max-w-3xl sm:min-w-[500px] flex flex-col overflow-hidden"
      >
        {draft && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <FormErrorMessage message={saveError} />

              <CustomSwitcher
                label="Regulă activă"
                checked={draft.enabled}
                onChange={(v) => updateDraft({ enabled: v })}
              />

              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">1. Zilele săptămânii</p>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Selectează zilele în care locația este disponibilă.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(WEEKDAY_LABELS as readonly string[]).map((label, idx) => {
                    const d = idx as WeekdayIndex;
                    const on = draft.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDayDraft(d)}
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
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">2. Interval orar</p>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Alege intervalul în care accepți rezervări în zilele selectate.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CustomTimePicker
                    label="Început"
                    value={draft.startTime}
                    onChange={(v) => setDraftStartTime(v)}
                    iconLeft={<Clock className="h-4 w-4 text-gray-400" />}
                  />
                  <CustomTimePicker
                    label="Sfârșit"
                    value={draft.endTime}
                    onChange={(v) => updateDraft({ endTime: v })}
                    iconLeft={<Clock className="h-4 w-4 text-gray-400" />}
                    minTime={minEndTimeAfterStart(draft.startTime)}
                    error={!timeOk ? "Ora de sfârșit trebuie să fie după început." : undefined}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">3. Perioadă de aplicare (opțional)</p>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Dacă nu selectezi o perioadă, regula se repetă săptămânal, până o modifici.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CustomDatePicker
                    label="De la"
                    selected={parseISODateLocal(draft.dateFrom)}
                    onChange={(d) => updateDraft({ dateFrom: toISODateString(d) })}
                    placeholder="Selectează data"
                    iconLeft={<Calendar className="h-4 w-4 text-gray-400" />}
                    disablePastDates={false}
                    dateFormat="dd/MM/yyyy"
                  />
                  <CustomDatePicker
                    label="Până la"
                    selected={parseISODateLocal(draft.dateTo)}
                    onChange={(d) => updateDraft({ dateTo: toISODateString(d) })}
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

              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">4. Denumire (opțional)</p>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Adaugă un nume pentru a o identifica mai ușor.
                </p>
                <CustomInput
                  label=""
                  type="text"
                  value={draft.label}
                  onChange={(e) => updateDraft({ label: e.target.value })}
                  placeholder="ex: Program vară, Weekend"
                />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline-transparent px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={saveModal}
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Salvează
                </button>
              </div>
            </div>
          </>
        )}
      </CustomModal>

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
