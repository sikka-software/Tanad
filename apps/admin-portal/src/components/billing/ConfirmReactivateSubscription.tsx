import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@root/src/components/ui/dialogs/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmReactivateSubscriptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isReactivating: boolean;
  onConfirm: () => Promise<void>;
  planName: string;
  dir?: "ltr" | "rtl";
}

export function ConfirmReactivateSubscriptionDialog({
  open,
  onOpenChange,
  isReactivating,
  onConfirm,
  planName,
  dir,
}: ConfirmReactivateSubscriptionProps) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  const handleReactivate = async () => {
    try {
      setError(null);
      toast.loading(
        t("Billing.reactivate_subscription.loading", {
          fallback: "Reactivating subscription...",
        }),
      );
      await onConfirm();
      toast.dismiss();
      // Close the dialog after successful reactivation
      onOpenChange(false);
    } catch (err: any) {
      toast.dismiss();
      setError(err.message || "An error occurred while reactivating your subscription");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={dir}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("Billing.reactivate_subscription.title", { fallback: "Reactivate Subscription" })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("Billing.reactivate_subscription.description", {
              plan: planName,
              fallback: `Are you sure you want to reactivate your ${planName}? Your subscription will be restored and billing will resume according to your previous billing cycle.`,
            })}
          </AlertDialogDescription>
          {error && (
            <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
              <p>{error}</p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isReactivating}>
            {t("Billing.reactivate_subscription.cancel", { fallback: "Cancel" })}
          </AlertDialogCancel>
          <Button variant="default" onClick={handleReactivate} disabled={isReactivating}>
            {isReactivating
              ? t("Billing.reactivate_subscription.processing", { fallback: "Processing..." })
              : t("Billing.reactivate_subscription.confirm", {
                  fallback: "Reactivate Subscription",
                })}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
