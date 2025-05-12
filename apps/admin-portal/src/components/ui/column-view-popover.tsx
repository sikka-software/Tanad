import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { DropdownMenuCheckbox } from "./dropdown-menu-checkbox";
import IconButton from "./icon-button";

const ColumnViewPopover = ({ columns }: { columns: ColumnDef<any>[] }) => {
  return (
    <div>
      <DropdownMenuCheckbox
        items={columns.map((column) => ({
          label: column.header?.toString() || "",
          checked: true,
          onCheckedChange: () => {},
        }))}
      >
        <IconButton icon={<Eye className="h-4 w-4" />} label="Columns" />
      </DropdownMenuCheckbox>
    </div>
  );
};

export default ColumnViewPopover;
