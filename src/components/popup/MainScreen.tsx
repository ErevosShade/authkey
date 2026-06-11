import type { DynamicTokens } from "../shared/tokens";
import type { GetLockStateResponse, LockedSiteSummary } from "@/messages";
import { GlobeIcon, LockIcon, UnlockIcon, GearIcon, ClockIcon } from "../shared/icons";

type Props = {
  dyn:                 DynamicTokens;
  dk:                  boolean;
  userId:              string;
  status:              string;
  activeHost:          string;
  lockState:           GetLockStateResponse | null;
  lockedSites:         LockedSiteSummary[];
  activeScheduleCount: number;
  onToggleLock:        () => void;
  onGoToSchedule:      () => void;
};

export const MainScreen = ({
  dyn, dk, userId, status, activeHost, lockState,
  lockedSites, activeScheduleCount, onToggleLock, onGoToSchedule,
}: Props) => {
  const ls = (() => {
    if (!lockState?.isLocked) return { label: "UNLOCKED",    type: "neutral" } as const;
    if (lockState.isUnlocked) return { label: "TEMP·UNLOCK", type: "amber"   } as const;
    return                           { label: "LOCKED",      type: "red"     } as const;
  })();

  const ledStyle =
    ls.type === "red"   ? { background: `var(--c-accent)`, boxShadow: dk ? `0 0 12px ${dyn.accentHex}44` : "none" } :
    ls.type === "amber" ? { background: `var(--c-amber)`,  boxShadow: dk ? `0 0 12px ${dyn.amberHex}44`  : "none" } :
                          { background: `var(--c-led-neutral)`, opacity: 0.6 };

  const ledColorClass =
    ls.type === "red"   ? "text-ak-accent opacity-90" :
    ls.type === "amber" ? "text-amber opacity-90"  : "text-text-muted opacity-70";

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-6">
        <button className="flex items-center gap-2 rounded font-mono font-bold uppercase cursor-pointer text-xs tracking-wider px-4 py-2.5 bg-ak-accent-dim/40 border border-ak-accent-border/50 text-ak-accent transition-opacity hover:opacity-80">
          <LockIcon color="currentColor" /> Sites
        </button>
        <button
          onClick={onGoToSchedule}
          className="flex items-center gap-2 rounded font-mono font-bold uppercase cursor-pointer transition-all text-xs tracking-wider px-4 py-2.5 bg-transparent border border-border/50 text-text-muted hover:bg-surface-deep"
        >
          <ClockIcon color="currentColor" /> Schedule
          {activeScheduleCount > 0 && (
            <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-ak-accent/80 text-white">
              {activeScheduleCount}
            </span>
          )}
        </button>
      </div>

 <div className="relative rounded-sm overflow-hidden p-3 mb-4 bg-surface border border-border/50 shadow-sm">
  <div
    className="absolute top-0 left-0 bottom-0 w-1"
    style={{
      background: ls.type === "red" ? `var(--c-accent)` : `var(--c-border)`,
      opacity: ls.type === "red" ? (dk ? 0.4 : 0.3) : 0.5,
    }}
  />
  <span className="font-mono uppercase block text-[10px] tracking-widest text-text-muted mb-2 opacity-80">
    Active site
  </span>
  <div className="flex items-center gap-3 mb-3">
    <div className="flex items-center justify-center flex-shrink-0 rounded-md w-[25px] h-[25px] bg-site-ico-bg border border-border/50">
      <GlobeIcon color="currentColor" className="text-icon opacity-80 w-4 h-4" />
    </div>
    <span className={`font-mono flex-1 truncate text-sm tracking-wide ${activeHost ? "text-text-sub" : "text-text-muted opacity-70"}`}>
      {activeHost || "no active tab"}
    </span>
  </div>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="rounded-full flex-shrink-0 w-2.5 h-2.5 ml-2" style={ledStyle} />
      <span className={`font-mono uppercase text-[10px] tracking-wider ${ledColorClass}`}>
        {ls.label}
      </span>
    </div>
    <button
      onClick={onToggleLock}
      className={`flex items-center gap-1.5 rounded font-mono font-bold uppercase cursor-pointer transition-all text-[10px] tracking-wider px-3 py-1.5 ${
        lockState?.isLocked
          ? "bg-ak-accent-dim/40 border border-ak-accent-border/50 text-ak-accent hover:opacity-80"
          : "bg-transparent border border-border/50 text-text-muted hover:bg-surface-deep"
      }`}
    >
      {lockState?.isLocked
        ? <><UnlockIcon color="currentColor" className="w-3 h-3" /> Remove</>
        : <><LockIcon   color="currentColor" className="w-3 h-3" /> Lock</>
      }
    </button>
  </div>
</div>

      <div className="relative flex flex-col flex-1 rounded-sm overflow-hidden p-5 mb-4 bg-surface border border-border/50 shadow-sm">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-border/40" />
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono uppercase text-xs tracking-widest text-text-muted opacity-80">Protected</span>
          <span className="font-mono text-xs tracking-wider text-text-dim opacity-70">
            {lockedSites.length} site{lockedSites.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div
          className="flex flex-col overflow-y-auto max-h-56 pr-2 gap-3"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--c-border) transparent",
          }}
        >
          {lockedSites.length === 0 ? (
            <p className="font-mono text-center text-xs tracking-wide py-4 text-text-dim opacity-60">
              // no protected sites
            </p>
          ) : lockedSites.map(site => (
            <div
              key={site.host}
              className="flex items-center justify-between flex-shrink-0 rounded-lg px-4 py-3 bg-surface-deep border border-border/40"
            >
              <span className="font-mono text-sm tracking-wide text-text-sub opacity-90">{site.host}</span>
              <span className="font-mono uppercase text-[10px] tracking-wider px-2 py-1 rounded bg-tag-bg/50 border border-ak-accent-border/40 text-ak-accent opacity-80">
                locked
              </span>
            </div>
          ))}
        </div>
      </div>

      {status && (
        <p className="font-mono text-center text-xs tracking-wide text-text-muted mb-4 opacity-80">{status}</p>
      )}

      <div className="relative flex items-center gap-4 rounded-sm overflow-hidden px-4 py-3 bg-surface border border-border/50 shadow-sm mt-auto">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-border/40" />
        <div className="flex items-center justify-center rounded-full flex-shrink-0 w-10 h-10 font-mono font-bold uppercase text-sm bg-ak-accent-dim/40 border border-ak-accent-border/50 text-ak-accent opacity-90">
          {userId ? userId.slice(0, 2) : "AK"}
        </div>
        <span className="font-mono flex-1 truncate text-sm tracking-wide text-text-sub opacity-90">
          {userId || "user"}
        </span>
        <button
          onClick={() => chrome.runtime.openOptionsPage?.()}
          aria-label="Open settings"
          className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-transparent border border-border/50 text-text-muted cursor-pointer transition-all hover:bg-surface-deep"
        >
          <GearIcon color="currentColor" className="opacity-80" />
        </button>
      </div>
    </div>
  );
};