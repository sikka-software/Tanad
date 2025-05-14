"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  thumbIcon?: React.ReactNode;
  loading?: boolean;
};

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, leftIcon, rightIcon, thumbIcon, onCheckedChange, loading, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(
      props?.checked ?? props?.defaultChecked ?? false,
    );
    const [isTapped, setIsTapped] = React.useState(false);

    React.useEffect(() => {
      if (props?.checked !== undefined) setIsChecked(props.checked);
    }, [props?.checked]);

    const handleChange = React.useCallback(
      (checked: boolean) => {
        setIsChecked(checked);
        onCheckedChange?.(checked);
      },
      [onCheckedChange],
    );

    return (
      <SwitchPrimitives.Root {...props} onCheckedChange={handleChange} asChild>
        <motion.button
          ref={ref}
          className={cn(
            "focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-input relative flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:justify-end data-[state=unchecked]:justify-start",
            className,
          )}
          whileTap="tap"
          initial={false}
          onTapStart={() => setIsTapped(true)}
          onTapCancel={() => setIsTapped(false)}
          onTap={() => setIsTapped(false)}
        >
          {leftIcon && (
            <motion.div
              animate={isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0 }}
              className="absolute top-1/2 left-1 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 [&_svg]:size-3"
            >
              {typeof leftIcon !== "string" ? leftIcon : null}
            </motion.div>
          )}

          {rightIcon && (
            <motion.div
              animate={isChecked ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0 }}
              className="absolute top-1/2 right-1 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 [&_svg]:size-3"
            >
              {typeof rightIcon !== "string" ? rightIcon : null}
            </motion.div>
          )}

          {!loading && (
            <SwitchPrimitives.Thumb asChild>
              <motion.div
                whileTap="tab"
                className={cn(
                  "bg-background relative z-[1] flex items-center justify-center rounded-full text-neutral-500 shadow-lg ring-0 dark:text-neutral-400 [&_svg]:size-3",
                )}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  width: 18,
                  height: 18,
                }}
                animate={
                  isTapped
                    ? { width: 21, transition: { duration: 0.1 } }
                    : { width: 18, transition: { duration: 0.1 } }
                }
              >
                {thumbIcon && typeof thumbIcon !== "string" ? thumbIcon : null}
              </motion.div>
            </SwitchPrimitives.Thumb>
          )}
        </motion.button>
      </SwitchPrimitives.Root>
    );
  },
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch, type SwitchProps };
