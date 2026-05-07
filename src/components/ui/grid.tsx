import { cn } from "@/lib/utils";
import React from "react";

export function GridSmallBackground({ children ,className="" ,classInnerName="" }: { children: React.ReactNode ,className?: string ,classInnerName?: string }) {
  return (
    <div className={`relative flex h-150 w-100 items-center justify-center bg-black  ${className}`}>
      <div
        className={cn(
          "absolute inset-0 z-0",
          "[background-size:20px_20px]",
          "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className={`relative z-10  ${classInnerName}`}>
        {children}
      </div>
    </div>
  );
}
