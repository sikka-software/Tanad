import { CommonStatus, CommonStatusProps } from "@root/src/types/common.type";
import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const CardStatusAction = ({
  currentStatus,
  statuses,
  moduleName,
  onStatusChange,
}: {
  currentStatus: CommonStatusProps;
  statuses: CommonStatusProps[];
  moduleName: string;
  onStatusChange: (status: CommonStatusProps) => void;
}) => {
  const t = useTranslations();
  const lang = useLocale();

  const statusTranslationKey = (status: CommonStatusProps) =>
    moduleName === "Forms"
      ? t(`${moduleName}.status.${status}`)
      : t(`${moduleName}.form.status.${status}`);
  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <Button variant="outline" size="sm">
            {statusTranslationKey(currentStatus)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={lang === "ar" ? "start" : "end"}
          className="flex max-w-fit flex-col p-1"
        >
          {statuses &&
            statuses.map((status, i) => (
              <Button
                key={i}
                dir={lang === "ar" ? "rtl" : "ltr"}
                variant="ghost"
                onClick={() => onStatusChange(status)}
                className="bg-400 justify-start"
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
