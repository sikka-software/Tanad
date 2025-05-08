import React from "react";

import { cn } from "@/lib/utils";

export type ChipColors =
  | "green"
  | "blue"
  | "red"
  | "yellow"
  | "orange"
  | "purple"
  | "cyan"
  | "hyper"
  | "oceanic";

export type ChipTypes = React.HTMLAttributes<HTMLSpanElement> & {
  /** The text inside the chip */
  label: string;
  /** The small icon before the chip label  */
  icon?: React.JSX.Element;
  /** The color of the chip, must be a tailwind color */
  color?: ChipColors;
  /** The size of the chip */
  size?: "small" | "normal" | "large";
  /** Enable/Disable the dot before the label of the chip */
  dot?: boolean;
  /** Red/Green dot next to the label of the chip indicating online/offline or available/unavailable */
  dotStatus?: "available" | "unavailable" | "none";
  radius?: "full" | "inherit" | "none";
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipTypes>(
  (
    { label, size = "normal", icon, color, radius = "inherit", dot, dotStatus = "none", ...rest },
    ref,
  ) => {
    let defaultStyles = "flex flex-row w-fit gap-1 items-center  px-2.5 py-1  font-bold ";
    let radiusStyles = {
      inherit: " rounded",
      full: "rounded-full",
      none: "rounded-none",
    };
    let sizeStyles = {
      small: "h-[15px] leading-4 px-0 py-0 text-[9px] gap-0.5 ",
      normal: "h-fit text-xs",
      large: "text-base",
    };
    let dotStyles = {
      small: "flex h-1 w-1 rounded-full",
      normal: "flex h-2 w-2 rounded-full",
      large: "flex h-3 w-3 rounded-full",
    };
    let dotStatusStyles = {
      none: "bg-gray-500 dark:bg-gray-800",
      available: "bg-green-500",
      unavailable: "bg-red-500",
    };
    let colorStyles: any = {
      green: "bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-200",
      blue: "bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-100",
      red: "bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100",
      yellow: "bg-yellow-200 text-yellow-700 dark:bg-yellow-600 dark:text-black",
      orange: "bg-orange-200 text-orange-700 dark:bg-orange-700 dark:text-orange-100",
      purple: "bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-100",
      cyan: "bg-cyan-200 text-cyan-700 dark:bg-cyan-700 dark:text-cyan-100",
      hyper:
        "text-white dark:text-black bg-gradient-to-tl from-pink-500 via-red-500 to-yellow-500 ",
      oceanic:
        "text-white dark:text-black bg-gradient-to-bl from-green-300 via-blue-500 to-purple-600",
    };
    if (label) {
      return (
        <span
          {...rest}
          ref={ref}
          className={cn(
            defaultStyles,
            sizeStyles[size],
            radiusStyles[radius],
            color ? colorStyles[color] : "border bg-none",
            rest.className,
            "p-2",
          )}
        >
          {dot && <span className={cn(dotStyles[size], dotStatusStyles[dotStatus])}></span>}
          {icon && icon}
          {label}
        </span>
      );
    } else {
      return (
        <span
          {...rest}
          ref={ref}
          className={cn("h-2 w-2 rounded-full", color ? colorStyles[color] : "border bg-none")}
        ></span>
      );
    }
  },
);
