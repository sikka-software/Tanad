import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const TOAST_ID = "global-api-toast";

const QueryGlobalToast = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const activeMutations = useRef(0);

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated") {
        const status = event.mutation.state.status;
        if (status === "pending") {
          activeMutations.current += 1;
          if (activeMutations.current === 1) {
            toast.loading(t("General.saving"), { id: TOAST_ID });
          }
        } else if (status === "success" || status === "error") {
          activeMutations.current = Math.max(0, activeMutations.current - 1);
          if (activeMutations.current === 0) {
            if (status === "success") {
              toast.success(t("General.successful_operation"), { id: TOAST_ID, duration: 1500 });
            } else {
              toast.error(t("General.error_operation"), { id: TOAST_ID, duration: 2000 });
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  return null;
};

export default QueryGlobalToast;
