import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface UseDataTableActionsProps<T extends { id: string }> {
  data?: T[];
  setSelectedRows: (ids: string[]) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  setIsFormDialogOpen: (isOpen: boolean) => void;
  setActionableItem: (item: T | null) => void;
  duplicateMutation: (id: string, options?: any) => void;
  moduleName: string;
}

export function useDataTableActions<T extends { id: string }>({
  data,
  setSelectedRows,
  setIsDeleteDialogOpen,
  setIsFormDialogOpen,
  setActionableItem,
  duplicateMutation,
  moduleName,
}: UseDataTableActionsProps<T>) {
  const t = useTranslations();

  const handleAction = async (action: string, rowId: string) => {
    if (action === "edit") {
      setIsFormDialogOpen(true);
      setActionableItem(data?.find((item) => item.id === rowId) || null);
    }

    if (action === "delete") {
      setSelectedRows([rowId]);
      setIsDeleteDialogOpen(true);
    }

    if (action === "duplicate") {
      const toastId = toast.loading(t("General.loading_operation"), {
        description: t(`${moduleName}.loading.duplicating`),
      });

      await duplicateMutation(rowId, {
        onSuccess: () => {
          toast.success(t("General.successful_operation"), {
            description: t(`${moduleName}.success.duplicated`),
          });
          toast.dismiss(toastId);
        },
        onError: () => {
          toast.error(t("General.error_operation"), {
            description: t(`${moduleName}.error.duplicating`),
          });
          toast.dismiss(toastId);
        },
      });
    }
  };

  return { handleAction };
}
