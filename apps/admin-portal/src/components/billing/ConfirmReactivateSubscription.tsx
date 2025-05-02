import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmReactivateSubscriptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReactivate: () => Promise<void>;
  subscriptionId: string | null;
}

export function ConfirmReactivateSubscription({
  open,
  onOpenChange,
  onReactivate,
  subscriptionId,
}: ConfirmReactivateSubscriptionProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleReactivateSubscription = async () => {
    if (!subscriptionId) return;

    try {
      setLoading(true);

      // Call the API to reactivate the subscription
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      // Call the onReactivate callback
      await onReactivate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error reactivating subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            {t("Billing.reactivate_subscription.title")}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {t("Billing.reactivate_subscription.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm">
          <ul className="list-disc space-y-2 pl-5">
            <li>{t("Billing.reactivate_subscription.benefit_1")}</li>
            <li>{t("Billing.reactivate_subscription.benefit_2")}</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("Billing.reactivate_subscription.go_back")}
          </Button>
          <Button onClick={handleReactivateSubscription} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("Billing.reactivate_subscription.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
