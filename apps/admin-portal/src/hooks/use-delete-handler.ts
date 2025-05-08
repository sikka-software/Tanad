// hooks/useDeleteHandler.ts
import { UseMutationResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type MutationFn<TVariables> = UseMutationResult<any, Error, TVariables>["mutateAsync"];

interface DeleteHandlerOptions<TVariables> {
  loading: string;
  success: string;
  error: string;
  onSuccess?: (data: any, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => boolean | void;
}

export const useDeleteHandler = () => {
  const t = useTranslations();

  const createDeleteHandler = <TVariables = string[]>(
    mutationFn: MutationFn<TVariables>,
    options: DeleteHandlerOptions<TVariables>,
  ) => {
    return async (variables: TVariables) => {
      const toastId = toast.loading(t("General.loading_operation"), {
        description: t(options.loading),
      });

      try {
        const data = await mutationFn(variables);

        toast.success(t("General.successful_operation"), {
          description: t(options.success),
        });
        options.onSuccess?.(data, variables);
      } catch (error) {
        const err = error as any; // Treat as any to access potential JSON properties
        console.log("error is ", err);
        const errorHandled = options.onError?.(err, variables);

        if (!errorHandled) {
          let description = t(options.error); // Default to generic translation key

          if (typeof err === "object" && err !== null) {
            // Prefer 'details', then 'message' from the object itself (parsed JSON from service)
            if (typeof err.details === "string" && err.details) {
              description = err.details;
            } else if (typeof err.message === "string" && err.message) {
              description = err.message;
            }
          } else if (error instanceof Error && error.message) {
            // Fallback to standard Error.message if 'err' wasn't a detailed object
            description = error.message;
          }

          toast.error(t("General.error_operation"), {
            description: description, // Use the determined description
          });
        }
      } finally {
        toast.dismiss(toastId);
      }
    };
  };

  return { createDeleteHandler };
};
