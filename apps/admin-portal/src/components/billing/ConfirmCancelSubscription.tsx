import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmCancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCanceling: boolean;
  onConfirm: () => Promise<void>;
}

export function ConfirmCancelSubscriptionDialog({
  open,
  onOpenChange,
  isCanceling,
  onConfirm,
}: ConfirmCancelSubscriptionDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            {t("Billing.cancel_subscription.title", { fallback: "إلغاء الاشتراك" })}
          </DialogTitle>
          <DialogDescription>
            {t("Billing.cancel_subscription.description", {
              fallback:
                "هل أنت متأكد من رغبتك في إلغاء اشتراكك؟ ستفقد الوصول إلى الميزات المتقدمة في نهاية فترة الفوترة الحالية.",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            {t("Billing.cancel_subscription.cancel", { fallback: "الاحتفاظ بالاشتراك" })}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isCanceling}>
            {isCanceling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("canceling", { fallback: "جاري الإلغاء..." })}
              </>
            ) : (
              t("Billing.cancel_subscription.confirm", { fallback: "نعم، إلغاء" })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
