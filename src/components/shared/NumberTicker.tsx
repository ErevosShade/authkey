import type { FC } from "react";

interface NumberTickerProps {
  value: number | string;
  className?: string;
}

export const NumberTicker: FC<NumberTickerProps> = ({ value, className = "" }) => {
  return (
    <div
      className={`font-sans text-2xl sm:text-4xl font-bold text-black dark:text-white tracking-tight ${className}`}
    >
      {value.toString().padStart(2, "0")}
    </div>
  );
};

export default NumberTicker;
