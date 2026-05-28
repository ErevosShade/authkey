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

type UserProfile = {
  userId: string;
};

type Theme = "dark" | "light";
type Screen = "main" | "schedule";
type Repeat = "never" | "daily" | "weekdays" | "weekends" | "custom";
type Schedule = {
  id: string;
  host: string;
  startTime: string;
  endTime: string;
  repeat: Repeat;
  days: number[];
  active: boolean;
};

const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const sendMessage = <T,>(message: unknown): Promise<T> =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) { reject(error); return; }
      resolve(response as T);
    });
  });

/* ─── Design tokens ─── */
const T = {
  dark: {
    bg: "#0d0d10", surface: "#111116", surfaceDeep: "#0a0a0e",
    border: "#1e1e24", borderStrong: "#2a2a32",
    text: "#f0eeeb", textSub: "#d0cec8", textMuted: "#30303a", textDim: "#28282e",
    accent: "#ff4040", accentDim: "#1a0c0c", accentBorder: "#ff404040",
    amber: "#f0a500", amberDim: "#f0a50018",
    green: "#3ecf60", greenDim: "#0d2016", greenBorder: "#3ecf6040",
    grid: "#ffffff09",
    inputBg: "#0a0a0e", btnBg: "#141418", btnBorder: "#252528",
    ledNeutral: "#252530", tagBg: "#150a0a",
    iconColor: "#303038", siteIcoBg: "#0d0d10",
  },
  light: {
    bg: "#f6f5f1", surface: "#eeede8", surfaceDeep: "#e6e5e0",
    border: "#dddbd4", borderStrong: "#cac8c2",
    text: "#18181a", textSub: "#1e1e22", textMuted: "#6a6860", textDim: "#8a8880",
    accent: "#d63030", accentDim: "#faeaea", accentBorder: "#d6303040",
    amber: "#c47e00", amberDim: "#c47e0018",
    green: "#1e9e40", greenDim: "#eaf7ee", greenBorder: "#1e9e4040",
    grid: "#00000008",
    inputBg: "#eae9e4", btnBg: "#e8e7e2", btnBorder: "#cac8c2",
    ledNeutral: "#c8c6c0", tagBg: "#faeaea",
    iconColor: "#c0beb8", siteIcoBg: "#e4e3de",
  },
} as const;

/* Shield with fingerprint icon, used in header and empty state */
const ShieldFP = ({ theme }: { theme: Theme }) => {
  const d = theme === "dark";
  return (
    <svg width="52" height="52" viewBox="0 0 72 72" fill="none">
      <path d="M36 6L10 16v20c0 17 11.2 32.8 26 36 14.8-3.2 26-19 26-36V16L36 6z"
        stroke={d ? "#252530" : "#c8c6c0"} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M36 12L16 20v16c0 13.4 8.8 25.8 20 28.4C47.2 61.8 56 49.4 56 36V20L36 12z"
        fill={d ? "#0f0f14" : "#e8e7e2"} stroke={d ? "#1e1e28" : "#d4d2cc"} strokeWidth="1" />
      <path d="M36 28c-4.42 0-8 3.58-8 8" stroke={d ? "#484858" : "#b0aeb0"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 32c-2.21 0-4 1.79-4 4" stroke={d ? "#585868" : "#a0a0a0"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 28c4.42 0 8 3.58 8 8" stroke={d ? "#484858" : "#b0aeb0"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 32c2.21 0 4 1.79 4 4" stroke={d ? "#585868" : "#a0a0a0"} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="36" y1="36" x2="36" y2="46" stroke={d ? "#484858" : "#b0aeb0"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M31 41c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke={d ? "#505060" : "#b0aeb0"} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="36" cy="36" r="1.8" fill={d ? "#606070" : "#a8a8a8"} />
    </svg>
  );
};

/* ─── Icons ─── */
const Ico = {
  Sun: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  Moon: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  Globe: ({ c }: { c: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  Lock: ({ c }: { c: string }) => <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Unlock: ({ c }: { c: string }) => <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>,
  Shield: ({ c }: { c: string }) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Gear: ({ c }: { c: string }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  Clock: ({ c }: { c: string }) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Trash: ({ c }: { c: string }) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  Back: ({ c }: { c: string }) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>,
  Plus: ({ c }: { c: string }) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
};

const ENTRY_H = 32;   // px — height of one site row
const ENTRY_GAP = 4;   // px — gap between rows
const MAX_VISIBLE = 3;

function listHeight(count: number): number {
  const visible = Math.min(Math.max(count, 1), MAX_VISIBLE);
  return visible * ENTRY_H + Math.max(visible - 1, 0) * ENTRY_GAP;
}

function Popup() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [screen, setScreen] = useState<Screen>("main");
  const [activeHost, setActiveHost] = useState<string>("");
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [lockState, setLockState] = useState<GetLockStateResponse | null>(null);
  const [lockedSites, setLockedSites] = useState<LockedSiteSummary[]>([]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schHost, setSchHost] = useState("");
  const [schStart, setSchStart] = useState("09:00");
  const [schEnd, setSchEnd] = useState("17:00");
  const [schRepeat, setSchRepeat] = useState<Repeat>("daily");
  const [schDays, setSchDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [schStatus, setSchStatus] = useState("");

  const tk = T[theme];
  const dk = theme === "dark";

  const loadActiveTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = tab?.url ?? "";
      const host = url ? new URL(url).hostname : "";
      setActiveUrl(url);
      setActiveHost(host);
      setSchHost(host);
    });
  };

  const loadUserProfile = () => {
    chrome.storage.local.get("authkey_user", (result) => {
      const profile = result.authkey_user as UserProfile | undefined;
      if (profile?.userId) {
        setIsRegistered(true);
        setUserId(profile.userId);
      } else {
        setIsRegistered(false);
      }
    });
  };

  const loadTheme = () => {
    chrome.storage.local.get("authkey_theme", (r) => {
      if (r.authkey_theme === "light") setTheme("light");
    });
  };

  const loadSchedules = () => {
    chrome.storage.local.get("authkey_schedules", (r) => {
      if (Array.isArray(r.authkey_schedules)) setSchedules(r.authkey_schedules);
    });
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


   const refreshLockState = useCallback(async () => {
    if (!activeHost) return;
    const r = await sendMessage<GetLockStateResponse>({ type: MESSAGE_TYPES.GET_LOCK_STATE, host: activeHost, url: activeUrl });
    setLockState(r);
  }, [activeHost, activeUrl]);

  const refreshLockedSites = useCallback(async () => {
    const r = await sendMessage<GetLockedSitesResponse>({ type: MESSAGE_TYPES.GET_LOCKED_SITES });
    setLockedSites(r.sites.filter(s => s.isLocked));
  }, []);

  useEffect(() => {
    loadActiveTab();
    loadUserProfile();
    loadTheme();
    loadSchedules();
  }, []);

  useEffect(() => {
    void refreshLockState();
    void refreshLockedSites();
  }, [refreshLockState, refreshLockedSites]);

  const handleRegister = async () => {
    setStatus("");
    if (!userId.trim()) { setStatus("// username required"); return; }
    const r = await registerUser(userId.trim());
    setStatus(r.message);
    if (r.success) setIsRegistered(true);
  };

  const handleToggleLock = async () => {
    if (!activeHost) { setStatus("// no active tab"); return; }
    const next = !lockState?.isLocked;
    await sendMessage({ type: MESSAGE_TYPES.SET_LOCK_STATE, host: activeHost, url: activeUrl, isLocked: next });
    await refreshLockState(); await refreshLockedSites();
  };

  const handleRepeatChange = (r: Repeat) => {
    setSchRepeat(r);
    if (r === "daily") setSchDays([0, 1, 2, 3, 4, 5, 6]);
    if (r === "weekdays") setSchDays([1, 2, 3, 4, 5]);
    if (r === "weekends") setSchDays([0, 6]);
    if (r === "never") setSchDays([]);
  };

  const toggleDay = (d: number) => {
    setSchDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    setSchRepeat("custom");
  };

  const handleCreateSchedule = () => {
    setSchStatus("");
    if (!schHost.trim()) { setSchStatus("// host required"); return; }
    if (!schStart || !schEnd) { setSchStatus("// set both times"); return; }
    if (schStart >= schEnd) { setSchStatus("// end must be after start"); return; }
    const s: Schedule = {
      id: `sch_${Date.now()}`,
      host: schHost.trim(),
      startTime: schStart,
      endTime: schEnd,
      repeat: schRepeat,
      days: schDays,
      active: true,
    };
    saveSchedules([...schedules, s]);
    setSchStatus("// schedule created");
    setSchHost(activeHost);
  };

  const deleteSchedule = (id: string) => saveSchedules(schedules.filter(s => s.id !== id));
  const toggleSchedule = (id: string) =>
    saveSchedules(schedules.map(s => s.id === id ? { ...s, active: !s.active } : s));
  const ls = (() => {
    if (!lockState?.isLocked) return { label: "UNLOCKED", type: "neutral" } as const;
    if (lockState.isUnlocked) return { label: "TEMP·UNLOCK", type: "amber" } as const;
    return { label: "LOCKED", type: "red" } as const;
  })();

  const ledStyle = ls.type === "red"
    ? { background: tk.accent, boxShadow: dk ? `0 0 6px ${tk.accent}88` : "none" }
    : ls.type === "amber"
      ? { background: tk.amber, boxShadow: dk ? `0 0 6px ${tk.amber}88` : "none" }
      : { background: tk.ledNeutral };
  const ledColor = ls.type === "red" ? tk.accent : ls.type === "amber" ? tk.amber : tk.textMuted;

  const protectedListH = listHeight(lockedSites.length);



  const activeSchedules = schedules.filter(s => s.active);

  /* ════════════════ CSS ════════════════ */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
    html,body,#root{width:320px;overflow:hidden;margin:0;padding:0;}
    *{box-sizing:border-box;margin:0;padding:0;}

    .ak{position:relative;width:320px;background:${tk.bg};font-family:'Space Grotesk',sans-serif;color:${tk.text};overflow:hidden;}
    .ak-grid{position:absolute;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(${tk.grid} 1px,transparent 1px),linear-gradient(90deg,${tk.grid} 1px,transparent 1px);background-size:24px 24px;}
    .ak-body{position:relative;z-index:1;padding:16px 18px 14px;display:flex;flex-direction:column;}

    /* header */
    .ak-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
    .ak-wm{font-family:'Space Mono',monospace;font-weight:700;font-size:15px;display:flex;align-items:center;gap:5px;color:${tk.text};}
    .ak-wm-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${tk.accent};${dk ? `box-shadow:0 0 8px ${tk.accent}88;` : ""}}
    .ak-hdr-r{display:flex;align-items:center;gap:5px;}
    .ak-ver{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:0.12em;padding:2px 6px;border-radius:3px;border:1px solid ${tk.border};color:${tk.textMuted};}
    .ak-tgl{width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid ${tk.border};cursor:pointer;color:${tk.textMuted};transition:all 0.12s;}
    .ak-tgl:hover{border-color:${tk.borderStrong};color:${tk.text};}

    .ak-div{position:relative;margin-bottom:16px;}
    .ak-div-line{height:1px;background:${tk.border};}
    .ak-div-acc{position:absolute;left:0;top:0;height:1px;width:28px;background:${tk.accent};}

    /* nav tabs */
    .ak-tabs{display:flex;gap:4px;margin-bottom:14px;}
    .ak-tab{font-family:'Space Mono',monospace;font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:5px 10px;border-radius:4px;border:1px solid;cursor:pointer;transition:all 0.12s;display:flex;align-items:center;gap:5px;}
    .ak-tab-active{background:${tk.accentDim};border-color:${tk.accentBorder};color:${tk.accent};}
    .ak-tab-inactive{background:transparent;border-color:${tk.border};color:${tk.textMuted};}
    .ak-tab-inactive:hover{border-color:${tk.borderStrong};color:${tk.textSub};}

    /* cards */
    .ak-card{background:${tk.surface};border:1px solid ${tk.border};border-radius:7px;padding:12px;position:relative;overflow:hidden;margin-bottom:8px;}
    .ak-card-bar{position:absolute;left:0;top:0;bottom:0;width:2px;border-radius:0;}
    .ak-card-bar-n{background:${tk.border};}
    .ak-card-bar-r{background:${tk.accent};opacity:${dk ? .5 : .4};}
    .ak-card-bar-g{background:${tk.green};opacity:${dk ? .5 : .4};}
    .ak-clbl{font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.2em;text-transform:uppercase;color:${tk.textMuted};display:block;margin-bottom:9px;}

    /* main screen */
    .ak-main{display:flex;flex-direction:column;}
    .ak-site-row{display:flex;align-items:center;gap:8px;margin-bottom:9px;}
    .ak-site-ico{width:26px;height:26px;background:${tk.siteIcoBg};border:1px solid ${tk.border};border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .ak-hostname{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.02em;color:${tk.textSub};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ak-hostname-empty{color:${tk.textMuted}!important;}
    .ak-srow{display:flex;align-items:center;justify-content:space-between;}
    .ak-led-row{display:flex;align-items:center;gap:6px;}
    .ak-led{width:5px;height:5px;border-radius:50%;flex-shrink:0;transition:all .2s;}
    .ak-led-lbl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;}
    .ak-lock-btn{font-family:'Space Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:5px 10px;border-radius:3px;display:flex;align-items:center;gap:4px;border:1px solid;cursor:pointer;transition:all .12s;}
    .ak-lock-btn-on{background:${tk.accentDim};border-color:${tk.accentBorder};color:${tk.accent};}
    .ak-lock-btn-on:hover{border-color:${tk.accent};}
    .ak-lock-btn-off{background:transparent;border-color:${tk.border};color:${tk.textMuted};}
    .ak-lock-btn-off:hover{border-color:${tk.borderStrong};color:${tk.text};}
    .ak-sites-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
    .ak-sites-cnt{font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.12em;color:${tk.textDim};}

    /* protected list — height driven by JS (1→3 rows), overflow scrolls */
    .ak-sites-list{display:flex;flex-direction:column;gap:${ENTRY_GAP}px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:${tk.border} transparent;transition:height 0.18s ease;}
    .ak-site-entry{display:flex;align-items:center;justify-content:space-between;padding:0 9px;background:${tk.surfaceDeep};border:1px solid ${tk.border};border-radius:4px;height:${ENTRY_H}px;flex-shrink:0;transition:border-color .1s;}
    .ak-site-entry:hover{border-color:${tk.borderStrong};}
    .ak-site-host{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.02em;color:${tk.textSub};}
    .ak-site-tag{font-family:'Space Mono',monospace;font-size:7px;letter-spacing:0.1em;text-transform:uppercase;color:${tk.accent};background:${tk.tagBg};border:1px solid ${tk.accentBorder};border-radius:2px;padding:2px 6px;}
    .ak-empty{font-family:'Space Mono',monospace;font-size:9px;color:${tk.textDim};text-align:center;padding:8px 0;letter-spacing:0.08em;}

    /* account bar — always last, no gap above */
    .ak-acct{display:flex;align-items:center;gap:9px;padding:9px 10px;background:${tk.surface};border:1px solid ${tk.border};border-radius:7px;position:relative;overflow:hidden;}
    .ak-acct::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:${tk.border};}
    .ak-avatar{width:26px;height:26px;border-radius:50%;flex-shrink:0;background:${tk.accentDim};border:1px solid ${tk.accentBorder};display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-size:9px;font-weight:700;color:${tk.accent};text-transform:uppercase;letter-spacing:0;}
    .ak-uname{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.04em;color:${tk.textSub};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ak-gear{width:26px;height:26px;border-radius:4px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid ${tk.border};cursor:pointer;color:${tk.textMuted};flex-shrink:0;transition:all .12s;}
    .ak-gear:hover{border-color:${tk.borderStrong};color:${tk.text};}

    /* schedule screen */
    .ak-sch{display:flex;flex-direction:column;gap:8px;}
    .ak-field-lbl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:0.16em;text-transform:uppercase;color:${tk.textMuted};display:block;margin-bottom:5px;}
    .ak-input{width:100%;background:${tk.inputBg};border:1px solid ${tk.border};border-radius:5px;padding:9px 11px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.03em;color:${tk.textSub};outline:none;transition:border-color .15s;}
    .ak-input::placeholder{color:${tk.textMuted};}
    .ak-input:focus{border-color:${tk.borderStrong};}
    .ak-input-time{width:100%;background:${tk.inputBg};border:1px solid ${tk.border};border-radius:5px;padding:8px 10px;font-family:'Space Mono',monospace;font-size:11px;color:${tk.textSub};outline:none;transition:border-color .15s;-webkit-appearance:none;}
    .ak-input-time:focus{border-color:${tk.borderStrong};}
    .ak-time-row{display:flex;gap:8px;}
    .ak-time-group{flex:1;display:flex;flex-direction:column;}
    .ak-repeat-row{display:flex;gap:4px;flex-wrap:wrap;}
    .ak-repeat-pill{font-family:'Space Mono',monospace;font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:5px 9px;border-radius:3px;border:1px solid;cursor:pointer;transition:all .12s;}
    .ak-repeat-pill-on{background:${tk.accentDim};border-color:${tk.accentBorder};color:${tk.accent};}
    .ak-repeat-pill-off{background:transparent;border-color:${tk.border};color:${tk.textMuted};}
    .ak-repeat-pill-off:hover{border-color:${tk.borderStrong};color:${tk.textSub};}
    .ak-days-row{display:flex;gap:4px;}
    .ak-day{width:30px;height:26px;border-radius:3px;border:1px solid;cursor:pointer;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;transition:all .12s;}
    .ak-day-on{background:${tk.accentDim};border-color:${tk.accentBorder};color:${tk.accent};}
    .ak-day-off{background:transparent;border-color:${tk.border};color:${tk.textMuted};}
    .ak-day-off:hover{border-color:${tk.borderStrong};}
    .ak-cta{width:100%;background:${tk.btnBg};border:1px solid ${tk.btnBorder};border-radius:5px;padding:10px;font-family:'Space Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${tk.text};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;position:relative;overflow:hidden;transition:all .12s;}
    .ak-cta::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:${tk.accent};}
    .ak-cta:hover{border-color:${tk.borderStrong};}
    .ak-sch-status{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:0.06em;color:${tk.textMuted};text-align:center;min-height:14px;}
    .ak-sch-list{display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:${tk.border} transparent;}
    .ak-sch-entry{display:flex;align-items:center;gap:8px;padding:8px 10px;background:${tk.surfaceDeep};border:1px solid ${tk.border};border-radius:5px;transition:border-color .1s;}
    .ak-sch-entry:hover{border-color:${tk.borderStrong};}
    .ak-sch-info{flex:1;min-width:0;}
    .ak-sch-host{font-family:'Space Mono',monospace;font-size:10px;color:${tk.textSub};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}
    .ak-sch-time{font-family:'Space Mono',monospace;font-size:8px;color:${tk.textMuted};letter-spacing:0.04em;}
    .ak-sch-actions{display:flex;align-items:center;gap:5px;flex-shrink:0;}
    .ak-switch{width:28px;height:16px;border-radius:8px;border:1px solid;cursor:pointer;position:relative;transition:all .2s;flex-shrink:0;}
    .ak-switch-on{background:${tk.green};border-color:${tk.greenBorder};}
    .ak-switch-off{background:transparent;border-color:${tk.border};}
    .ak-switch-knob{position:absolute;top:2px;width:10px;height:10px;border-radius:50%;transition:left .2s;}
    .ak-switch-on .ak-switch-knob{left:14px;background:#fff;}
    .ak-switch-off .ak-switch-knob{left:2px;background:${tk.textMuted};}
    .ak-del-btn{width:20px;height:20px;border-radius:3px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid ${tk.border};cursor:pointer;color:${tk.textMuted};transition:all .12s;}
    .ak-del-btn:hover{border-color:${tk.accent};color:${tk.accent};}

    /* setup */
    .ak-setup{display:flex;flex-direction:column;align-items:center;}
    .ak-shield-wrap{width:96px;height:96px;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center;background:${tk.surface};border:1px solid ${tk.border};margin-bottom:18px;flex-shrink:0;}
    .ak-shield-ring{position:absolute;border-radius:50%;pointer-events:none;border:1px solid ${tk.border};}
    .ak-shield-ring-1{inset:-10px;opacity:.6;}
    .ak-shield-ring-2{inset:-20px;opacity:.3;}
    .ak-eyebrow{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:${tk.accent};opacity:.8;margin-bottom:7px;}
    .ak-setup-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:17px;color:${tk.text};text-align:center;line-height:1.25;letter-spacing:-.03em;margin-bottom:4px;}
    .ak-setup-sub{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:${tk.textMuted};margin-bottom:22px;}
    .ak-form{width:100%;display:flex;flex-direction:column;gap:10px;}
    .ak-status{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.06em;color:${tk.textMuted};text-align:center;margin-top:8px;min-height:16px;}
  `;

  return (
    <div className="ak">
      <style>{css}</style>
      <div className="ak-grid" />
      <div className="ak-body">

        {/* ── Header ── */}
        <div className="ak-hdr">
          <div className="ak-wm">
            AuthKey <span className="ak-wm-dot" />
          </div>
          <div className="ak-hdr-r">
            <span className="ak-ver">v1.0</span>
            <button className="ak-tgl" onClick={toggleTheme} aria-label="Toggle theme">
              {dk ? <Ico.Sun /> : <Ico.Moon />}
            </button>
          </div>
        </div>
        <div className="ak-div">
          <div className="ak-div-line" />
          <div className="ak-div-acc" />
        </div>

        {/* ── Setup ── */}
        {!isRegistered ? (
          <div className="ak-setup">
            <div className="ak-shield-wrap">
              <div className="ak-shield-ring ak-shield-ring-1" />
              <div className="ak-shield-ring ak-shield-ring-2" />
              <ShieldFP theme={theme} />
            </div>
            <span className="ak-eyebrow">WebAuthn · Biometric</span>
            <h2 className="ak-setup-title">Set up AuthKey</h2>
            <p className="ak-setup-sub">secure your browsing</p>
            <div className="ak-form">
              <div>
                <label className="ak-field-lbl">Username</label>
                <input type="text" placeholder="e.g. john_doe" value={userId}
                  onChange={e => setUserId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                  className="ak-input" />
              </div>
              <button className="ak-cta" onClick={handleRegister}>
                <Ico.Shield c={tk.text} /> Register AuthKey
              </button>
            </div>
            {status && <p className="ak-status">{status}</p>}
          </div>

        ) : screen === "main" ? (
          /* ── Main ── */
          <div className="ak-main">

            {/* Nav tabs */}
            <div className="ak-tabs">
              <button className="ak-tab ak-tab-active">
                <Ico.Lock c={tk.accent} /> Sites
              </button>
              <button className="ak-tab ak-tab-inactive" onClick={() => setScreen("schedule")}>
                <Ico.Clock c={tk.textMuted} /> Schedule
                {activeSchedules.length > 0 && (
                  <span style={{ background: tk.accent, color: "#fff", fontSize: 7, borderRadius: 2, padding: "1px 4px", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
                    {activeSchedules.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active site card */}
            <div className="ak-card">
              <div className={`ak-card-bar ${ls.type === "red" ? "ak-card-bar-r" : "ak-card-bar-n"}`} />
              <span className="ak-clbl">Active site</span>
              <div className="ak-site-row">
                <div className="ak-site-ico"><Ico.Globe c={tk.iconColor} /></div>
                <span className={`ak-hostname ${!activeHost ? "ak-hostname-empty" : ""}`}>
                  {activeHost || "no active tab"}
                </span>
              </div>
              <div className="ak-srow">
                <div className="ak-led-row">
                  <div className="ak-led" style={ledStyle} />
                  <span className="ak-led-lbl" style={{ color: ledColor }}>{ls.label}</span>
                </div>
                <button
                  className={`ak-lock-btn ${lockState?.isLocked ? "ak-lock-btn-on" : "ak-lock-btn-off"}`}
                  onClick={handleToggleLock}
                >
                  {lockState?.isLocked
                    ? <><Ico.Unlock c={tk.accent} /> Remove</>
                    : <><Ico.Lock c={tk.textMuted} /> Lock</>
                  }
                </button>
              </div>
            </div>

            {/* Protected sites — card shrinks to content, list grows 1→3 rows then scrolls */}
            <div className="ak-card">
              <div className="ak-card-bar ak-card-bar-n" />
              <div className="ak-sites-hdr">
                <span className="ak-clbl" style={{ marginBottom: 0 }}>Protected</span>
                <span className="ak-sites-cnt">{lockedSites.length} site{lockedSites.length !== 1 ? "s" : ""}</span>
              </div>
              <div
                className="ak-sites-list"
                style={{ height: protectedListH }}
              >
                {lockedSites.length === 0
                  ? <p className="ak-empty">// no protected sites</p>
                  : lockedSites.map(site => (
                    <div key={site.host} className="ak-site-entry">
                      <span className="ak-site-host">{site.host}</span>
                      <span className="ak-site-tag">locked</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {status && <p className="ak-status" style={{ marginBottom: 8 }}>{status}</p>}

            {/* Account bar — always last, no extra space above */}
            <div className="ak-acct">
              <div className="ak-avatar">{userId ? userId.slice(0, 2) : "AK"}</div>
              <span className="ak-uname">{userId || "user"}</span>
              <button className="ak-gear" aria-label="Open settings"
                onClick={() => chrome.runtime.openOptionsPage?.()}>
                <Ico.Gear c={tk.textMuted} />
              </button>
            </div>
          </div>

        ) : (
          /* ── Schedule screen ── */
          <div className="ak-sch">

            {/* Back + heading */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <button className="ak-tgl" onClick={() => { setScreen("main"); setSchStatus(""); }}
                aria-label="Back">
                <Ico.Back c={tk.textMuted} />
              </button>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: tk.textMuted }}>
                Schedule Lock
              </span>
            </div>

            {/* Create schedule form */}
            <div className="ak-card">
              <div className="ak-card-bar ak-card-bar-g" />
              <span className="ak-clbl">New schedule</span>

              <div style={{ marginBottom: 8 }}>
                <label className="ak-field-lbl">Website</label>
                <input className="ak-input" placeholder="e.g. twitter.com"
                  value={schHost} onChange={e => setSchHost(e.target.value)} />
              </div>

              <div className="ak-time-row" style={{ marginBottom: 8 }}>
                <div className="ak-time-group">
                  <label className="ak-field-lbl">Start</label>
                  <input type="time" className="ak-input-time" value={schStart}
                    onChange={e => setSchStart(e.target.value)}
                    style={{ background: tk.inputBg, border: `1px solid ${tk.border}`, borderRadius: 5, padding: "8px 10px", fontFamily: "'Space Mono',monospace", fontSize: 11, color: tk.textSub, outline: "none", width: "100%" }} />
                </div>
                <div className="ak-time-group">
                  <label className="ak-field-lbl">End</label>
                  <input type="time" className="ak-input-time" value={schEnd}
                    onChange={e => setSchEnd(e.target.value)}
                    style={{ background: tk.inputBg, border: `1px solid ${tk.border}`, borderRadius: 5, padding: "8px 10px", fontFamily: "'Space Mono',monospace", fontSize: 11, color: tk.textSub, outline: "none", width: "100%" }} />
                </div>
              </div>

              <div style={{ marginBottom: 6 }}>
                <label className="ak-field-lbl">Repeat</label>
                <div className="ak-repeat-row">
                  {(["never", "daily", "weekdays", "weekends", "custom"] as Repeat[]).map(r => (
                    <button key={r}
                      className={`ak-repeat-pill ${schRepeat === r ? "ak-repeat-pill-on" : "ak-repeat-pill-off"}`}
                      onClick={() => handleRepeatChange(r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="ak-field-lbl">Days</label>
                <div className="ak-days-row">
                  {DAYS_SHORT.map((d, i) => (
                    <button key={i}
                      className={`ak-day ${schDays.includes(i) ? "ak-day-on" : "ak-day-off"}`}
                      onClick={() => toggleDay(i)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button className="ak-cta" onClick={handleCreateSchedule}>
                <Ico.Plus c={tk.text} /> Create Schedule
              </button>
              {schStatus && <p className="ak-sch-status" style={{ marginTop: 8 }}>{schStatus}</p>}
            </div>

            {/* Active schedules */}
            {schedules.length > 0 && (
              <div className="ak-card">
                <div className="ak-card-bar ak-card-bar-n" />
                <div className="ak-sites-hdr">
                  <span className="ak-clbl" style={{ marginBottom: 0 }}>Active schedules</span>
                  <span className="ak-sites-cnt">{schedules.length}</span>
                </div>
                <div className="ak-sch-list">
                  {schedules.map(s => (
                    <div key={s.id} className="ak-sch-entry">
                      <div className="ak-sch-info">
                        <div className="ak-sch-host">{s.host}</div>
                        <div className="ak-sch-time">
                          {s.startTime} → {s.endTime} · {s.repeat}
                        </div>
                      </div>
                      <div className="ak-sch-actions">
                        <div className={`ak-switch ${s.active ? "ak-switch-on" : "ak-switch-off"}`}
                          onClick={() => toggleSchedule(s.id)} role="button" aria-label="Toggle schedule">
                          <div className="ak-switch-knob" />
                        </div>
                        <button className="ak-del-btn" onClick={() => deleteSchedule(s.id)} aria-label="Delete">
                          <Ico.Trash c={tk.textMuted} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);

export default Popup;