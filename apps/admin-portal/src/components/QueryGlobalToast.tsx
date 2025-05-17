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
          console.log("useCreate hook status", status);
          if (status === "pending") {
            toast.loading(t("General.creating"), { description: "", id: CREATE_TOAST_ID });
            console.log("useCreate hook pending");
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
            console.log("useCreate hook success");
          } else {
            console.log("useCreate hook error");
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
            console.log("useCreate hook error toast");
          }
        }

        // Update Mutation
        if (mutationFnName.startsWith("useUpdate")) {
          const status = event.mutation.state.status;
          console.log("useUpdate hook status", status);
          if (status === "pending") {
            toast.loading(t("General.saving"), { id: UPDATE_TOAST_ID, description: "" });
            console.log("useUpdate hook pending");
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
              console.log("useUpdate hook success");
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
              console.log("useUpdate hook error");
            }
          }
        }

        // Duplicate Mutation
        if (mutationFnName.startsWith("useDuplicate")) {
          const status = event.mutation.state.status;
          console.log("useDuplicate hook status", status);
          if (status === "pending") {
            toast.loading(t("General.duplicating"), { id: DUPLICATE_TOAST_ID, description: "" });
            console.log("useDuplicate hook pending");
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
              console.log("useDuplicate hook success");
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
              console.log("useDuplicate hook error");
            }
          }
        }

        // Delete Mutation
        if (mutationFnName.startsWith("useDelete")) {
          const status = event.mutation.state.status;
          console.log("useDelete hook status", status);
          if (status === "pending") {
            toast.loading(t("General.deleting"), { id: DELETE_TOAST_ID, description: "" });
            console.log("useDelete hook pending");
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
              console.log("useDelete hook success");
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
              console.log("useDelete hook error");
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
