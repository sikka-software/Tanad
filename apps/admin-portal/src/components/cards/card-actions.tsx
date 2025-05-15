import { Archive, Copy, Edit, Eye, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import IconButton from "@/ui/icon-button";

import { useMediaQuery } from "@/hooks/use-media-query";

import { cn } from "@/lib/utils";

import CardActionsPopover from "./card-actions-popover";

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
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const commonClasses =
    "translate-y-1 opacity-0 !size-8 !min-size-8 transition-all group-hover:translate-y-0 group-hover:opacity-100 @sm/module-card:hidden";
  return (
    <div className="flex items-center justify-end gap-1">
      {onPreview && (
        <IconButton
          icon={<Eye />}
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onPreview}
          label={t("General.preview")}
          className={cn(commonClasses, "duration-300")}
        />
      )}
      {onEdit && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onEdit}
          icon={<Edit />}
          label={t("General.edit")}
          className={cn(commonClasses, "duration-400")}
        />
      )}
      {onDuplicate && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onDuplicate}
          icon={<Copy />}
          label={t("General.duplicate")}
          className={cn(commonClasses, "duration-500")}
        />
      )}
      {onView && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onView}
          icon={<Eye className="size-4" />}
          label={t("General.view")}
          className={cn(commonClasses, "duration-600")}
        />
      )}
      {onArchive && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onArchive}
          icon={<Archive className="size-4" />}
          label={t("General.archive")}
          className={cn(commonClasses, "duration-700")}
        />
      )}
      {onDelete && (
        <IconButton
          dir={lang === "ar" ? "rtl" : "ltr"}
          variant="outline"
          onClick={onDelete}
          icon={<Trash2 className="text-destructive" />}
          label={t("General.delete")}
          className={cn(commonClasses, "duration-800")}
        />
      )}
      {/* {isMobile && ( */}
      <div className="hidden @sm/module-card:block">
        <CardActionsPopover
          onPreview={onPreview}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onView={onView}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </div>
      {/* )} */}
    </div>
  );
};

export default CardActions;
