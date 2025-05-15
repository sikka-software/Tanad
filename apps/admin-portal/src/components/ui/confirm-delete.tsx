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
import { Input } from "./input";

interface ConfirmDeleteProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isDeleting: boolean;
  handleConfirmDelete: () => void;
  title: string;
  description: string;
  extraConfirm?: boolean;
  onCancel?: () => void;
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
}: ConfirmDeleteProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [confirmText, setConfirmText] = useState("");

  const confirmString = locale === "ar" ? "نعم" : "confirm";

  return (
    <Dialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => {
        if (!isDeleting) {
          setIsDeleteDialogOpen(open);
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
        <DialogFooter>
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
            onClick={handleConfirmDelete}
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
