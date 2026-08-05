import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import { 
  Clock, 
  Timer, 
  Tag, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Globe, 
  Search, 
  Check, 
  X, 
  Repeat, 
  Calendar, 
  Trash2, 
  Lock,
  Pencil
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TimePickerInput } from "../shared/TimePickerInput";
import { type Site, useSites } from "../../contexts/ExtensionContext";
import { getAllSchedules, putSchedule, deleteScheduleRecord } from "../../storage/lockDb";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isBetween);
interface Schedule {
  id: number;
  name: string;
  sites: string[];
  startTime: string;
  endTime: string;
  repeat: string;
  customDays: string[];
  isActive: boolean;
  canModify: boolean;
  triggerDate?: string;
}

// Day options for scheduling
const DAYS_OF_WEEK = [
  { id: "mon", label: "Mon", full: "Monday" },
  { id: "tue", label: "Tue", full: "Tuesday" },
  { id: "wed", label: "Wed", full: "Wednesday" },
  { id: "thu", label: "Thu", full: "Thursday" },
  { id: "fri", label: "Fri", full: "Friday" },
  { id: "sat", label: "Sat", full: "Saturday" },
  { id: "sun", label: "Sun", full: "Sunday" },
];

// Repeat options
const REPEAT_OPTIONS = [
  { id: "never", label: "Never" },
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays (Mon-Fri)" },
  { id: "weekends", label: "Weekends (Sat-Sun)" },
  { id: "custom", label: "Custom Days" },
];

interface ScheduleLockProps {
  sites: Site[];
}

const ScheduleCountdown: FC<{ schedule: Schedule }> = ({ schedule }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [status, setStatus] = useState<"locking" | "waiting" | "">("");

  useEffect(() => {
    if (!schedule.isActive) {
      setTimeLeft("");
      setStatus("");
      return;
    }

    const updateTimer = () => {
      const now = dayjs();
      const daysMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

      const isValidDay = (d: dayjs.Dayjs) => {
        if (schedule.repeat === "never") {
        
          if (!schedule.triggerDate) return false;
          return d.isSame(dayjs(schedule.triggerDate), 'day');
        }
        if (schedule.repeat === "daily") return true;
        const dayIndex = d.day();
        const dayName = daysMap[dayIndex];
        if (schedule.repeat === "weekdays") return dayIndex >= 1 && dayIndex <= 5;
        if (schedule.repeat === "weekends") return dayIndex === 0 || dayIndex === 6;
        if (schedule.repeat === "custom") return schedule.customDays.includes(dayName);
        return true;
      };

      let currentlyLockingEnd = null;
 
      const yesterday = now.subtract(1, "day");
      if (isValidDay(yesterday)) {
        const startY = dayjs(`${yesterday.format("YYYY-MM-DD")} ${schedule.startTime}`, "YYYY-MM-DD HH:mm");
        let endY = dayjs(`${yesterday.format("YYYY-MM-DD")} ${schedule.endTime}`, "YYYY-MM-DD HH:mm");
        if (endY.isBefore(startY)) endY = endY.add(1, "day");

        if (now.isBetween(startY, endY, null, "[)")) {
          currentlyLockingEnd = endY;
        }
      }

      // Check today's window
      const today = now;
      if (!currentlyLockingEnd && isValidDay(today)) {
        const startT = dayjs(`${today.format("YYYY-MM-DD")} ${schedule.startTime}`, "YYYY-MM-DD HH:mm");
        let endT = dayjs(`${today.format("YYYY-MM-DD")} ${schedule.endTime}`, "YYYY-MM-DD HH:mm");
        if (endT.isBefore(startT)) endT = endT.add(1, "day");

        if (now.isBetween(startT, endT, null, "[)")) {
          currentlyLockingEnd = endT;
        }
      }

      const formatDiff = (diffMs: number) => {
        const dur = dayjs.duration(diffMs);
        const d = Math.floor(dur.asDays());
        const h = dur.hours();
        const m = dur.minutes().toString().padStart(2, "0");
        const s = dur.seconds().toString().padStart(2, "0");
        let tStr = "";
        if (d > 0) tStr += `${d}d `;
        tStr += `${h}h ${m}m ${s}s`;
        return tStr;
      };

      if (currentlyLockingEnd) {
        setStatus("locking");
        setTimeLeft(formatDiff(currentlyLockingEnd.diff(now)));

        
        if (schedule.repeat === "never" && now.isAfter(currentlyLockingEnd)) {
          const deactivated = { ...schedule, isActive: false };
          putSchedule(deactivated);
        }
      } else {
     
        let nextStart = null;
        for (let i = 0; i <= 7; i++) {
          const checkDay = now.add(i, "day");
          if (isValidDay(checkDay)) {
            const startC = dayjs(`${checkDay.format("YYYY-MM-DD")} ${schedule.startTime}`, "YYYY-MM-DD HH:mm");
            if (startC.isAfter(now)) {
              nextStart = startC;
              break;
            }
          }
        }

        if (nextStart) {
          setStatus("waiting");
          setTimeLeft(formatDiff(nextStart.diff(now)));
        } else {
         
          if (schedule.repeat === "never" && schedule.isActive) {
            const deactivated = { ...schedule, isActive: false };
            putSchedule(deactivated);
          }
          setStatus("");
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [schedule]);

  if (!schedule.isActive || !status) return null;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs ${
      status === "locking" 
        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400" 
        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
    }`}>
      <Timer className="w-3.5 h-3.5" />
      {status === "locking" ? `Ends in ${timeLeft}` : `Starts in ${timeLeft}`}
    </span>
  );
};

export const ScheduleLock: FC<ScheduleLockProps> = ({ sites: initialSites = [] }) => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeatOption, setRepeatOption] = useState("never");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [scheduleName, setScheduleName] = useState("");
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [showSites, setShowSites] = useState(true);
  const [siteSearchQuery, setSiteSearchQuery] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [scheduledLocks, setScheduledLocks] = useState<Schedule[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, scheduleId: number | null}>({isOpen: false, scheduleId: null});
  const { addSite } = useSites();

  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  useEffect(() => {
    getAllSchedules().then((saved) => {
      if (saved && saved.length > 0) {
        setScheduledLocks(saved as Schedule[]);
      }
    });
  }, []);

  const toggleSiteSelection = (siteId: number) => {
    setSelectedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleAddSite = async () => {
    if (newSiteUrl.trim()) {
      const rawUrl = newSiteUrl.trim().toLowerCase();
      const host = rawUrl.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
      // Check if URL already exists
      const existing = sites.find((s) => s.url.toLowerCase() === host);
      if (existing) {
        if (!selectedSites.includes(existing.id)) {
          setSelectedSites((prev) => [...prev, existing.id]);
        }
      } else {
        await addSite(host);

        setSites((currentSites) => {
          const newSite = currentSites.find((s) => s.url.toLowerCase() === host);
          if (newSite && !selectedSites.includes(newSite.id)) {
            setSelectedSites((prev) => [...prev, newSite.id]);
          }
          return currentSites;
        });
      }
      setNewSiteUrl("");
      setShowAddSite(false);
    }
  };

  const toggleCustomDay = (dayId: string) => {
    setCustomDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingScheduleId(schedule.id);
    setScheduleName(schedule.name);
    
    const siteIds = schedule.sites
      .map((url) => sites.find((s) => s.url === url)?.id)
      .filter((id): id is number => id !== undefined);
    setSelectedSites(siteIds);
    
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setRepeatOption(schedule.repeat);
    setCustomDays(schedule.customDays);
    
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const addSchedule = async () => {
    if (isFormValid()) {
      if (editingScheduleId !== null) {
        const existingSchedule = scheduledLocks.find(s => s.id === editingScheduleId);
        if (!existingSchedule) {
          setEditingScheduleId(null);
          return;
        }

        const updatedSchedule: Schedule = {
          ...existingSchedule,
          name: scheduleName || `Schedule ${editingScheduleId}`,
          sites: selectedSites
            .map((id) => sites.find((s) => s.id === id)?.url)
            .filter(Boolean) as string[],
          startTime,
          endTime,
          repeat: repeatOption,
          customDays: repeatOption === "custom" ? customDays : [],
          triggerDate: repeatOption === "never" ? dayjs().format("YYYY-MM-DD") : undefined,
        };
        
        setScheduledLocks(prev => prev.map(s => s.id === editingScheduleId ? updatedSchedule : s));
        putSchedule(updatedSchedule);
        setEditingScheduleId(null);
      } else {
        const newScheduleData: Omit<Schedule, 'id'> & { id?: number } = {
          name: scheduleName || `Schedule ${scheduledLocks.length + 1}`,
          sites: selectedSites
            .map((id) => sites.find((s) => s.id === id)?.url)
            .filter(Boolean) as string[],
          startTime,
          endTime,
          repeat: repeatOption,
          customDays: repeatOption === "custom" ? customDays : [],
          triggerDate: repeatOption === "never" ? dayjs().format("YYYY-MM-DD") : undefined,
          isActive: true,
          canModify: true,
        };
  
        const newId = await putSchedule(newScheduleData as Schedule);
        setScheduledLocks([...scheduledLocks, { ...newScheduleData, id: newId } as Schedule]);
      }

      // Reset form
      setSelectedSites([]);
      setStartTime("");
      setEndTime("");
      setRepeatOption("never");
      setCustomDays([]);
      setScheduleName("");
    }
  };

  const removeSchedule = (id: number) => {
    setScheduledLocks((prev) => prev.filter((s) => s.id !== id));
    deleteScheduleRecord(id);
  };

  const toggleSchedule = (id: number) => {
    setScheduledLocks((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
      const toggled = updated.find(s => s.id === id);
      if (toggled) putSchedule(toggled);
      return updated;
    });
  };

  const getRepeatText = (schedule: Schedule) => {
    switch (schedule.repeat) {
      case "daily":
        return "Every day";
      case "weekdays":
        return "Mon-Fri";
      case "weekends":
        return "Sat-Sun";
      case "custom":
        if (schedule.customDays.length === 0) return "Custom";
        return schedule.customDays
          .map((dayId) => DAYS_OF_WEEK.find((d) => d.id === dayId)?.label)
          .join(", ");
      default:
        return "Once";
    }
  };

  const isFormValid = () => {
    return (
      selectedSites.length > 0 &&
      startTime &&
      endTime &&
      (repeatOption !== "custom" || customDays.length > 0)
    );
  };

  return (
    <div className="space-y-6" ref={topRef}>
      {/* Create New Schedule */}
      <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm relative overflow-hidden">
        <Clock className="absolute -right-12 -top-20 w-60 h-60 text-gray-400 dark:text-gray-400 opacity-[0.18] pointer-events-none z-0" />
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6 flex items-center gap-2 relative z-10">
          <Timer className="w-5 h-5 text-black dark:text-white" />
          {editingScheduleId !== null ? "Edit Schedule Lock" : "Create Schedule Lock"}
        </h3>

        {/* Schedule Name */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
            Schedule Name (Optional)
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 dark:text-gray-200 pointer-events-none" />
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g., Work Focus, Sleep Time, Study Hours"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#333] rounded-lg text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black transition-shadow"
            />
          </div>
        </div>

        {/* Site Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Select Sites to Lock
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSite(!showAddSite)}
                className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] dark:bg-[#252525] h-8 text-xs border border-gray-300 dark:border-[#333]"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSites(!showSites)}
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] dark:bg-[#252525] h-8 w-8 p-0 border border-gray-300 dark:border-[#333]"
              >
                {showSites ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {showAddSite && (
            <div className="mb-4 flex gap-2">
              <div className="relative grow">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 dark:text-gray-200 pointer-events-none" />
                <input
                  type="text"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSite();
                    }
                  }}
                  placeholder="Enter website URL (e.g., twitter.com)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#333] rounded-lg text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>
              <Button
                onClick={handleAddSite}
                disabled={!newSiteUrl.trim()}
                className="bg-black hover:bg-gray-900 dark:hover:bg-[#2A2A2A] dark:bg-[#252525] text-white rounded-lg px-4 h-[42px] font-medium"
              >
                Add
              </Button>
            </div>
          )}

          {showSites && (
            <div>
              {/* Search Filter for Sites */}
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 dark:text-gray-200 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search sites to lock..."
                  value={siteSearchQuery}
                  onChange={(e) => setSiteSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#333] rounded-lg text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {sites
                  .filter((site) =>
                     site.url && site.url.toLowerCase().includes(siteSearchQuery.toLowerCase())
                  )
                  .map((site, index) => {
                    const isSelected = selectedSites.includes(site.id);
                    return (
                      <button
                        key={site.id}
                        onClick={() => toggleSiteSelection(site.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-sm"
                            : index % 2 === 0
                            ? "bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#2A2A2A] text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#333]"
                            : "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#252525]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{site.icon}</span>
                          <span className="truncate text-sm font-medium">{site.url}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-white dark:text-black shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSites.map((siteId) => {
                  const site = sites.find((s) => s.id === siteId);
                  return site ? (
                    <Badge
                      key={siteId}
                      variant="secondary"
                      className="text-xs bg-gray-100 dark:bg-[#252525] text-black dark:text-white border border-gray-300 dark:border-[#333] pl-2 pr-1 py-1 flex items-center gap-1 rounded-lg"
                    >
                      <span className="mr-0.5">{site.icon}</span> {site.url}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSiteSelection(siteId);
                        }}
                        className="ml-1 h-4 w-4 p-0 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-transparent transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TimePickerInput
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
          />
          <TimePickerInput
            label="End Time"
            value={endTime}
            onChange={setEndTime}
          />
        </div>

        {/* Repeat Options */}
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Repeat className="w-4 h-4 text-black dark:text-white" />
            Repeat Schedule
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {REPEAT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setRepeatOption(option.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  repeatOption === option.id
                    ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black font-semibold"
                    : "bg-white dark:bg-[#1A1A1A] border-gray-200  text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#252525] hover:border-gray-300 dark:border-[#333]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom Days Selection */}
          {repeatOption === "custom" && (
            <div className="p-5 rounded-xl bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 dark:border-[#2A2A2A]">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Select Days</div>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleCustomDay(day.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      customDays.includes(day.id)
                        ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black font-semibold"
                        : "bg-white dark:bg-[#1A1A1A] text-black dark:text-white border-gray-300 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#252525]"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-red-500 mt-3 font-medium">
                  Please select at least one day
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={addSchedule}
            disabled={!isFormValid()}
            className="flex-1 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black rounded-xl py-6 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Clock className="w-5 h-5 mr-2" />
            {editingScheduleId !== null ? "Save Schedule" : "Create Schedule Lock"}
          </Button>
          {editingScheduleId !== null && (
            <Button
              onClick={() => {
                setEditingScheduleId(null);
                setSelectedSites([]);
                setStartTime("");
                setEndTime("");
                setRepeatOption("never");
                setCustomDays([]);
                setScheduleName("");
              }}
              variant="outline"
              className="flex-shrink-0 border-gray-300 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#252525] text-black dark:text-white rounded-xl py-6 px-6 font-semibold transition-all"
            >
              Cancel
            </Button>
          )}
        </div>
        {!isFormValid() && (
          <p className="text-xs text-gray-400 dark:text-gray-400 text-center mt-3 font-medium">
            {!selectedSites.length && !startTime && !endTime
              ? "Select at least one site and specify start/end times to create a lock"
              : !selectedSites.length
              ? "Please select at least one site to lock"
              : !startTime || !endTime
              ? "Please specify both Start and End times"
              : repeatOption === "custom" && !customDays.length
              ? "Please select at least one custom day"
              : ""}
          </p>
        )}
      </Card>

      {/* Active Schedules */}
      <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-black dark:text-white" />
          Active Schedules ({scheduledLocks.length})
        </h3>

        <div className="space-y-4">
          {scheduledLocks.length > 0 ? (
            scheduledLocks.map((schedule, index) => (
              <div
                key={schedule.id}
                className={`p-5 rounded-xl border transition-all duration-200 ${
                  index % 2 === 0
                    ? "bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#2A2A2A]"
                    : "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                } hover:bg-gray-200 dark:hover:bg-[#333] hover:border-gray-300 dark:border-[#333]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-black dark:text-white text-base truncate">
                        {schedule.name}
                      </h4>
                      <Badge
                        variant={schedule.isActive ? "default" : "secondary"}
                        className={`shrink-0 ${schedule.isActive
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                          : "bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400 border-gray-300 dark:border-[#333]"
                          }`}
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {!schedule.canModify && (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30"
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5 bg-white dark:bg-[#1A1A1A] px-2.5 py-1 rounded-md border border-gray-200 dark:border-[#2A2A2A]">
                        <Clock className="w-3.5 h-3.5 text-black dark:text-white" />
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white dark:bg-[#1A1A1A] px-2.5 py-1 rounded-md border border-gray-200 dark:border-[#2A2A2A]">
                        <Repeat className="w-3.5 h-3.5 text-black dark:text-white" />
                        {getRepeatText(schedule)}
                      </span>
                      {schedule.isActive && <ScheduleCountdown schedule={schedule} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                      disabled={!schedule.canModify}
                      className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                    />
                    {schedule.canModify && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ isOpen: true, scheduleId: schedule.id })}
                        className="p-1.5 h-auto text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Locked Sites:</div>
                    <div className="flex flex-wrap gap-2">
                      {schedule.sites.map((site, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 py-1"
                        >
                          {site}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#252525]"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-[#1F1F1F] rounded-xl border border-dashed border-gray-300 dark:border-[#333]">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1 text-black dark:text-white">No schedules created yet</p>
              <p className="text-sm">
                Create your first schedule above to get started
              </p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm({ isOpen: false, scheduleId: null })}>
        <DialogContent className="bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] text-black dark:text-white max-w-md rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500 font-semibold">
              <Trash2 className="w-5 h-5" />
              Delete Schedule
            </DialogTitle>
            <DialogDescription className="text-gray-800 dark:text-gray-400 mt-2">
              Are you sure you want to delete this schedule? This action cannot be undone and the scheduled locks will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ isOpen: false, scheduleId: null })}
              className="flex-1 border-gray-300 dark:border-[#333] bg-white hover:bg-gray-50 dark:bg-[#1F1F1F] dark:hover:bg-[#252525] text-black dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteConfirm.scheduleId !== null) {
                  removeSchedule(deleteConfirm.scheduleId);
                  setDeleteConfirm({ isOpen: false, scheduleId: null });
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleLock;
