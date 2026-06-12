import { useState } from "react";
import type { FC } from "react";
import { Clock, ChevronDown } from "lucide-react";

export const parseTimeTo12Hour = (timeString: string) => {
  if (!timeString) return { hour: "12", minute: "00", period: "AM" };
  const [h24, min] = timeString.split(":");
  let h12 = parseInt(h24, 10);
  const period = h12 >= 12 ? "PM" : "AM";
  h12 = h12 % 12;
  if (h12 === 0) h12 = 12;
  return {
    hour: h12.toString().padStart(2, "0"),
    minute: min || "00",
    period,
  };
};

export const formatTimeFrom12Hour = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour, 10);
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minute}`;
};

interface TimePickerInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export const TimePickerInput: FC<TimePickerInputProps> = ({ 
  label, 
  value, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hour, minute, period } = parseTimeTo12Hour(value);

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutesList = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
  const periodsList = ["AM", "PM"];

  const handleSelect = (newHour: string, newMinute: string, newPeriod: string) => {
    onChange(formatTimeFrom12Hour(newHour, newMinute, newPeriod));
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#333] rounded-lg text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer flex items-center justify-between transition-shadow hover:border-gray-400 dark:hover:border-gray-500 select-none relative"
      >
        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 dark:text-gray-200 pointer-events-none" />
        <span>{value ? `${hour}:${minute} ${period}` : "--:-- --"}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl shadow-lg p-3 flex gap-2 h-56">
            {/* Hours Column */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 text-center sticky top-0 bg-white dark:bg-[#1A1A1A] py-1">Hour</div>
              <div className="space-y-1">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleSelect(h, minute, period)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      h === hour
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "text-black dark:text-white bg-transparent dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#333333]"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 border-l border-r border-gray-100 dark:border-[#2A2A2A] px-1">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 text-center sticky top-0 bg-white dark:bg-[#1A1A1A] py-1">Min</div>
              <div className="space-y-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSelect(hour, m, period)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      m === minute
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "text-black dark:text-white bg-transparent dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#333333]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Column */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 text-center sticky top-0 bg-white dark:bg-[#1A1A1A] py-1">AM/PM</div>
              <div className="space-y-1">
                {periodsList.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSelect(hour, minute, p)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      p === period
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "text-black dark:text-white bg-transparent dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#333333]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimePickerInput;
