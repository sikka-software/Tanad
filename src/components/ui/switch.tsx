import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:translate-x-0 rtl:data-[state=unchecked]:-translate-x-5",
      )}
    />
  </SwitchPrimitives.Root>
));
const SquareSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[31px] w-[52px] shrink-0 cursor-pointer items-center rounded border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[27px] w-[28px] rounded bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:translate-x-0 rtl:data-[state=unchecked]:-translate-x-5",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
SquareSwitch.displayName = SwitchPrimitives.Root.displayName;
const LTRSquareSwitch = (props: {
  id: string;
  is_enabled: boolean;
  enabled_text: string;
  disabled_text: string;
  handleToggleEnabled: (checked: boolean) => void;
}) => (
  <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
    <Switch
      id={props.id}
      checked={props.is_enabled}
      onCheckedChange={props.handleToggleEnabled}
      className="peer absolute inset-0 h-[inherit] w-auto rounded data-[state=unchecked]:bg-input/50 [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:rounded [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&_span]:translate-x-full rtl:data-[state=checked]:[&_span]:-translate-x-full"
    />
    <span className="min-w-78flex pointer-events-none relative ms-0.5 items-center justify-center px-2 text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full rtl:peer-data-[state=unchecked]:-translate-x-full">
      <span className="text-[10px] font-medium uppercase ">
        {props.disabled_text}
      </span>
    </span>
    <span className="min-w-78flex pointer-events-none relative me-0.5 items-center justify-center px-2 text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=unchecked]:invisible peer-data-[state=checked]:-translate-x-full peer-data-[state=checked]:text-background rtl:peer-data-[state=checked]:translate-x-full">
      <span className="text-[10px] font-medium uppercase ">
        {props.enabled_text}
      </span>
    </span>
  </div>
);

const RTLSquareSwitch = (props: {
  id: string;
  is_enabled: boolean;
  handleToggleEnabled: (checked: boolean) => void;
  enabled_text: string;
  disabled_text: string;
}) => (
  <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
    <Switch
      id={props.id}
      checked={props.is_enabled}
      onCheckedChange={props.handleToggleEnabled}
      className="peer absolute inset-0 h-[inherit] w-auto rounded data-[state=unchecked]:bg-input/50 [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:rounded [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=unchecked]:[&_span]:translate-x-[100%] rtl:data-[state=unchecked]:[&_span]:-translate-x-[100%]"
    />
    <span className="min-w-78 flex pointer-events-none relative ms-0.5 items-center justify-center px-2 text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=unchecked]:invisible peer-data-[state=checked]:translate-x-full rtl:peer-data-[state=checked]:-translate-x-full peer-data-[state=checked]:text-background">
      <span className="text-[10px] font-medium uppercase ">
        {props.enabled_text}
      </span>
    </span>
    <span className="min-w-78 flex pointer-events-none relative me-0.5 items-center justify-center px-2 text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:-translate-x-full peer-data-[state=checked]:text-background rtl:peer-data-[state=unchecked]:translate-x-full">
      <span className="text-[10px] font-medium uppercase ">
        {props.disabled_text}
      </span>
    </span>
  </div>
);
export { Switch, SquareSwitch, LTRSquareSwitch, RTLSquareSwitch };
