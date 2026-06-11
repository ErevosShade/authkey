export type Screen  = "main" | "schedule";
export type Repeat  = "never" | "daily" | "weekdays" | "weekends" | "custom";

export type Schedule = {
  id:        string;
  host:      string;
  startTime: string;
  endTime:   string;
  repeat:    Repeat;
  days:      number[];
  active:    boolean;
};

export const DAYS_SHORT  = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
export const ENTRY_H     = 32;   // px — one protected-site row height
export const ENTRY_GAP   = 4;    // px — gap between rows
export const MAX_VISIBLE = 3;    // rows before scroll kicks in

export function listHeight(count: number): number {
  const n = Math.min(Math.max(count, 1), MAX_VISIBLE);
  return n * ENTRY_H + Math.max(n - 1, 0) * ENTRY_GAP;
}
