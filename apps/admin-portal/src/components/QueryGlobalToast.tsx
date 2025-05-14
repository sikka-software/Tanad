import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

const UPDATE_TOAST_ID = "global-update-toast";
const CREATE_TOAST_ID = "global-create-toast";
const DELETE_TOAST_ID = "global-delete-toast";
const DUPLICATE_TOAST_ID = "global-duplicate-toast";

const QueryGlobalToast = () => {
  const queryClient = useQueryClient();
  const t = useTranslations();

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated") {
        const mutationFnName = event.mutation.options.mutationFn?.name || "";

        // Create Mutation
        if (mutationFnName.startsWith("useCreate")) {
          const status = event.mutation.state.status;
          if (status === "pending") {
            toast.loading(t("General.creating"), { description: "", id: CREATE_TOAST_ID });
          } else if (status === "success") {
            toast.success(t("General.successful_operation"), {
              ...(event.mutation.meta &&
              typeof event.mutation.meta.toast === "object" &&
              event.mutation.meta.toast !== null &&
              typeof (event.mutation.meta.toast as any).success === "string"
                ? { description: t((event.mutation.meta.toast as any).success) }
                : {}),
              id: CREATE_TOAST_ID,
              duration: 1500,
            });
          } else {
            toast.error(t("General.error_operation"), {
              ...(event.mutation.meta &&
              typeof event.mutation.meta.toast === "object" &&
              event.mutation.meta.toast !== null &&
              typeof (event.mutation.meta.toast as any).error === "string"
                ? { description: t((event.mutation.meta.toast as any).error) }
                : {}),
              id: CREATE_TOAST_ID,
              duration: 2000,
            });
          }
        }

        // Update Mutation
        if (mutationFnName.startsWith("useUpdate")) {
          const status = event.mutation.state.status;
          if (status === "pending") {
            toast.loading(t("General.saving"), { id: UPDATE_TOAST_ID, description: "" });
          } else if (status === "success" || status === "error") {
            if (status === "success") {
              toast.success(t("General.successful_operation"), {
                ...(event.mutation.meta &&
                typeof event.mutation.meta.toast === "object" &&
                event.mutation.meta.toast !== null &&
                typeof (event.mutation.meta.toast as any).success === "string"
                  ? { description: t((event.mutation.meta.toast as any).success) }
                  : {}),
                id: UPDATE_TOAST_ID,
                duration: 1500,
              });
            } else {
              toast.error(t("General.error_operation"), {
                ...(event.mutation.meta &&
                typeof event.mutation.meta.toast === "object" &&
                event.mutation.meta.toast !== null &&
                typeof (event.mutation.meta.toast as any).success === "string"
                  ? { description: t((event.mutation.meta.toast as any).error) }
                  : {}),
                id: UPDATE_TOAST_ID,
                duration: 2000,
              });
            }
          }
        }

        // Duplicate Mutation
        if (mutationFnName.startsWith("useDuplicate")) {
          const status = event.mutation.state.status;
          if (status === "pending") {
            toast.loading(t("General.duplicating"), { id: DUPLICATE_TOAST_ID, description: "" });
          } else if (status === "success" || status === "error") {
            if (status === "success") {
              toast.success(t("General.successful_operation"), {
                ...(event.mutation.meta &&
                typeof event.mutation.meta.toast === "object" &&
                event.mutation.meta.toast !== null &&
                typeof (event.mutation.meta.toast as any).success === "string"
                  ? { description: t((event.mutation.meta.toast as any).success) }
                  : {}),
                id: DUPLICATE_TOAST_ID,
                duration: 1500,
              });
            } else {
              toast.error(t("General.error_operation"), {
                ...(event.mutation.meta &&
                typeof event.mutation.meta.toast === "object" &&
                event.mutation.meta.toast !== null &&
                typeof (event.mutation.meta.toast as any).error === "string"
                  ? { description: t((event.mutation.meta.toast as any).error) }
                  : {}),
                id: DUPLICATE_TOAST_ID,
                duration: 2000,
              });
            }
          }
        }

        // Delete Mutation
        if (mutationFnName.startsWith("useDelete")) {
          const status = event.mutation.state.status;
          if (status === "pending") {
            toast.loading(t("General.deleting"), { id: DELETE_TOAST_ID, description: "" });
          } else if (status === "success" || status === "error") {
            if (status === "success") {
              toast.success(t("General.successful_operation"), {
                ...(event.mutation.meta &&
                typeof event.mutation.meta.toast === "object" &&
                event.mutation.meta.toast !== null &&
                typeof (event.mutation.meta.toast as any).success === "string"
                  ? { description: t((event.mutation.meta.toast as any).success) }
                  : {}),
                id: DELETE_TOAST_ID,
                duration: 1500,
              });
            } else {
              toast.error(t("General.error_operation"), {
                ...(event.mutation.meta &&
                typeof event.mutation.meta.toast === "object" &&
                event.mutation.meta.toast !== null &&
                typeof (event.mutation.meta.toast as any).success === "string"
                  ? { description: t((event.mutation.meta.toast as any).error) }
                  : {}),
                id: DELETE_TOAST_ID,
                duration: 2000,
              });
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
