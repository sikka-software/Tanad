import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  onConfirm: (cancelAtPeriodEnd: boolean) => Promise<void>;
  dir?: "ltr" | "rtl";
}

export function ConfirmCancelSubscriptionDialog({
  open,
  onOpenChange,
  isCanceling,
  onConfirm,
  dir,
}: ConfirmCancelSubscriptionDialogProps) {
  const t = useTranslations();
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);

  const handleConfirm = () => {
    onConfirm(cancelAtPeriodEnd);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={dir}>
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
          <DialogDescription className="text-muted-foreground mt-2 text-sm">
            {cancelAtPeriodEnd
              ? t("Billing.cancel_subscription.features_end_notice", {
                  fallback: "ستظل جميع الميزات متاحة حتى نهاية دورة الفوترة الحالية.",
                })
              : t("Billing.cancel_subscription.immediate_cancellation_notice", {
                  fallback: "سيتم إلغاء اشتراكك على الفور وستفقد الوصول إلى الميزات المتقدمة.",
                })}
          </DialogDescription>
        </DialogHeader>

        <div className={`flex items-center ${dir === "rtl" ? "space-x-reverse" : ""} gap-2 py-4`}>
          <Checkbox
            id="cancel-at-period-end"
            checked={cancelAtPeriodEnd}
            onCheckedChange={(checked) => setCancelAtPeriodEnd(checked as boolean)}
          />
          <label
            htmlFor="cancel-at-period-end"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("Billing.cancel_subscription.cancel_at_period_end", {
              fallback: "إلغاء في نهاية فترة الفوترة الحالية",
            })}
          </label>
        </div>

        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            {t("Billing.cancel_subscription.cancel", { fallback: "الاحتفاظ بالاشتراك" })}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isCanceling}
          >
            {isCanceling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("General.canceling", { fallback: "جاري الإلغاء..." })}
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
