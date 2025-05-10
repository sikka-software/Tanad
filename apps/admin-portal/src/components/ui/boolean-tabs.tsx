import { motion, type Transition } from "motion/react";
import * as React from "react";

import {
  MotionHighlight,
  MotionHighlightItem,
} from "@/components/animate-ui/effects/motion-highlight";

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

  // MotionHighlight expects a string value for its active item
  const activeStringValue = activeValue ? "true" : "false";

  const transition: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
  };

  // Base styles copied from TabsTrigger for consistent appearance
  const baseButtonStyles =
    "inline-flex cursor-pointer items-center size-full justify-center whitespace-nowrap rounded-sm px-2 py-1 text-sm font-medium ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground z-[1]";

  return (
    <MotionHighlight
      controlledItems
      className={cn("bg-background rounded-sm shadow-sm", containerClassName)}
      value={activeStringValue}
      transition={transition}
    >
      <div
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[4px]", // Default h-9, w-fit. p-[4px] from TabsList
          listClassName, // User can override to h-9 w-full, etc.
        )}
      >
        <MotionHighlightItem value="true" className="size-full">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => handleValueChange(true)}
            data-state={activeValue === true ? "active" : "inactive"}
            className={cn(baseButtonStyles, buttonClassName, trueButtonClassName)}
          >
            {trueText}
          </motion.button>
        </MotionHighlightItem>
        <MotionHighlightItem value="false" className="size-full">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => handleValueChange(false)}
            data-state={activeValue === false ? "active" : "inactive"}
            className={cn(baseButtonStyles, buttonClassName, falseButtonClassName)}
          >
            {falseText}
          </motion.button>
        </MotionHighlightItem>
      </div>
    </MotionHighlight>
  );
};

export default BooleanTabs;
