import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  inCell?: boolean;
}

function Input({ className, inCell, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:rounded-b-none",
        !props.disabled &&
          "bg-input-background transition-all read-only:cursor-default read-only:rounded-none read-only:border-x-0 read-only:border-t read-only:border-b-transparent read-only:ps-0 read-only:shadow-none read-only:focus-visible:ring-0 read-only:focus-visible:outline-none",
        inCell && "!h-10 !rounded-none border-0 bg-transparent shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
