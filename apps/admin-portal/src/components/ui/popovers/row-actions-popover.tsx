"use client";

import { Archive, Copy, Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

interface RowActionsPopoverProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  texts?: {
    edit?: string;
    duplicate?: string;
    view?: string;
    archive?: string;
    delete?: string;
    preview?: string;
  };
}
const RowActionsPopover = ({
  onEdit,
  onDuplicate,
  onView,
  onArchive,
  onDelete,
  onPreview,
  texts,
}: RowActionsPopoverProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  let buttonClasses =
    "focus-visible:ring-ring cursor-pointer rounded-inner-1 flex flex-row items-center justify-start p-0 px-2 h-8 gap-2 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex h-full min-h-8 w-full cursor-pointer flex-col items-center justify-center">
          <MoreVertical className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        className="flex max-w-24 flex-col p-1"
        align="center"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {onPreview && (
          <Button
            onClick={onPreview}
            variant="ghost"
            className={buttonClasses}
            size="default"
            type="button"
          >
            <Eye className="size-4" />
            {t("General.preview")}
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            className={buttonClasses}
            size="default"
            type="button"
          >
            <Edit className="size-4" />
            <span>{t("General.edit")}</span>
          </Button>
        )}

        {onDuplicate && (
          <Button
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
            variant="ghost"
            className={buttonClasses}
            size="default"
            type="button"
          >
            <Copy className="size-4" />
            {t("General.duplicate")}
          </Button>
        )}

        {onView && (
          <Button
            onClick={onView}
            variant="ghost"
            className={buttonClasses}
            size="default"
            type="button"
          >
            <Eye className="size-4" />
            {t("General.view")}
          </Button>
        )}
        {onArchive && (
          <Button
            onClick={onArchive}
            variant="ghost"
            className={buttonClasses}
            size="default"
            type="button"
          >
            <Archive className="size-4" />
            {t("General.archive")}
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            className={buttonClasses}
            size="default"
            type="button"
          >
            <Trash2 className="text-destructive size-4" />
            {t("General.delete")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default RowActionsPopover;
