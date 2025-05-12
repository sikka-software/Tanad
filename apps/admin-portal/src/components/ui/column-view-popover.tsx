import { Eye } from "lucide-react";

import { DropdownMenuCheckbox } from "./dropdown-menu-checkbox";
import IconButton from "./icon-button";
import { ExtendedColumnDef } from "./sheet-table";

import { VisibilityState, Updater } from "@tanstack/react-table";

type ColumnViewPopoverProps = {
  columns: ExtendedColumnDef<any>[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void;
};

const ColumnViewPopover = ({ columns, columnVisibility, onColumnVisibilityChange }: ColumnViewPopoverProps) => {
  return (
    <div>
      <DropdownMenuCheckbox
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
        <IconButton icon={<Eye className="h-4 w-4" />} label="Columns" />
      </DropdownMenuCheckbox>
    </div>
  );
};

export default ColumnViewPopover;
