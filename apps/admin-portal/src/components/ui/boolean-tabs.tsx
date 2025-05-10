import * as React from "react";

import { cn } from "@/lib/utils";

interface BooleanTabsProps {
  trueText: string;
  falseText: string;
  defaultValue?: boolean;
  value?: boolean;
  onValueChange?: (newValue: boolean) => void;
  containerClassName?: string; // For MotionHighlight root element
  listClassName?: string; // For the inner div that groups the buttons
  buttonClassName?: string; // Common className for both buttons
  trueButtonClassName?: string; // Additional className for the "true" button
  falseButtonClassName?: string; // Additional className for the "false" button
}

const BooleanTabs = ({
  trueText,
  falseText,
  defaultValue = true,
  value,
  onValueChange,
  containerClassName,
  listClassName,
  buttonClassName,
  trueButtonClassName,
  falseButtonClassName,
}: BooleanTabsProps) => {
  const [internalActiveValue, setInternalActiveValue] = React.useState(defaultValue);

  const isControlled = value !== undefined;
  const activeValue = isControlled ? value! : internalActiveValue;

  const handleValueChange = (val: boolean) => {
    if (!isControlled) {
      setInternalActiveValue(val);
    }
    onValueChange?.(val);
  };

  const baseButtonStyles =
    "inline-flex cursor-pointer items-center size-full justify-center whitespace-nowrap rounded px-2 py-1 text-sm font-medium ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground [state=active]:bg-secondary z-[1]";

  return (
    <div className={cn("bg-background rounded-md", containerClassName)}>
      <div
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-md p-[4px]",
          listClassName,
        )}
      >
        <div className="size-full">
          <button
            type="button"
            onClick={() => handleValueChange(true)}
            data-state={activeValue === true ? "active" : "inactive"}
            className={cn(baseButtonStyles, buttonClassName, trueButtonClassName)}
          >
            {trueText}
          </button>
        </div>
        <div className="size-full">
          <button
            type="button"
            onClick={() => handleValueChange(false)}
            data-state={activeValue === false ? "active" : "inactive"}
            className={cn(baseButtonStyles, buttonClassName, falseButtonClassName)}
          >
            {falseText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BooleanTabs;
