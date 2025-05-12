import { VisibilityState, Updater } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { DropdownMenuCheckbox } from "./dropdown-menu-checkbox";
import IconButton from "./icon-button";
import { ExtendedColumnDef } from "./sheet-table";

type ColumnViewPopoverProps = {
  columns: ExtendedColumnDef<any>[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void;
};

const ColumnViewPopover = ({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnViewPopoverProps) => {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div>
      <DropdownMenuCheckbox
        dir={locale === "ar" ? "rtl" : "ltr"}
        menuLabel={t("General.columns")}
        items={columns.map((column) => {
          const key = column.id || column.accessorKey || "";
          return {
            label: column.header?.toString() || key,
            checked: columnVisibility[key] !== false,
            onCheckedChange: (checked) => {
              onColumnVisibilityChange((old: VisibilityState) => ({
                ...old,
                [key]: Boolean(checked),
              }));
            },
          };
        })}
      >
        <IconButton icon={<Eye className="h-4 w-4" />} label={t("General.columns")} />
      </DropdownMenuCheckbox>
    </div>
  );
};

export default ColumnViewPopover;
