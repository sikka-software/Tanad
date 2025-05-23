import * as React from "react";

import { cn } from "@/lib/utils";

// Define the shape of each option
interface Option<T extends string | number> {
  value: T;
  label: string;
  className?: string; // Optional className for individual buttons
}

interface OptionsTabsProps<T extends string | number> {
  options: Option<T>[];
  defaultValue?: T;
  value?: T;
  onValueChange?: (newValue: T) => void;
  containerClassName?: string; // For the root element
  listClassName?: string; // For the inner div that groups the buttons
  buttonClassName?: string; // Common className for all buttons
  activeButtonClassName?: string; // className for the active button
  inactiveButtonClassName?: string; // className for inactive buttons
  disabled?: boolean;
}

const OptionsTabs = <T extends string | number>({
  options,
  defaultValue,
  value,
  onValueChange,
  containerClassName,
  listClassName,
  buttonClassName,
  activeButtonClassName,
  inactiveButtonClassName,
  disabled,
}: OptionsTabsProps<T>) => {
  const [internalActiveValue, setInternalActiveValue] = React.useState<T | undefined>(defaultValue ?? options[0]?.value);

  const isControlled = value !== undefined;
  const activeValue = isControlled ? value! : internalActiveValue;

  const handleValueChange = (val: T) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalActiveValue(val);
    }
    onValueChange?.(val);
  };

  const baseButtonStyles =
    "inline-flex cursor-pointer items-center size-full justify-center whitespace-nowrap rounded-sm px-2 py-1 text-sm font-medium ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-[1]";

  return (
    <div className={cn("bg-input-background", containerClassName)}>
      <div
        className={cn(
          "border-input text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-md border p-[4px]",
          listClassName,
        )}
      >
        {options.map((option) => (
          <div className="size-full" key={String(option.value)}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleValueChange(option.value)}
              data-state={activeValue === option.value ? "active" : "inactive"}
              className={cn(
                baseButtonStyles,
                buttonClassName,
                option.className,
                activeValue === option.value
                  ? activeButtonClassName ?? "text-primary-foreground bg-primary"
                  : inactiveButtonClassName
              )}
            >
              {option.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionsTabs;
