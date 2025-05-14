import { Archive, Copy, Edit, EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const CardActionsPopover = ({
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
    <div>
      <Popover>
        <PopoverTrigger>
          <Button variant="outline" size="icon_sm">
            <EllipsisVertical className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={lang === "ar" ? "start" : "end"}
          className="flex max-w-fit flex-col p-1"
        >
          {onPreview && (
            <Button
              dir={lang === "ar" ? "rtl" : "ltr"}
              variant="ghost"
              onClick={onPreview}
              className="bg-400 justify-start"
            >
              <Eye className="size-4" />
              <span>{t("General.preview")}</span>
            </Button>
          )}
          {onEdit && (
            <Button
              dir={lang === "ar" ? "rtl" : "ltr"}
              variant="ghost"
              onClick={onEdit}
              className="bg-400 justify-start"
            >
              <Edit className="size-4" />
              <span>{t("General.edit")}</span>
            </Button>
          )}

          {onDuplicate && (
            <Button
              dir={lang === "ar" ? "rtl" : "ltr"}
              variant="ghost"
              onClick={onDuplicate}
              className="bg-400 justify-start"
            >
              <Copy className="size-4" />
              <span>{t("General.duplicate")}</span>
            </Button>
          )}

          {onView && (
            <Button
              dir={lang === "ar" ? "rtl" : "ltr"}
              variant="ghost"
              onClick={onView}
              className="bg-400 justify-start"
            >
              <Eye className="size-4" />
              <span>{t("General.view")}</span>
            </Button>
          )}
          {onArchive && (
            <Button
              dir={lang === "ar" ? "rtl" : "ltr"}
              variant="ghost"
              onClick={onArchive}
              className="bg-400 justify-start"
            >
              <Archive className="size-4" />
              <span>{t("General.archive")}</span>
            </Button>
          )}
          {onDelete && (
            <Button
              dir={lang === "ar" ? "rtl" : "ltr"}
              variant="ghost"
              onClick={onDelete}
              className="bg-400 justify-start"
            >
              <Trash2 className="text-destructive size-4" />
              <span>{t("General.delete")}</span>
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CardActionsPopover;
