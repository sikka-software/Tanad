import { Eye } from "lucide-react";

import { DropdownMenuCheckbox } from "./dropdown-menu-checkbox";
import IconButton from "./icon-button";
import { ExtendedColumnDef } from "./sheet-table";

const ColumnViewPopover = ({ columns }: { columns: ExtendedColumnDef<any>[] }) => {
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
