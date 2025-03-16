import { Check, Zap } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
//  UI
import {
  DialogTitle,
  DialogHeader,
  DialogContent,
  Dialog,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
};

const UpgradeDialog = ({
  open,
  onOpenChange,
  onUpgrade,
}: UpgradeDialogProps) => {
  const t = useTranslations();
  const lang = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle>{t("Billing.upgrade_dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("Billing.upgrade_dialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-primary" />
            <span>{t("Billing.upgrade_dialog.unlimited_puklas")}</span>
          </div>
          <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-primary" />
            <span>{t("Billing.upgrade_dialog.custom_design_and_colors")}</span>
          </div>
          <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-primary" />
            <span>{t("Billing.upgrade_dialog.advanced_analytics")}</span>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onUpgrade}>
            <Zap className="me-2 h-4 w-4" />
            {t("Billing.upgrade_now")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
