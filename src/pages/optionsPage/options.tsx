import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeProvider } from "@/components/ui/theme-provider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Lock,
  Unlock,
  Shield,
  Globe,
  Settings,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  BarChart3,
  Timer,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Share2,
  Target,
  Flame,
  Trophy,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp,
  Repeat,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import { Card } from "@/components/ui/card";
import "@/index.css";

// Mock data for demonstration
const mockLockedSites = [
  {
    id: 1,
    url: "facebook.com",
    icon: "🔵",
    isLocked: true,
    category: "Social Media",
    unlockCount: 45,
    avgLockDuration: 120,
  },
  {
    id: 2,
    url: "youtube.com",
    icon: "🔴",
    isLocked: true,
    category: "Entertainment",
    unlockCount: 67,
    avgLockDuration: 85,
  },
  {
    id: 3,
    url: "twitter.com",
    icon: "🐦",
    isLocked: false,
    category: "Social Media",
    unlockCount: 32,
    avgLockDuration: 95,
  },
  {
    id: 4,
    url: "instagram.com",
    icon: "📷",
    isLocked: true,
    category: "Social Media",
    unlockCount: 53,
    avgLockDuration: 110,
  },
  {
    id: 5,
    url: "reddit.com",
    icon: "🟠",
    isLocked: true,
    category: "Discussion",
    unlockCount: 28,
    avgLockDuration: 150,
  },
  {
    id: 6,
    url: "tiktok.com",
    icon: "🎵",
    isLocked: false,
    category: "Entertainment",
    unlockCount: 71,
    avgLockDuration: 65,
  },
  {
    id: 7,
    url: "github.com",
    icon: "🐙",
    isLocked: true,
    category: "Development",
    unlockCount: 12,
    avgLockDuration: 200,
  },
  {
    id: 8,
    url: "stackoverflow.com",
    icon: "📚",
    isLocked: false,
    category: "Development",
    unlockCount: 8,
    avgLockDuration: 180,
  },
  {
    id: 9,
    url: "linkedin.com",
    icon: "💼",
    isLocked: true,
    category: "Professional",
    unlockCount: 15,
    avgLockDuration: 90,
  },
  {
    id: 10,
    url: "discord.com",
    icon: "🎮",
    isLocked: false,
    category: "Communication",
    unlockCount: 38,
    avgLockDuration: 120,
  },
  {
    id: 11,
    url: "twitch.tv",
    icon: "🟣",
    isLocked: true,
    category: "Entertainment",
    unlockCount: 42,
    avgLockDuration: 75,
  },
  {
    id: 12,
    url: "netflix.com",
    icon: "🔴",
    isLocked: false,
    category: "Entertainment",
    unlockCount: 25,
    avgLockDuration: 160,
  },
];

// Mock analytics data
const weeklyUnlockData = [
  { day: "Mon", unlocks: 12, hour: 0 },
  { day: "Tue", unlocks: 8, hour: 0 },
  { day: "Wed", unlocks: 15, hour: 0 },
  { day: "Thu", unlocks: 6, hour: 0 },
  { day: "Fri", unlocks: 20, hour: 0 },
  { day: "Sat", unlocks: 18, hour: 0 },
  { day: "Sun", unlocks: 10, hour: 0 },
];

const hourlyUnlockData = [
  { hour: "6AM", unlocks: 2 },
  { hour: "9AM", unlocks: 8 },
  { hour: "12PM", unlocks: 15 },
  { hour: "3PM", unlocks: 12 },
  { hour: "6PM", unlocks: 18 },
  { hour: "9PM", unlocks: 10 },
  { hour: "12AM", unlocks: 3 },
];

const categoryData = [
  { name: "Social Media", value: 130, color: "#8B5CF6" },
  { name: "Entertainment", value: 98, color: "#F59E0B" },
  { name: "Development", value: 20, color: "#10B981" },
  { name: "Professional", value: 15, color: "#3B82F6" },
  { name: "Communication", value: 38, color: "#EF4444" },
];

// Number Ticker Component
const NumberTicker = ({ value, className = "" }) => {
  return (
    <div
      className={`font-mono text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent ${className}`}
    >
      {value.toString().padStart(2, "0")}
    </div>
  );
};




// Login Component
const LoginScreen = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 2000);
  };

  return (
    <div className="w-full h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 inline-block mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AuthKey</h1>
            <p className="text-gray-400">
              A simple extension to manage your privacy
            </p>
          </div>

          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 flex items-center justify-center">
              <Lock className="w-16 h-16 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Set up your passcode to use AuthKey
            </h2>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? "Setting up..." : "Set up passcode"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, siteName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Confirm Removal
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-white">{siteName}</span> from
            your managed sites? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Remove Site
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface Site {
  id: number;
  url: string;
  icon: string;
  isLocked: boolean;
  category: string;
  unlockCount: number;
  avgLockDuration: number;
}

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

export function ScheduleLock({ sites: initialSites = [] }: ScheduleLockProps) {
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

  const [scheduledLocks, setScheduledLocks] = useState<Schedule[]>([
    {
      id: 1,
      name: "Work Hours Focus",
      sites: ["facebook.com", "youtube.com"],
      startTime: "09:00",
      endTime: "17:00",
      repeat: "weekdays",
      customDays: [],
      isActive: true,
      canModify: true,
    },
    {
      id: 2,
      name: "Sleep Time",
      sites: ["instagram.com", "tiktok.com"],
      startTime: "22:00",
      endTime: "06:00",
      repeat: "daily",
      customDays: [],
      isActive: false,
      canModify: false,
    },
  ]);

  const toggleSiteSelection = (siteId: number) => {
    setSelectedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const toggleCustomDay = (dayId: string) => {
    setCustomDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const addSchedule = () => {
    if (selectedSites.length > 0 && startTime && endTime) {
      const newSchedule: Schedule = {
        id: Math.max(...scheduledLocks.map((s) => s.id)) + 1,
        name: scheduleName || `Schedule ${scheduledLocks.length + 1}`,
        sites: selectedSites
          .map((id) => sites.find((s) => s.id === id)?.url)
          .filter(Boolean) as string[],
        startTime,
        endTime,
        repeat: repeatOption,
        customDays: repeatOption === "custom" ? customDays : [],
        isActive: true,
        canModify: true,
      };

      setScheduledLocks([...scheduledLocks, newSchedule]);

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
  };

  const toggleSchedule = (id: number) => {
    setScheduledLocks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
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
    <div className="space-y-6">
      {/* Create New Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Create Schedule Lock
        </h3>

        {/* Schedule Name */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Schedule Name (Optional)
          </label>
          <input
            type="text"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            placeholder="e.g., Work Focus, Sleep Time, Study Hours"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Site Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">
              Select Sites to Lock
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSite(!showAddSite)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSites(!showSites)}
                className="text-gray-400 hover:text-gray-300"
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
            <div className="mb-3">
              <input
                type="text"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                placeholder="Enter website URL"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {showSites && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                {sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => toggleSiteSelection(site.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      selectedSites.includes(site.id)
                        ? "bg-blue-500/20 border-blue-400 text-blue-300"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg">{site.icon}</span>
                    <span className="truncate text-sm">{site.url}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSites.map((siteId) => {
                  const site = sites.find((s) => s.id === siteId);
                  return site ? (
                    <Badge
                      key={siteId}
                      variant="secondary"
                      className="text-xs bg-blue-500/20 text-blue-300"
                    >
                      {site.icon} {site.url}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSiteSelection(siteId);
                        }}
                        className="ml-1 h-auto p-0 text-blue-300 hover:text-blue-200"
                      >
                        <Lock className="w-3 h-3" />
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
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Repeat Options */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            Repeat Schedule
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {REPEAT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setRepeatOption(option.id)}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  repeatOption === option.id
                    ? "bg-purple-500/20 border-purple-400 text-purple-300"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom Days Selection */}
          {repeatOption === "custom" && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm text-gray-300 mb-3">Select Days</div>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleCustomDay(day.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      customDays.includes(day.id)
                        ? "bg-blue-500 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-red-400 mt-2">
                  Please select at least one day
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={addSchedule}
          disabled={!isFormValid()}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="w-4 h-4 mr-2" />
          Create Schedule Lock
        </Button>
      </Card>

      {/* Active Schedules */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Active Schedules ({scheduledLocks.length})
        </h3>

        <div className="space-y-4">
          {scheduledLocks.length > 0 ? (
            scheduledLocks.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white truncate">
                        {schedule.name}
                      </h4>
                      <Badge
                        variant={schedule.isActive ? "default" : "secondary"}
                        className="flex-shrink-0"
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {!schedule.canModify && (
                        <Badge
                          variant="destructive"
                          className="text-xs flex-shrink-0"
                        >
                          <Lock className="w-2 h-2 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {getRepeatText(schedule)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                      disabled={!schedule.canModify}
                    />
                    {schedule.canModify && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSchedule(schedule.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-400">Locked Sites:</div>
                  <div className="flex flex-wrap gap-2">
                    {schedule.sites.map((site, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-white/20 bg-white/5"
                      >
                        {site}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No schedules created yet</p>
              <p className="text-sm">
                Create your first schedule above to get started
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
// Analytics Component
const Analytics = ({ sites }) => {
  const [timeRange, setTimeRange] = useState("week");
  const [currentStreak, setCurrentStreak] = useState(12);
  const [longestStreak, setLongestStreak] = useState(28);
  const [totalChallengesCompleted, setTotalChallengesCompleted] = useState(45);

  const shareStreak = () => {
    const text = `🔥 I've maintained a ${currentStreak}-day streak on AuthKey! Taking control of my digital habits. #DigitalWellness #ProductivityWin`;
    if (navigator.share) {
      navigator.share({
        title: "AuthKey Streak Achievement",
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Streak shared to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Streak</p>
              <div className="flex items-center gap-2">
                <NumberTicker value={currentStreak} className="text-2xl" />
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <Button
              size="sm"
              onClick={shareStreak}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Longest Streak</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">
                  {longestStreak}
                </div>
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Challenges Completed</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">
                  {totalChallengesCompleted}
                </div>
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {["day", "week", "month"].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className={
              timeRange === range
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : "border-white/20 bg-white/5 hover:bg-white/10"
            }
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Unlock Patterns */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Unlock Patterns
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeRange === "day" ? hourlyUnlockData : weeklyUnlockData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey={timeRange === "day" ? "hour" : "day"}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="unlocks"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-300">{category.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Unlocked Sites */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Most Unlocked Sites
          </h3>
          <div className="space-y-3">
            {sites
              .sort((a, b) => b.unlockCount - a.unlockCount)
              .slice(0, 5)
              .map((site, index) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-lg">{site.icon}</span>
                    <span className="text-white text-sm">{site.url}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {site.unlockCount}
                    </div>
                    <div className="text-xs text-gray-400">unlocks</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Lock Duration Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Average Lock Duration
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sites.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="url"
                  stroke="#9CA3AF"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                  formatter={(value) => [`${value} min`, "Duration"]}
                />
                <Bar
                  dataKey="avgLockDuration"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Achievement Badges */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
            <h4 className="font-semibold text-white">Week Warrior</h4>
            <p className="text-xs text-gray-300">7 days streak</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <Shield className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-semibold text-white">Lock Master</h4>
            <p className="text-xs text-gray-300">100 sites locked</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Target className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="font-semibold text-white">Focus Champion</h4>
            <p className="text-xs text-gray-300">30 challenges completed</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30">
            <Flame className="w-8 h-8 text-red-400 mb-2" />
            <h4 className="font-semibold text-white">Streak Legend</h4>
            <p className="text-xs text-gray-300">30 days streak</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

function Options() {
  const [isLoggined, setIsLoggined] = useState(true);
  const [sites, setSites] = useState(mockLockedSites);
  const [todayUnlocks] = useState(23);
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    siteId: null,
    siteName: "",
  });
  const [activeTab, setActiveTab] = useState("dashboard");

  const sitesPerPage = 5;

  const toggleSiteLock = (id) => {
    setSites(
      sites.map((site) =>
        site.id === id ? { ...site, isLocked: !site.isLocked } : site
      )
    );
  };

  const openConfirmModal = (id, siteName) => {
    setConfirmModal({ isOpen: true, siteId: id, siteName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, siteId: null, siteName: "" });
  };

  const confirmRemoveSite = () => {
    setSites(sites.filter((site) => site.id !== confirmModal.siteId));
    closeConfirmModal();
  };

  const addNewSite = () => {
    if (newSiteUrl.trim()) {
      const newSite = {
        id: Math.max(...sites.map((s) => s.id)) + 1,
        url: newSiteUrl.trim(),
        icon: "🌐",
        isLocked: true,
        category: "Custom",
        unlockCount: 0,
        avgLockDuration: 0,
      };
      setSites([...sites, newSite]);
      setNewSiteUrl("");
      setShowAddSite(false);
    }
  };

  const lockedCount = sites.filter((site) => site.isLocked).length;
  const unlockedCount = sites.filter((site) => !site.isLocked).length;

  // Pagination logic
  const totalPages = Math.ceil(sites.length / sitesPerPage);
  const startIndex = (currentPage - 1) * sitesPerPage;
  const endIndex = startIndex + sitesPerPage;
  const currentSites = sites.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (!isLoggined) {
    return <LoginScreen onLogin={() => setIsLoggined(true)} />;
  }

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                AuthKey Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Manage your privacy settings
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-white/5 hover:bg-white/10 w-full sm:w-auto"
            disabled
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: "dashboard", label: "Dashboard", icon: Shield },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "schedule", label: "Schedule Lock", icon: Timer },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">
                      Today's Unlocks
                    </p>
                    <NumberTicker value={todayUnlocks} />
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <Unlock className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">
                      Sites Locked
                    </p>
                    <div className="text-2xl sm:text-4xl font-bold text-white">
                      {lockedCount}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">
                      Sites Unlocked
                    </p>
                    <div className="text-2xl sm:text-4xl font-bold text-white">
                      {unlockedCount}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Sites List */}
              <div className="xl:col-span-2">
                <Card className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Managed Sites
                    </h2>
                    <Button
                      size="sm"
                      onClick={() => setShowAddSite(!showAddSite)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Site
                    </Button>
                  </div>

                  {showAddSite && (
                    <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newSiteUrl}
                          onChange={(e) => setNewSiteUrl(e.target.value)}
                          placeholder="Enter website URL (e.g., example.com)"
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === "Enter" && addNewSite()}
                        />
                        <Button
                          size="sm"
                          onClick={addNewSite}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Fixed height container for sites */}
                  <div className="min-h-[500px] flex flex-col">
                    <div className="space-y-3 flex-grow">
                      {currentSites.length > 0 ? (
                        currentSites.map((site) => (
                          <div
                            key={site.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 flex-grow min-w-0">
                              <div className="text-xl sm:text-2xl flex-shrink-0">
                                {site.icon}
                              </div>
                              <div className="min-w-0 flex-grow">
                                <div className="font-medium text-white truncate">
                                  {site.url}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400">
                                  {site.category}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <Badge
                                variant={
                                  site.isLocked ? "destructive" : "secondary"
                                }
                                className={`${
                                  site.isLocked
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-green-500/20 text-green-300"
                                } text-xs`}
                              >
                                {site.isLocked ? (
                                  <>
                                    <Lock className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                    Locked
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                    Unlocked
                                  </>
                                )}
                              </Badge>

                              <Switch
                                checked={site.isLocked}
                                onCheckedChange={() => toggleSiteLock(site.id)}
                                className="data-[state=checked]:bg-red-500"
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openConfirmModal(site.id, site.url)
                                }
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                          <div className="text-center">
                            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No sites added yet</p>
                            <p className="text-sm">
                              Click "Add Site" to get started
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, sites.length)} of {sites.length}{" "}
                          sites
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border-white/20 bg-white/5 hover:bg-white/10"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => goToPage(page)}
                                className={
                                  currentPage === page
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600"
                                    : "border-white/20 bg-white/5 hover:bg-white/10"
                                }
                              >
                                {page}
                              </Button>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="border-white/20 bg-white/5 hover:bg-white/10"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Actions & Analytics */}
              <div className="space-y-4 sm:space-y-6">
                {/* Quick Actions */}
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Unlock All Sites
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-sm"
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Lock All Sites
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("analytics")}
                      className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-sm"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("schedule")}
                      className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-sm"
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Schedule Lock
                    </Button>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-300 flex-grow truncate">
                        Unlocked facebook.com
                      </span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        2m ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-300 flex-grow truncate">
                        Locked youtube.com
                      </span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        5m ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-300 flex-grow truncate">
                        Added reddit.com
                      </span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        1h ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-300 flex-grow truncate">
                        Updated permissions
                      </span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        3h ago
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Brought to you by
                      <span className="text-sm text-gray-400 px-2">
                        Cosmology is fun
                      </span>
                    </h3>
                    <button className="flex items-center gap-2 bg-zinc-950 px-6 py-2 rounded-2xl">
                      <FaGithub className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
                      <span className="text-gray-400 ml-2">Github</span>
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === "analytics" && <Analytics sites={sites} />}
        {activeTab === "schedule" && <ScheduleLock sites={sites} />}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmRemoveSite}
        siteName={confirmModal.siteName}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
 <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
<Options />
 </ThemeProvider>

);
