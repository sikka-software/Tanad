import { useLocale, useTranslations } from "next-intl";

import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const ConfirmCancelSubscription = ({
  isCanceling,
  setIsCanceling,
  handleCancelSubscription,
}: {
  isCanceling: boolean;
  setIsCanceling: (isCanceling: boolean) => void;
  handleCancelSubscription: () => void;
}) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          {t("cancel_subscription.cancel_button")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir={locale === "ar" ? "rtl" : "ltr"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("cancel_subscription.confirm_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("cancel_subscription.confirm_description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("return")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelSubscription}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCanceling ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("cancel_subscription.canceling")}
              </div>
            ) : (
              t("cancel_subscription.confirm_button")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmCancelSubscription;
