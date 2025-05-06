"use client";

import {
  Archive,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Copy,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";

import { SortableColumn } from "@/types/common.type";

import IconButton from "./icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex h-full min-h-8 w-full flex-col items-center justify-center">
          <MoreVertical className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        className="flex max-w-30 flex-col p-0"
        align="center"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            className="flex flex-row items-center justify-start gap-2"
            size="default"
            type="button"
          >
            <Trash2 className="size-4" />
            {t("General.delete")}
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            className="flex flex-row items-center justify-start gap-2"
            size="default"
            type="button"
          >
            <Edit className="size-4" />
            <span>{t("General.edit")}</span>
          </Button>
        )}
        {onDuplicate && (
          <Button
            onClick={onDuplicate}
            variant="ghost"
            className="flex flex-row items-center justify-start gap-2"
            size="default"
            type="button"
          >
            <Copy className="size-4" />
            {t("General.duplicate")}
          </Button>
        )}
        {onPreview && (
          <Button
            onClick={onPreview}
            variant="ghost"
            className="flex flex-row items-center justify-start gap-2"
            size="default"
            type="button"
          >
            <Eye className="size-4" />
            {t("General.preview")}
          </Button>
        )}
        {onView && (
          <Button
            onClick={onView}
            variant="ghost"
            className="flex flex-row items-center justify-start gap-2"
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
            className="flex flex-row items-center justify-start gap-2"
            size="default"
            type="button"
          >
            <Archive className="size-4" />
            {t("General.archive")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default RowActionsPopover;
