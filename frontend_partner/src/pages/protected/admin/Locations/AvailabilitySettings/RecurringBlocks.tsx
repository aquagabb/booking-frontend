import React, { useCallback, useState } from "react";
import { Trash2, Plus, Pencil, Calendar, Clock } from "lucide-react";
import CustomInput from "../../../../../components/shared/CustomInput";
import CustomSwitcher from "../../../../../components/shared/CustomSwitcher";
import CustomDatePicker from "../../../../../components/shared/CustomDatePicker";
import CustomTimePicker from "../../../../../components/shared/CustomTimePicker";
import FormErrorMessage from "../../../../../components/shared/FormErrorMessage";
import ConfirmModal from "../../../../../components/shared/Modals/ConfirmModal";
import type { RecurringBlock, WeekdayIndex } from "./types";
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

function validateBlock(b: RecurringBlock): string | null {
  if (b.days.length === 0) return "Selectează cel puțin o zi din săptămână.";
  if (!timeOrderValid(b.startTime, b.endTime)) {
    return "Ora de sfârșit trebuie să fie după început.";
  }
  if (!dateRangeValid(b.dateFrom, b.dateTo)) {
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

function blocksEqual(a: RecurringBlock, b: RecurringBlock): boolean {
  return (
    a.enabled === b.enabled &&
    a.recurrence === b.recurrence &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    a.reason === b.reason &&
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

function formatDaysLine(block: RecurringBlock): string {
  if (block.days.length === 0) return "Nicio zi selectată";
  return block.days.map((d) => WEEKDAY_LABELS[d]).join(", ");
}

type RecurringBlocksProps = {
  value: RecurringBlock[];
  onChange: (blocks: RecurringBlock[]) => void;
};

const RecurringBlocks: React.FC<RecurringBlocksProps> = ({ value, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftById, setDraftById] = useState<Record<string, RecurringBlock>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null);
  /** Blocări create local, încă neconfirmate cu „Salvează”. */
  const [unsavedNewBlockIds, setUnsavedNewBlockIds] = useState<Set<string>>(() => new Set());

  const updateBlock = useCallback(
    (id: string, patch: Partial<RecurringBlock>) => {
      onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    },
    [value, onChange]
  );

  const removeBlock = useCallback(
    (id: string) => {
      onChange(value.filter((b) => b.id !== id));
      setDraftById((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setUnsavedNewBlockIds((prev) => {
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

  const confirmDeleteBlock = useCallback(() => {
    if (deleteBlockId === null) return;
    removeBlock(deleteBlockId);
    setDeleteBlockId(null);
  }, [deleteBlockId, removeBlock]);

  const cancelDeleteBlock = useCallback(() => {
    setDeleteBlockId(null);
  }, []);

  const updateDraft = useCallback(
    (id: string, patch: Partial<RecurringBlock>) => {
      setDraftById((d) => {
        const base = d[id] ?? value.find((b) => b.id === id);
        if (!base) return d;
        return { ...d, [id]: { ...base, ...patch } };
      });
      setSaveError(null);
    },
    [value]
  );

  const toggleDayDraft = useCallback(
    (blockId: string, day: WeekdayIndex) => {
      setDraftById((d) => {
        const base = d[blockId] ?? value.find((b) => b.id === blockId);
        if (!base) return d;
        const has = base.days.includes(day);
        const days = has
          ? base.days.filter((x) => x !== day)
          : [...base.days, day].sort((a, b) => a - b);
        return { ...d, [blockId]: { ...base, days } };
      });
      setSaveError(null);
    },
    [value]
  );

  const setDraftStartTime = useCallback((blockId: string, startTime: string) => {
    setDraftById((d) => {
      const base = d[blockId] ?? value.find((b) => b.id === blockId);
      if (!base) return d;
      const minEnd = minEndTimeAfterStart(startTime);
      const endTime = base.endTime > startTime ? base.endTime : minEnd;
      return { ...d, [blockId]: { ...base, startTime, endTime } };
    });
    setSaveError(null);
  }, [value]);

  const startEdit = useCallback(
    (id: string) => {
      const block = value.find((b) => b.id === id);
      if (!block) return;
      setEditingId(id);
      setDraftById((d) => ({ ...d, [id]: { ...block, recurrence: "weekly" } }));
      setSaveError(null);
    },
    [value]
  );

  const saveEdit = useCallback(
    (id: string) => {
      const draft = draftById[id];
      if (!draft) return;
      const err = validateBlock(draft);
      if (err) {
        setSaveError(err);
        return;
      }
      const saved: RecurringBlock = { ...draft, recurrence: "weekly" };
      onChange(value.map((b) => (b.id === id ? saved : b)));
      setEditingId(null);
      setDraftById((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setUnsavedNewBlockIds((prev) => {
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
      if (unsavedNewBlockIds.has(id)) {
        onChange(value.filter((b) => b.id !== id));
        setUnsavedNewBlockIds((prev) => {
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
    [unsavedNewBlockIds, value, onChange]
  );

  const addBlock = useCallback(() => {
    const block: RecurringBlock = {
      id: newId(),
      enabled: true,
      recurrence: "weekly",
      days: [],
      startTime: "12:00",
      endTime: "14:00",
      dateFrom: null,
      dateTo: null,
      reason: "",
    };
    onChange([...value, block]);
    setEditingId(block.id);
    setDraftById((d) => ({ ...d, [block.id]: { ...block } }));
    setUnsavedNewBlockIds((prev) => new Set(prev).add(block.id));
    setSaveError(null);
  }, [value, onChange]);

  const pendingDeleteBlock = deleteBlockId ? value.find((x) => x.id === deleteBlockId) : undefined;
  const deleteConfirmText =
    pendingDeleteBlock?.reason.trim()
      ? `Sigur vrei să ștergi blocarea „${pendingDeleteBlock.reason.trim()}"?`
      : "Sigur vrei să ștergi această blocare?";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Blocări recurente</h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Intervale blocate periodic (curățenie, rezervat intern etc.).
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {value.map((block) => {
          const isEditing = editingId === block.id;
          const draft = isEditing ? (draftById[block.id] ?? block) : block;

          if (isEditing) {
            const timeOk = timeOrderValid(draft.startTime, draft.endTime);
            const datesOk = dateRangeValid(draft.dateFrom, draft.dateTo);
            const isUnsavedNew = unsavedNewBlockIds.has(block.id);
            const savedBaseline = value.find((b) => b.id === block.id);
            const isModified =
              !isUnsavedNew &&
              savedBaseline !== undefined &&
              !blocksEqual(draft, savedBaseline);
            return (
              <article
                key={block.id}
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
                        ? "Blocarea nu este salvată. Apasă „Salvează” pentru a o confirma."
                        : "Modificată — salvează sau anulează pentru a reveni la varianta anterioară."}
                    </p>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CustomSwitcher
                      label="Blocare activă"
                      checked={draft.enabled}
                      onChange={(v) => updateDraft(block.id, { enabled: v })}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(block.id)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                      >
                        Salvează
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelEdit(block.id)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/80 dark:text-gray-300 dark:hover:bg-gray-700/80"
                      >
                        Anulează
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteBlockId(block.id)}
                        className="rounded-lg p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        aria-label="Șterge blocarea"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Zile
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(WEEKDAY_LABELS as readonly string[]).map((label, idx) => {
                        const d = idx as WeekdayIndex;
                        const on = draft.days.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDayDraft(block.id, d)}
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
                        key={`${block.id}-start`}
                        label="Început blocare"
                        value={draft.startTime}
                        onChange={(v) => setDraftStartTime(block.id, v)}
                        iconLeft={<Clock className="h-4 w-4 text-gray-400" />}
                      />
                      <CustomTimePicker
                        key={`${block.id}-end`}
                        label="Sfârșit blocare"
                        value={draft.endTime}
                        onChange={(v) => updateDraft(block.id, { endTime: v })}
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
                        key={`${block.id}-from`}
                        label="De la"
                        selected={parseISODateLocal(draft.dateFrom)}
                        onChange={(d) => updateDraft(block.id, { dateFrom: toISODateString(d) })}
                        placeholder="Selectează data"
                        iconLeft={<Calendar className="h-4 w-4 text-gray-400" />}
                        disablePastDates={false}
                        dateFormat="dd/MM/yyyy"
                      />
                      <CustomDatePicker
                        key={`${block.id}-to`}
                        label="Până la"
                        selected={parseISODateLocal(draft.dateTo)}
                        onChange={(d) => updateDraft(block.id, { dateTo: toISODateString(d) })}
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
                    label="Motiv intern (opțional)"
                    type="text"
                    value={draft.reason}
                    onChange={(e) => updateDraft(block.id, { reason: e.target.value })}
                    placeholder="ex: Curățenie, Rezervat management"
                  />
                </div>
              </article>
            );
          }

          const hasDateRange = Boolean(block.dateFrom || block.dateTo);
          const periodLine = `${formatISODateForDisplay(block.dateFrom)} → ${formatISODateForDisplay(block.dateTo)}`;

          return (
            <article
              key={block.id}
              className={`rounded-md border border-gray-200 p-4 sm:p-4 ${
                block.enabled ? "" : "opacity-55"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CustomSwitcher
                      label=""
                      checked={block.enabled}
                      onChange={(v) => updateBlock(block.id, { enabled: v })}
                    />
                    <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                      {block.reason.trim() || "Blocare fără motiv"}
                    </p>
                  </div>
                  <dl className="grid max-w-xl grid-cols-1 gap-y-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3">
                    <div className="contents">
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">
                        Zile
                      </dt>
                      <dd className="min-w-0 text-sm text-gray-900 dark:text-gray-100">
                        {formatDaysLine(block)}
                      </dd>
                    </div>
                    <div className="contents">
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:pt-0.5">
                        Ore
                      </dt>
                      <dd className="min-w-0 text-sm text-gray-900 dark:text-gray-100">
                        {block.startTime} – {block.endTime}
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
                    onClick={() => startEdit(block.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary/30 hover:bg-gray-100 hover:text-primary dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary"
                    aria-label="Editează blocarea"
                  >
                    <Pencil className="h-4 w-4" />
                    Editează
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteBlockId(block.id)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Șterge blocarea"
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
          onClick={addBlock}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-600 dark:text-gray-200"
        >
          <Plus className="h-4 w-4" />
          Adaugă regulă
        </button>
      )}

      <ConfirmModal
        isOpen={deleteBlockId !== null}
        title="Ștergi blocarea?"
        text={deleteConfirmText}
        cancelText="Nu"
        confirmText="Da"
        onClose={cancelDeleteBlock}
        onConfirm={confirmDeleteBlock}
      />
    </section>
  );
};

export default RecurringBlocks;
