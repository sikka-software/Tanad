import { Eye } from "lucide-react";

import IconButton from "./icon-button";

const ColumnViewPopover = () => {
  return (
    <div>
      <IconButton icon={<Eye className="h-4 w-4" />} label="Columns" />
    </div>
  );
};

export default ColumnViewPopover;
