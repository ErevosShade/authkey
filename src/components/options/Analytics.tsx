import { useState } from "react";
import type { FC } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
} from "recharts";
import {
  Flame,
  Trophy,
  Award,
  Share2,
  Activity,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "../shared/NumberTicker";
import { type Site } from "../../contexts/ExtensionContext";

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
  { name: "Communication", value: 38, color: "#8B5CF6" }, // Purple (Innermost)
  { name: "Professional", value: 15, color: "#F59E0B" }, // Yellow
  { name: "Development", value: 20, color: "#10B981" }, // Green
  { name: "Entertainment", value: 98, color: "#EF4444" }, // Red
  { name: "Social Media", value: 130, color: "#3B82F6" }, // Blue (Outermost)
];

interface AnalyticsProps {
  sites: Site[];
}

export const Analytics: FC<AnalyticsProps> = ({ sites }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [timeRange, setTimeRange] = useState("week");
  const [currentStreak] = useState(12);
  const [longestStreak] = useState(28);
  const [totalChallengesCompleted] = useState(45);

  const dimColor = (color: string) => {
    if (!isDark) return color;
    const dimMap: { [key: string]: string } = {
      "#8B5CF6": "#7C3AED",
      "#F59E0B": "#D97706",
      "#10B981": "#059669",
      "#EF4444": "#DC2626",
      "#3B82F6": "#2563EB",
    };
    return dimMap[color] || color;
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm relative overflow-hidden">
          <Flame className="absolute -right-8 -bottom-16 w-40 h-40 text-orange-500 opacity-25 dark:opacity-10 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Current Streak</p>
              <div className="flex items-center gap-2">
                <NumberTicker value={currentStreak} className="!text-3xl text-black dark:text-white font-sans" />
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <Button
              size="sm"
              onClick={shareStreak}
              className="bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black rounded-lg transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm relative overflow-hidden">
          <Trophy className="absolute -right-9 -bottom-16 w-40 h-40 text-yellow-500 opacity-25 dark:opacity-10 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Longest Streak</p>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-black dark:text-white leading-none">
                  {longestStreak}
                </div>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-8 -bottom-16 w-40 h-40 pointer-events-none z-0">
            <Award className="w-full h-full text-green-600 opacity-25 dark:opacity-10" />
            <span className="absolute text-green-600 opacity-25 dark:opacity-10 text-5xl font-extrabold top-[33%] left-[50%] -translate-x-1/2 -translate-y-1/2 font-sans select-none">
              1
            </span>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Challenges Completed</p>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-black dark:text-white leading-none">
                  {totalChallengesCompleted}
                </div>
                <Award className="w-6 h-6 text-green-600" />
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
            variant="ghost"
            size="sm"
            onClick={() => setTimeRange(range)}
            className={`rounded-lg capitalize transition-all ${timeRange === range
              ? "!bg-black dark:!bg-white !text-white dark:!text-black border border-black dark:border-white font-semibold"
              : "border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#252525] text-black dark:text-white"
              }`}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="columns-1 xl:columns-2 gap-6 space-y-6">
        {/* Unlock Patterns */}
        <Card className="p-5 pb-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm break-inside-avoid">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-black dark:text-white" />
            Unlock Patterns
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeRange === "day" ? hourlyUnlockData : weeklyUnlockData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="unlockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#FFFFFF" : "#000000"} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={isDark ? "#FFFFFF" : "#000000"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "#E5E7EB"} vertical={false} />
                <XAxis
                  dataKey={timeRange === "day" ? "hour" : "day"}
                  stroke="#9CA3AF"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E7EB", borderRadius: "12px", color: isDark ? "#FFFFFF" : "#111827", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                />
                <Area
                  type="monotone"
                  dataKey="unlocks"
                  stroke={isDark ? "#FFFFFF" : "#000000"}
                  strokeWidth={2}
                  fill="url(#unlockGradient)"
                  dot={{ fill: isDark ? "#FFFFFF" : "#000000", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: isDark ? "#FFFFFF" : "#000000", stroke: isDark ? "#1A1A1A" : "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm break-inside-avoid">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-black dark:text-white" />
            Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="95%"
                barSize={12}
                data={categoryData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  // @ts-expect-error minAngle is valid at runtime but missing in standard Recharts typings
                  minAngle={15}
                  background={{ fill: isDark ? "#252525" : "#F3F4F6" }}
                  clockWise
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={dimColor(entry.color)} 
                    />
                  ))}
                </RadialBar>
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E7EB", borderRadius: "12px", color: isDark ? "#FFFFFF" : "#111827", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: isDark ? '#D1D5DB' : '#374151' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {categoryData.map((category, index) => {
              const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);
              const percentage = Math.round((category.value / totalValue) * 100);
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dimColor(category.color) }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.name} <span className="font-bold text-black dark:text-white">[{percentage}%]</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Most Unlocked Sites */}
        <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm break-inside-avoid">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-black dark:text-white" />
            Most Unlocked Sites
          </h3>
          <div className="space-y-3">
            {sites
              .sort((a, b) => b.unlockCount - a.unlockCount)
              .slice(0, 5)
              .map((site, index) => (
                <div
                  key={site.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    index % 2 === 0
                      ? "bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#2A2A2A]"
                      : "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                  } hover:bg-gray-200 dark:hover:bg-[#333] hover:border-gray-300 dark:border-[#333]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                      #{index + 1}
                    </div>
                    <span className="text-xl">{site.icon}</span>
                    <span className="text-black dark:text-white font-medium text-sm">{site.url}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-black dark:text-white font-bold">{site.unlockCount}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-400 font-medium uppercase tracking-wider">Unlocks</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Lock Duration Stats */}
        <Card className="p-5 pb-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm break-inside-avoid">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-black dark:text-white" />
            Average Lock Duration
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sites.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "#E5E7EB"} vertical={false} />
                <ReferenceLine y={90} stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "#E5E7EB"} strokeDasharray="3 3" />
                <XAxis
                  dataKey="url"
                  stroke="#9CA3AF"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tick={{ fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 30, 60, 90, 120]}
                  domain={[0, 120]}
                />
                <Tooltip
                  cursor={{ fill: isDark ? '#222222' : '#F3F4F6', opacity: 0.8 }}
                  contentStyle={{ backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF", border: isDark ? "1px solid #2A2A2A" : "1px solid #E5E7EB", borderRadius: "12px", color: isDark ? "#FFFFFF" : "#111827", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: isDark ? '#D1D5DB' : '#374151' }}
                  formatter={(value) => [`${value} min`, "Duration"]}
                />
                <Bar
                  dataKey="avgLockDuration"
                  fill={isDark ? "#FFFFFF" : "#000000"}
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {sites.slice(0, 6).map((_entry, index) => (
                    <Cell 
                      key={`bar-cell-${index}`} 
                      fill={isDark ? (index % 2 === 0 ? "#FFFFFF" : "#6B7280") : (index % 2 === 0 ? "#000000" : "#374151")}
                      className="transition-all duration-300 cursor-pointer" 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Achievement Badges */}
      <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-black dark:text-white" />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 hover:border-gray-300 dark:border-[#333] transition-colors">
            <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
            <h4 className="font-semibold text-black dark:text-white">Week Warrior</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">7 days streak</p>
          </div>
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 hover:border-gray-300 dark:border-[#333] transition-colors">
            <Shield className="w-8 h-8 text-black dark:text-white mb-3" />
            <h4 className="font-semibold text-black dark:text-white">Lock Master</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">100 sites locked</p>
          </div>
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 hover:border-gray-300 dark:border-[#333] transition-colors">
            <Target className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-semibold text-black dark:text-white">Focus Champion</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">30 challenges completed</p>
          </div>
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 hover:border-gray-300 dark:border-[#333] transition-colors">
            <Flame className="w-8 h-8 text-orange-500 mb-3" />
            <h4 className="font-semibold text-black dark:text-white">Streak Legend</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">30 days streak</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
