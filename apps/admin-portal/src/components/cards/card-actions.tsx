import { Archive, Copy, Edit, EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/ui/button";

import IconButton from "../ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const CardActions = ({
  onEdit,
  onDuplicate,
  onView,
  onArchive,
  onDelete,
  onPreview,
}: {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}) => {
  const t = useTranslations();
  const lang = useLocale();
  return (
    <div className="flex items-center gap-1">
      {onPreview && (
        <IconButton
          icon={<Eye />}
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onPreview}
          label={t("General.preview")}
          className="translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        />
      )}
      {onEdit && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onEdit}
          icon={<Edit />}
          label={t("General.edit")}
          className="translate-y-1 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
        />
      )}

      {onDuplicate && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onDuplicate}
          icon={<Copy />}
          label={t("General.duplicate")}
          className="translate-y-1 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        />
      )}

      {onView && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onView}
          icon={<Eye className="size-4" />}
          label={t("General.view")}
          className="translate-y-1 opacity-0 transition-all duration-600 group-hover:translate-y-0 group-hover:opacity-100"
        />
      )}
      {onArchive && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onArchive}
          icon={<Archive className="size-4" />}
          label={t("General.archive")}
          className="translate-y-1 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100"
        />
      )}
      {onDelete && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onDelete}
          icon={<Trash2 className="text-destructive" />}
          label={t("General.delete")}
          className="translate-y-1 opacity-0 transition-all duration-800 group-hover:translate-y-0 group-hover:opacity-100"
        />
      )}
    </div>
  );
};

export default CardActions;
