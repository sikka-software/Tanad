import { useState } from "react";

import { useTranslations } from "next-intl";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmCancelSubscriptionProps {
  isCanceling: boolean;
  setIsCanceling: (isCanceling: boolean) => void;
  handleCancelSubscription: () => Promise<void>;
}

export default function ConfirmCancelSubscription({
  isCanceling,
  setIsCanceling,
  handleCancelSubscription,
}: ConfirmCancelSubscriptionProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* First show a cancel button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
        disabled={isCanceling}
      >
        {isCanceling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("billing.cancel_subscription.canceling")}
          </>
        ) : (
          t("billing.cancel_subscription.button")
        )}
      </Button>

      {/* Show the confirmation dialog when the button is clicked */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t("billing.cancel_subscription.title")}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t("billing.cancel_subscription.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm">
            <ul className="list-disc space-y-2 pl-5">
              <li>{t("billing.cancel_subscription.consequence_1")}</li>
              <li>{t("billing.cancel_subscription.consequence_2")}</li>
              <li>{t("billing.cancel_subscription.consequence_3")}</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isCanceling}>
              {t("billing.cancel_subscription.go_back")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleCancelSubscription();
                setOpen(false);
              }}
              disabled={isCanceling}
              className="gap-2"
            >
              {isCanceling && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("billing.cancel_subscription.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
