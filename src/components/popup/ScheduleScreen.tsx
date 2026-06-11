import { BackIcon, PlusIcon, TrashIcon, ClockIcon } from "../shared/icons";
import type { Schedule, Repeat } from "./types";
import { DAYS_SHORT } from "./types";

type Props = {
  schedules:        Schedule[];
  schHost:          string;
  schStart:         string;
  schEnd:           string;
  schRepeat:        Repeat;
  schDays:          number[];
  schStatus:        string;
  onBack:           () => void;
  onHostChange:     (v: string) => void;
  onStartChange:    (v: string) => void;
  onEndChange:      (v: string) => void;
  onRepeatChange:   (r: Repeat) => void;
  onToggleDay:      (d: number) => void;
  onCreate:         () => void;
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
};

export const ScheduleScreen = ({
  schedules, schHost, schStart, schEnd, schRepeat, schDays, schStatus,
  onBack, onHostChange, onStartChange, onEndChange,
  onRepeatChange, onToggleDay, onCreate, onToggleSchedule, onDeleteSchedule,
}: Props) => {
  const pillClass = (on: boolean) =>
    on
      ? "bg-ak-accent-dim/40 border border-ak-accent-border/50 text-ak-accent opacity-90"
      : "bg-transparent border border-ak-border/40 text-text-muted opacity-70 hover:bg-surface-deep";

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-ak-border/50 text-text-muted bg-transparent cursor-pointer transition-all hover:bg-surface-deep hover:opacity-80"
        >
          <BackIcon color="currentColor" />
        </button>
        <span className="font-mono uppercase text-xs tracking-widest text-text-muted opacity-80">
          Schedule Lock
        </span>
      </div>

      <div className="relative rounded-sm overflow-hidden p-5 bg-ak-surface border border-black/20 dark:border-white/20   shadow-sm flex-shrink-0">
        <div className="absolute top-0 left-0 bottom-0 w-1 opacity-40 bg-green" />

        <span className="font-mono uppercase block text-xs tracking-widest text-text-muted mb-4 opacity-80">
          New schedule
        </span>

        <div className="mb-4">
          <label className="font-mono uppercase block text-xs tracking-wider text-text-muted mb-2 opacity-80">
            Website
          </label>
          <input
            className="w-full rounded-lg font-mono outline-none transition-colors text-sm tracking-wide px-4 py-3 bg-input-bg/50 border border-ak-border/50 text-text-sub focus:border-ak-accent/50"
            placeholder="e.g. twitter.com"
            value={schHost}
            onChange={e => onHostChange(e.target.value)}
          />
        </div>

        <div className="flex gap-4 mb-4">
          {([["Start", schStart, onStartChange], ["End", schEnd, onEndChange]] as [string, string, (v: string) => void][])
            .map(([lbl, val, fn]) => (
              <div key={lbl} className="flex flex-col flex-1">
                <label className="font-mono uppercase block text-xs tracking-wider text-text-muted mb-2 opacity-80">
                  {lbl}
                </label>
                <input
                  type="time"
                  value={val}
                  onChange={e => fn(e.target.value)}
                  className="w-full rounded-lg font-mono outline-none text-sm px-4 py-3 bg-input-bg/50 border border-ak-border/50 text-text-sub focus:border-ak-accent/50"
                />
              </div>
            ))
          }
        </div>

        <div className="mb-4">
          <label className="font-mono uppercase block text-xs tracking-wider text-text-muted mb-2 opacity-80">
            Repeat
          </label>
          <div className="flex flex-wrap gap-2">
            {(["never", "daily", "weekdays", "weekends", "custom"] as Repeat[]).map(r => (
              <button
                key={r}
                onClick={() => onRepeatChange(r)}
                className={`font-mono font-bold uppercase rounded-lg cursor-pointer transition-all text-xs tracking-wider px-4 py-2.5 ${pillClass(schRepeat === r)}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="font-mono uppercase block text-xs tracking-wider text-text-muted mb-2 opacity-80">
            Days
          </label>
          <div className="flex gap-2">
            {DAYS_SHORT.map((d, i) => (
              <button
                key={i}
                onClick={() => onToggleDay(i)}
                className={`flex items-center justify-center font-mono font-bold uppercase cursor-pointer transition-all text-xs tracking-wide w-10 h-10 rounded-lg ${pillClass(schDays.includes(i))}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onCreate}
          className="relative w-full flex items-center justify-center gap-3 rounded-lg font-mono font-bold uppercase overflow-hidden cursor-pointer transition-opacity hover:opacity-90 text-sm tracking-widest p-4 bg-btn-bg border border-btn-border/50 text-text shadow-sm"
        >
          <span className="absolute top-0 left-0 bottom-0 w-1 bg-ak-accent opacity-80" />
          <PlusIcon color="currentColor" /> Create Schedule
        </button>

        {schStatus && (
          <p className="font-mono text-center text-xs tracking-wide text-text-muted mt-3 opacity-80">
            {schStatus}
          </p>
        )}
      </div>

      {schedules.length > 0 && (
        <div className="relative flex flex-col flex-1 rounded-sm overflow-hidden p-5 bg-ak-surface border border-ak-border/50 shadow-sm min-h-0">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-border/40" />
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono uppercase text-xs tracking-widest text-text-muted opacity-80">Active schedules</span>
            <span className="font-mono text-xs tracking-wider text-text-dim opacity-70">{schedules.length}</span>
          </div>
          <div
            className="flex flex-col overflow-y-auto gap-3 pr-2"
            style={{ scrollbarWidth: "thin", scrollbarColor: "var(--c-border) transparent" }}
          >
            {schedules.map(s => (
              <div key={s.id} className="flex items-center gap-4 rounded-lg px-4 py-3 bg-ak-surface-deep border border-ak-border/40 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="font-mono truncate text-sm mb-1 text-text-sub opacity-90">{s.host}</div>
                  <div className="flex items-center gap-2 font-mono text-xs tracking-wide text-text-muted opacity-70">
                    <ClockIcon color="currentColor" className="w-3.5 h-3.5" /> {s.startTime} → {s.endTime} · {s.repeat}
                  </div>
                </div>

                <div
                  role="button"
                  aria-label="Toggle schedule"
                  onClick={() => onToggleSchedule(s.id)}
                  className="relative flex-shrink-0 rounded-full cursor-pointer transition-all w-10 h-6"
                  style={{
                    border:     `1px solid ${s.active ? "var(--c-green-border)" : "var(--c-border)"}`,
                    background:  s.active ? "var(--c-green)" : "transparent",
                    opacity:     0.9,
                  }}
                >
                  <div
                    className="absolute rounded-full transition-all w-4 h-4 top-[3px]"
                    style={{ left: s.active ? 20 : 3, background: s.active ? "#fff" : "var(--c-text-muted)" }}
                  />
                </div>

                <button
                  onClick={() => onDeleteSchedule(s.id)}
                  aria-label="Delete schedule"
                  className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-transparent border border-ak-border/50 text-text-muted cursor-pointer transition-all hover:bg-surface-deep hover:opacity-80"
                >
                  <TrashIcon color="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};