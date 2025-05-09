import { OTPInput, SlotProps } from "input-otp";
import { useId } from "react";

import { cn } from "@/lib/utils";

export default function DigitsInput({ className, ...props }: React.ComponentProps<"input">) {
  const id = useId();
  return (
    <div dir="ltr">
      <OTPInput
        id={id}
        dir="ltr"
        containerClassName="flex items-center gap-3 has-disabled:opacity-50 w-full"
        maxLength={17}
        render={({ slots }) => (
          <>
            <div className="flex w-full">
              {slots.map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground relative -ms-px flex h-9 w-full items-center justify-center border font-medium shadow-xs transition-[color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}
