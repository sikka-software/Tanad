import { Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";

const SelectionMode = ({
  selectedRows,
  clearSelection,
  isDeleting,
  setIsDeleteDialogOpen,
}: {
  selectedRows: string[];
  clearSelection: () => void;
  isDeleting: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
}) => {
  const t = useTranslations();

  return (
    <div className="bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedRows.length} {t("General.items_selected")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearSelection}
          className="flex items-center gap-2"
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
          {t("General.clear")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="flex items-center gap-2"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          {t("General.delete")}
        </Button>
      </div>
    </div>
  );
};

export default SelectionMode;
