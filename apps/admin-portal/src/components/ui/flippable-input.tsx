import { PilcrowLeft } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

function FlippableInput({
  className,
  canFlipDirection = true,
  type,
  ...props
}: React.ComponentProps<"input"> & { canFlipDirection?: boolean }) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div className="relative">
      <div className={cn("absolute top-0.5 h-10 w-10", isFlipped ? "-end-1.5" : "start-0.5")}>
        <Button variant="outline" size="icon_sm" onClick={() => setIsFlipped(!isFlipped)}>
          <PilcrowLeft className="text-muted-foreground" />
        </Button>
      </div>
      <input
        dir={isFlipped ? "rtl" : "ltr"}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { FlippableInput };
