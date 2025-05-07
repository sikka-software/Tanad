import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";

import { Button } from "./button";

interface ConfirmDeleteProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isDeleting: boolean;
  handleConfirmDelete: () => void;
  title: string;
  description: string;
}
const ConfirmDelete = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isDeleting,
  handleConfirmDelete,
  title,
  description,
}: ConfirmDeleteProps) => {
  const t = useTranslations();
  const locale = useLocale();
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
        <DialogFooter>
          <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
            {t("General.cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
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
