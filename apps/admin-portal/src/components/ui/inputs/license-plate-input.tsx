import { OTPInput, SlotProps } from "input-otp";
import * as React from "react";
import { useId } from "react";
import { FieldError } from "react-hook-form";

import { cn } from "@/lib/utils";

import { useFormField } from "../form";

export default function LicensePlateInput({ className, ...props }: React.ComponentProps<"input">) {
  const generatedId = useId();
  const id = props.id || generatedId;

  const value =
    typeof props.value === "string"
      ? props.value
      : typeof props.value === "number"
        ? String(props.value)
        : "";

  const handleChange = (otpValue: string) => {
    if (props.onChange) {
      (props.onChange as any)(otpValue);
    }
  };

  const maxLength = typeof props.maxLength === "number" ? props.maxLength : 17;

  const { error } = useFormField();

  return (
    <div dir="ltr" className={cn(className)}>
      <div className="flex flex-col items-center justify-center bg--200">
        <div className="flex w-full max-w-[404px] flex-row justify-center rounded-md border-2 border-black bg-blue-200">
          <div className="bg--300 flex w-full max-w-[200px] flex-col items-end">
            <OTPInput
              value={value}
              onChange={handleChange}
              onBlur={props.onBlur}
              disabled={props.disabled}
              name={props.name}
              id={id}
              maxLength={4}
              dir="ltr"
              containerClassName="flex items-center gap-3 has-disabled:opacity-50 w-full "
              render={({ slots }) => (
                <>
                  <div className="flex w-full rounded-md">
                    {slots.map((slot, idx) => (
                      <Slot
                        key={idx}
                        {...slot}
                        className={cn(
                          "bg-input-background",
                          {
                            "!rounded-bl-none": idx === 0 || (idx === 0 && error),
                            "!rounded-r-none": idx === slots.length - 1,
                          },
                          error &&
                            "!ring-destructive dark:!ring-destructive/40 !border-destructive !rounded-b-none border",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            />
            <div className="h-0.5 w-full bg-black" />

            <OTPInput
              value={value}
              onChange={handleChange}
              onBlur={props.onBlur}
              disabled={props.disabled}
              name={props.name}
              id={id}
              maxLength={4}
              dir="ltr"
              containerClassName="flex items-center gap-3 has-disabled:opacity-50 w-full "
              render={({ slots }) => (
                <>
                  <div className="flex w-full rounded-md">
                    {slots.map((slot, idx) => (
                      <Slot
                        key={idx}
                        {...slot}
                        className={cn(
                          "bg-input-background",
                          {
                            "!rounded-bl-none": idx === 0 && error,
                            "!rounded-r-none": idx === slots.length - 1,
                            "!rounded-tl-none": idx === 0,
                          },
                          error &&
                            "!ring-destructive dark:!ring-destructive/40 !border-destructive !rounded-b-none border",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            />
          </div>
          <div className="min-h-full w-1 bg-black" />

          <div className="bg--300 flex w-full max-w-[200px] flex-col items-start">
            <OTPInput
              value={value}
              onChange={handleChange}
              onBlur={props.onBlur}
              disabled={props.disabled}
              name={props.name}
              id={id}
              maxLength={4}
              dir="ltr"
              containerClassName="flex items-center gap-3 has-disabled:opacity-50 w-full "
              render={({ slots }) => (
                <>
                  <div className="flex w-full rounded-md">
                    {slots.map((slot, idx) => (
                      <Slot
                        key={idx}
                        {...slot}
                        className={cn(
                          "bg-input-background",
                          {
                            "!rounded-bl-none": idx === 0 && error,
                            "!rounded-l-none": idx === 0,
                            "!rounded-br-none": idx === slots.length - 1,
                          },
                          error &&
                            "!ring-destructive dark:!ring-destructive/40 !border-destructive !rounded-b-none border",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            />
            <div className="h-0.5 w-full bg-black" />

            <OTPInput
              value={value}
              onChange={handleChange}
              onBlur={props.onBlur}
              disabled={props.disabled}
              name={props.name}
              id={id}
              maxLength={4}
              dir="ltr"
              containerClassName="flex items-center gap-3 has-disabled:opacity-50 w-full "
              render={({ slots }) => (
                <>
                  <div className="flex w-full rounded-md">
                    {slots.map((slot, idx) => (
                      <Slot
                        key={idx}
                        {...slot}
                        className={cn(
                          "bg-input-background",
                          {
                            "!rounded-bl-none": idx === 0 && error,
                            "!rounded-l-none": idx === 0,
                            "!rounded-tr-none": idx === slots.length - 1,
                          },
                          error &&
                            "!ring-destructive dark:!ring-destructive/40 !border-destructive !rounded-b-none border",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type ExtendedSlotProps = SlotProps & {
  className: string;
};

function Slot(props: ExtendedSlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground relative -ms-px flex h-9 w-full items-center justify-center border font-medium shadow-xs transition-[color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive },
        props.className,
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}
