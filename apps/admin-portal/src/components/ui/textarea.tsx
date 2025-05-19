import * as React from "react";

import { cn } from "@/lib/utils";

import { useFormField } from "./form";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { isolated?: boolean }
>(({ className, isolated, ...props }, ref) => {
  const { error } = isolated ? { error: undefined } : useFormField();

  return (
    <textarea
      className={cn(
        "border-input bg-input-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        !props.disabled &&
          "transition-all read-only:cursor-default read-only:rounded-none read-only:border-x-0 read-only:border-t read-only:border-b-0 read-only:ps-0 read-only:shadow-none read-only:focus-visible:ring-0 read-only:focus-visible:outline-none",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:rounded-b-none",

        className,
      )}
      aria-invalid={!!error}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
