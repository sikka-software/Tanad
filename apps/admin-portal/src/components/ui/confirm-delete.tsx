import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";

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
    <AlertDialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => {
        if (!isDeleting) {
          setIsDeleteDialogOpen(open);
        }
      }}
    >
      <AlertDialogContent dir={locale === "ar" ? "rtl" : "ltr"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("General.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("General.deleting")}
              </>
            ) : (
              t("General.delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDelete;
