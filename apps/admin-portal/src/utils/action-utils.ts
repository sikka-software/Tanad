import { toast } from "sonner";

type ActionConfig<T> = {
  [key: string]: (params: {
    id: string;
    data?: T[];
    t: (key: string) => string;
    meta?: any; // For custom extensions
  }) => void | Promise<void>;
};

export const createActions = <T extends { id: string }>(config: ActionConfig<T>) => {
  return (
    action: string,
    id: string,
    context: {
      t: (key: string) => string;
      data?: T[];
      meta?: any;
    },
  ) => {
    return config[action]?.({ id, ...context }) ?? console.warn(`Unknown action: ${action}`);
  };
};

// Optional: Pre-built mutation wrapper
export const withMutation = (
  mutation: { mutateAsync: (id: string) => Promise<any> },
  translations: { loading: string; success: string; error: string },
) => {
  return async ({ id, t }: { id: string; t: (key: string) => string }) => {
    const toastId = toast.loading(t("General.loading_operation"), {
      description: t(translations.loading),
    });

    try {
      await mutation.mutateAsync(id);
      toast.success(t("General.successful_operation"), {
        description: t(translations.success),
      });
    } catch {
      toast.error(t("General.error_operation"), {
        description: t(translations.error),
      });
    } finally {
      toast.dismiss(toastId);
    }
  };
};
