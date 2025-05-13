import { useLocale, useTranslations } from "next-intl";

import { CommandSelect } from "@/ui/command-select";

import { cn } from "@/lib/utils";

const StatusCell = ({
  status,
  statusOptions,
  onStatusChange,
}: {
  status: string;
  statusOptions: { label: string; value: string }[];
  onStatusChange: (value: string) => void;
}) => {
  const lang = useLocale();
  const t = useTranslations();
  return (
    <div>
      <CommandSelect
        dir={lang === "ar" ? "rtl" : "ltr"}
        data={statusOptions}
        inCell
        isLoading={false}
        defaultValue={String(status)}
        popoverClassName="w-full max-w-full"
        buttonClassName="p-0 w-full max-w-full !min-w-full"
        placeholderClassName="w-full p-0"
        valueKey="value"
        labelKey="label"
        onChange={onStatusChange}
        texts={{ placeholder: ". . ." }}
        renderSelected={(item) => {
          return (
            <div className="flex h-full w-full items-center justify-start gap-2 p-0 !px-2 text-center text-xs transition-colors">
              <div
                className={cn("size-3 rounded-full", {
                  "text-primary bg-green-400 dark:bg-green-500": item.value === "active",
                  "text-primary bg-red-600 dark:bg-red-500": item.value === "inactive",
                })}
              />
              {item.label}
            </div>
          );
        }}
        ariaInvalid={false}
      />
    </div>
  );
};

export default StatusCell;
