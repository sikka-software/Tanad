import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

const TOAST_IDS = {
  create: "global-create-toast",
  update: "global-update-toast",
  delete: "global-delete-toast",
  duplicate: "global-duplicate-toast",
} as const;

const QueryGlobalToast = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated") {
        const { mutation } = event;
        const { status } = mutation.state;
        const meta = mutation.meta as any;

        if (!meta || !meta.operation) return;

        const operation = meta.operation as keyof typeof TOAST_IDS;
        const toastId = TOAST_IDS[operation];

        const getDescription = (key: "success" | "error") => {
          return meta.toast?.[key] ? t(meta.toast[key]) : "";
        };

        if (status === "pending") {
          const messages = {
            create: t("General.creating"),
            update: t("General.saving"),
            delete: t("General.deleting"),
            duplicate: t("General.duplicating"),
          };

          toast.loading(messages[operation] || t("General.working"), {
            id: toastId,
            description: "",
          });
        }

        if (status === "success") {
          toast.success(t("General.successful_operation"), {
            id: toastId,
            description: getDescription("success"),
            duration: 1500,
          });
        }

        if (status === "error") {
          toast.error(t("General.error_operation"), {
            id: toastId,
            description: getDescription("error"),
            duration: 2000,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return null;
};

export default QueryGlobalToast;
