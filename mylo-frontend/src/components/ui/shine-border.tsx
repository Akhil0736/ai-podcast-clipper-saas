"use client";

import { cn } from "~/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

/**
 * @name Shine Border
 * @description It is an animated background border effect component with easy to use and configurable props.
 */
function ShineBorder({
  borderRadius = 8,
  borderWidth = 2,
  duration = 8,
  color = "#ffc247",
  className,
  children,
}: ShineBorderProps) {
  const colorString = color instanceof Array ? color.join(",") : color;
  
  return (
    <div
      className={cn(
        "shine-border-container relative overflow-hidden",
        className,
      )}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Animated border */}
      <div
        className="shine-border-animation absolute inset-0 z-0"
        style={{
          background: `conic-gradient(from var(--shine-angle, 0deg), transparent 0%, ${colorString}, transparent 20%)`,
          animation: `shine-rotate ${duration}s linear infinite`,
        }}
      />
      {/* Inner content with background */}
      <div
        className="relative z-10 bg-white dark:bg-black"
        style={{
          margin: `${borderWidth}px`,
          borderRadius: `${borderRadius - borderWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export { ShineBorder };
