import { cn } from "@root/src/lib/utils";
import { useLocale, useTranslations } from "next-intl";

import { CommandSelect } from "../ui/command-select";

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
    <div className="bg-yellow-700">
      <CommandSelect
        dir={lang === "ar" ? "rtl" : "ltr"}
        data={statusOptions}
        inCell
        isLoading={false}
        defaultValue={String(status)}
        popoverClassName="w-full max-w-full"
        buttonClassName="bg-blue-200 p-0 w-full max-w-full !min-w-full"
        placeholderClassName="w-full p-0"
        valueKey="value"
        labelKey="label"
        onChange={onStatusChange}
        texts={{ placeholder: ". . ." }}
        renderSelected={(item) => {
          return (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center bg-green-500 p-0 !px-2 text-center text-xs font-bold",
                {
                  "text-primary bg-green-200 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-700":
                    item.value === "active",
                  "text-primary bg-red-200 hover:bg-red-200 dark:bg-red-700 dark:hover:bg-red-700":
                    item.value === "inactive",
                },
              )}
            >
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
