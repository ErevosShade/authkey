import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { registerUser } from "@/webAuthn";
import {
  MESSAGE_TYPES,
  type GetLockStateResponse,
  type GetLockedSitesResponse,
  type LockedSiteSummary,
} from "@/messages";
import "@/index.css";

import { DYNAMIC, type Theme } from "../../components/shared/tokens";
import { Sun, Moon } from "../../components/shared/icons";
import { SetupScreen } from "../../components/popup/SetupScreen";
import { MainScreen } from "../../components/popup/MainScreen";
import { ScheduleScreen } from "../../components/popup/ScheduleScreen";
import type { Screen, Repeat, Schedule } from "../../components/popup/types";

const sendMessage = <T,>(msg: unknown): Promise<T> =>
  new Promise((resolve, reject) =>
    chrome.runtime.sendMessage(msg, (res) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(res as T);
    }),
  );

function Popup() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [screen, setScreen] = useState<Screen>("main");
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [activeHost, setActiveHost] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [lockState, setLockState] = useState<GetLockStateResponse | null>(null);
  const [lockedSites, setLockedSites] = useState<LockedSiteSummary[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schHost, setSchHost] = useState("");
  const [schStart, setSchStart] = useState("09:00");
  const [schEnd, setSchEnd] = useState("17:00");
  const [schRepeat, setSchRepeat] = useState<Repeat>("daily");
  const [schDays, setSchDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [schStatus, setSchStatus] = useState("");

  const dyn = DYNAMIC[theme];
  const dk = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dk);
  }, [dk]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? "";
      const host = url ? new URL(url).hostname : "";
      setActiveUrl(url);
      setActiveHost(host);
      setSchHost(host);
    });
    chrome.storage.local.get("authkey_user", (r) => {
      const p = r.authkey_user as { userId?: string } | undefined;
      if (p?.userId) {
        setIsRegistered(true);
        setUserId(p.userId);
      }
    });
    chrome.storage.local.get("authkey_theme", (r) => {
      if (r.authkey_theme === "light") setTheme("light");
    });
    chrome.storage.local.get("authkey_schedules", (r) => {
      if (Array.isArray(r.authkey_schedules)) setSchedules(r.authkey_schedules);
    });
  }, []);

  const refreshLockState = useCallback(async () => {
    if (!activeHost) return;
    const r = await sendMessage<GetLockStateResponse>({
      type: MESSAGE_TYPES.GET_LOCK_STATE,
      host: activeHost,
      url: activeUrl,
    });
    setLockState(r);
  }, [activeHost, activeUrl]);

  const refreshLockedSites = useCallback(async () => {
    const r = await sendMessage<GetLockedSitesResponse>({
      type: MESSAGE_TYPES.GET_LOCKED_SITES,
    });
    setLockedSites(r.sites.filter((s) => s.isLocked));
  }, []);

  useEffect(() => {
    void refreshLockState();
    void refreshLockedSites();
  }, [refreshLockState, refreshLockedSites]);

  const handleRegister = async () => {
    setStatus("");
    if (!userId.trim()) {
      setStatus("// username required");
      return;
    }
    const r = await registerUser(userId.trim());
    setStatus(r.message);
    if (r.success) setIsRegistered(true);
  };

  const handleToggleLock = async () => {
    if (!activeHost) {
      setStatus("// no active tab");
      return;
    }
    await sendMessage({
      type: MESSAGE_TYPES.SET_LOCK_STATE,
      host: activeHost,
      url: activeUrl,
      isLocked: !lockState?.isLocked,
    });
    await refreshLockState();
    await refreshLockedSites();
  };

  const handleRepeatChange = (r: Repeat) => {
    setSchRepeat(r);
    if (r === "daily") setSchDays([0, 1, 2, 3, 4, 5, 6]);
    if (r === "weekdays") setSchDays([1, 2, 3, 4, 5]);
    if (r === "weekends") setSchDays([0, 6]);
    if (r === "never") setSchDays([]);
  };

  const saveSchedules = (next: Schedule[]) => {
    setSchedules(next);
    chrome.storage.local.set({ authkey_schedules: next });
  };

  const toggleTheme = () => {
    const next: Theme = dk ? "light" : "dark";
    setTheme(next);
    chrome.storage.local.set({ authkey_theme: next });
  };

  return (
    <div className="relative w-[500px] h-[600px] overflow-hidden bg-bg text-text text-base font-[Space_Grotesk,sans-serif]">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
        style={{
          backgroundImage: `linear-gradient(${dyn.grid} 1px, transparent 1px), linear-gradient(90deg, ${dyn.grid} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col px-8 pt-6 pb-5 h-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5 font-mono font-bold text-lg text-text">
            AuthKey
            <span
              className="rounded-full flex-shrink-0 w-2.5 h-2.5 bg-ak-accent opacity-80"
              style={{ boxShadow: dk ? `0 0 12px ${dyn.accentHex}66` : "none" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-[0.12em] px-2 py-1 rounded text-text-muted">
              v1.0
            </span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center justify-center w-8 h-8 rounded  text-text-muted bg-transparent cursor-pointer transition-opacity hover:opacity-70"
            >
              {dk ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>

        <div className="relative mb-6 opacity-70">
          <div className="h-px bg-ak-border/60" />
          <div className="absolute top-0 left-0 h-px w-10 bg-ak-accent" />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {!isRegistered ? (
            <SetupScreen
              userId={userId}
              status={status}
              onUserIdChange={setUserId}
              onRegister={handleRegister}
            />
          ) : screen === "main" ? (
            <MainScreen
              dyn={dyn}
              dk={dk}
              userId={userId}
              status={status}
              activeHost={activeHost}
              lockState={lockState}
              lockedSites={lockedSites}
              activeScheduleCount={schedules.filter((s) => s.active).length}
              onToggleLock={handleToggleLock}
              onGoToSchedule={() => setScreen("schedule")}
            />
          ) : (
            <ScheduleScreen
              schedules={schedules}
              schHost={schHost}
              schStart={schStart}
              schEnd={schEnd}
              schRepeat={schRepeat}
              schDays={schDays}
              schStatus={schStatus}
              onBack={() => {
                setScreen("main");
                setSchStatus("");
              }}
              onHostChange={setSchHost}
              onStartChange={setSchStart}
              onEndChange={setSchEnd}
              onRepeatChange={handleRepeatChange}
              onToggleDay={(d) => {
                setSchDays((prev) =>
                  prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
                );
                setSchRepeat("custom");
              }}
              onCreate={handleCreateSchedule}
              onToggleSchedule={(id) =>
                saveSchedules(
                  schedules.map((s) =>
                    s.id === id ? { ...s, active: !s.active } : s,
                  ),
                )
              }
              onDeleteSchedule={(id) =>
                saveSchedules(schedules.filter((s) => s.id !== id))
              }
            />
          )}
        </div>
      </div>
    </div>
  );

  async function handleCreateSchedule() {
    setSchStatus("");
    if (!schHost.trim()) {
      setSchStatus("// host required");
      return;
    }
    if (!schStart || !schEnd) {
      setSchStatus("// set both times");
      return;
    }
    if (schStart >= schEnd) {
      setSchStatus("// end must be after start");
      return;
    }
    saveSchedules([
      ...schedules,
      {
        id: `sch_${Date.now()}`,
        host: schHost.trim(),
        startTime: schStart,
        endTime: schEnd,
        repeat: schRepeat,
        days: schDays,
        active: true,
      },
    ]);
    setSchStatus("// schedule created");
    setSchHost(activeHost);
  }
}

createRoot(document.getElementById("root")!).render(<Popup />);
export default Popup;