import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./inputs/input";

interface ConfirmDeleteProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isDeleting: boolean;
  handleConfirmDelete: (options?: { cascade?: boolean }) => void;
  title: string;
  description: string;
  extraConfirm?: boolean;
  onCancel?: () => void;
  children?: React.ReactNode;
  showCascadeOption?: boolean;
  cascadeDescription?: string;
}

const ConfirmDelete = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isDeleting,
  handleConfirmDelete,
  title,
  description,
  extraConfirm,
  onCancel,
  children,
  showCascadeOption,
  cascadeDescription,
}: ConfirmDeleteProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [confirmText, setConfirmText] = useState("");
  const [cascadeDelete, setCascadeDelete] = useState(false);

  const confirmString = locale === "ar" ? "نعم" : "confirm";

  return (
    <Dialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => {
        if (!isDeleting) {
          setIsDeleteDialogOpen(open);
          setCascadeDelete(false);
          setConfirmText("");
        }
        if (!open) {
          onCancel?.();
        }
      }}
    >
      <DialogContent dir={locale === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {extraConfirm && (
          <>
            <DialogDescription>
              {t("General.extra_confirm_typed", { confirmString: confirmString })}
            </DialogDescription>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t("General.yes")}
            />
          </>
        )}
        {showCascadeOption && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cascade"
              checked={cascadeDelete}
              onCheckedChange={(checked) => setCascadeDelete(checked as boolean)}
            />
            <label
              htmlFor="cascade"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {cascadeDescription || t("General.cascade_delete")}
            </label>
          </div>
        )}
        {children && children}
        <DialogFooter className="!flex !flex-row !items-center !justify-between md:!justify-end">
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              onCancel?.();
            }}
            disabled={isDeleting}
          >
            {t("General.cancel")}
          </Button>
          <Button
            onClick={() => handleConfirmDelete({ cascade: cascadeDelete })}
            disabled={isDeleting || (extraConfirm && confirmText !== confirmString)}
            className="bg-destructive hover:bg-destructive/90 min-w-24 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              t("General.delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDelete;
