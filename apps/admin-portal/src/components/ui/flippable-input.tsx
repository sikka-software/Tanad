import { PilcrowLeft, PilcrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { cn } from "@/lib/utils";

import IconButton from "./icon-button";

function FlippableInput({
  className,
  canFlipDirection = true,
  type,
  ...props
}: React.ComponentProps<"input"> & { canFlipDirection?: boolean }) {
  const locale = useLocale();
  const [isFlipped, setIsFlipped] = React.useState(locale === "ar");
  const [isHovering, setIsHovering] = React.useState(false);
  const t = useTranslations();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence>
        {canFlipDirection && isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, delay: 0.3 }}
            className={cn(
              "absolute top-0.5 h-10 w-10",
              isFlipped ? "start-0.5 rtl:-end-1.5" : "-end-1.5 rtl:start-0.5",
            )}
          >
            <IconButton
              variant="ghost"
              icon={
                isFlipped ? (
                  <PilcrowRight className="text-muted-foreground size-4" />
                ) : (
                  <PilcrowLeft className="text-muted-foreground size-4" />
                )
              }
              label={!isFlipped ? t("General.switch_to_ltr") : t("General.switch_to_rtl")}
              onClick={() => setIsFlipped(!isFlipped)}
              className="size-8"
            />
          </motion.div>
        )}
      </AnimatePresence>
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
