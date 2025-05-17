import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";

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
              fallback: "هل أنت متأكد أنك تريد إلغاء اشتراكك؟",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div
            className={`rounded-md border p-4 ${cancelAtPeriodEnd ? "bg-muted/50 border-primary/50" : ""}`}
          >
            <div className={`flex items-start ${dir === "rtl" ? "space-x-reverse" : ""} gap-2`}>
              <Checkbox
                id="cancel-at-period-end"
                checked={cancelAtPeriodEnd}
                onCheckedChange={(checked) => setCancelAtPeriodEnd(checked as boolean)}
                className="mt-1"
              />
              <div>
                <label
                  htmlFor="cancel-at-period-end"
                  className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("Billing.cancel_subscription.cancel_at_period_end", {
                    fallback: "إلغاء في نهاية دورة الفوترة الحالية",
                  })}
                </label>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t("Billing.cancel_subscription.features_end_notice", {
                    fallback: "ستظل جميع الميزات متاحة حتى نهاية دورة الفوترة الحالية.",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-md border p-4 ${!cancelAtPeriodEnd ? "bg-muted/50 border-destructive/50" : ""}`}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {cancelAtPeriodEnd
                  ? t("Billing.cancel_subscription.alternative_option", {
                      fallback: "الخيار البديل:",
                    })
                  : t("Billing.cancel_subscription.immediate_option", {
                      fallback: "إلغاء فوري:",
                    })}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("Billing.cancel_subscription.immediate_cancellation_notice", {
                  fallback: "سيتم إلغاء اشتراكك على الفور وستفقد الوصول إلى الميزات المتقدمة.",
                })}
              </p>
            </div>
          </div>
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
