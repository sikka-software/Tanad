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
  onError?: (error: Error, variables: TVariables) => void;
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
        const err = error as Error;
        toast.error(t("General.error_operation"), {
          description: err.message || t(options.error),
        });
        options.onError?.(err, variables);
      } finally {
        toast.dismiss(toastId);
      }
    };
  };

  return { createDeleteHandler };
};
