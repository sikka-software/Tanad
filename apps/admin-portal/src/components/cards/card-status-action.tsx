import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

import { cn } from "@/lib/utils";

interface CardStatusActionProps<T> {
  currentStatus: T;
  statuses: T[];
  parentTranslationKey?: string;
  onStatusChange: (status: T) => void;
}

const CardStatusAction = <T,>({
  currentStatus,
  statuses,
  parentTranslationKey = "Forms",
  onStatusChange,
}: CardStatusActionProps<T>) => {
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);

  const statusTranslationKey = (status: T) =>
    parentTranslationKey === "Forms"
      ? t(`CommonStatus.${status}`)
      : t(`${parentTranslationKey}.form.status.${status}`);
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button variant="outline" size="sm">
            {statusTranslationKey(currentStatus)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={lang === "ar" ? "start" : "end"}
          className="flex max-h-[200px] max-w-fit flex-col overflow-y-auto p-1"
        >
          {statuses &&
            statuses.map((status, i) => (
              <Button
                key={i}
                dir={lang === "ar" ? "rtl" : "ltr"}
                variant="ghost"
                onClick={() => {
                  onStatusChange(status);
                  setOpen(false);
                }}
                className={cn(
                  "bg-400 justify-start",
                  currentStatus === status && "outline-primary outline-2 -outline-offset-2",
                )}
              >
                {currentStatus === status && <Check className="size-4" />}
                <span>{statusTranslationKey(status)}</span>
              </Button>
            ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CardStatusAction;
