import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";

import { useDeleteHandler } from "@/hooks/use-delete-handler";
import RoleCard from "@/modules/role/role.card";
import { RoleForm } from "@/modules/role/role.form";
import { useRoles, useBulkDeleteRoles, useDuplicateRole } from "@/modules/role/role.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/role/role.options";
import useRoleStore from "@/modules/role/role.store";
import { RoleUpdateData } from "@/modules/role/role.type";
import useUserStore from "@/stores/use-user-store";

export default function RolesPage() {
  const t = useTranslations();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableRole, setActionableRole] = useState<RoleUpdateData | null>(null);
  const { enterprise } = useUserStore();

  const loadingSaveRole = useRoleStore((state) => state.isLoading);
  const setLoadingSaveRole = useRoleStore((state) => state.setIsLoading);
  const isDeleteDialogOpen = useRoleStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useRoleStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useRoleStore((state) => state.selectedRows);
  const setSelectedRows = useRoleStore((state) => state.setSelectedRows);
  const clearSelection = useRoleStore((state) => state.clearSelection);
  const searchQuery = useRoleStore((state) => state.searchQuery);
  const filterConditions = useRoleStore((state) => state.filterConditions);
  const filterCaseSensitive = useRoleStore((state) => state.filterCaseSensitive);
  const getFilteredRoles = useRoleStore((state) => state.getFilteredData);

  const { data: roles, isLoading: loadingFetchRoles, error } = useRoles(enterprise?.id);
  const { mutate: duplicateRole } = useDuplicateRole();
  const { mutateAsync: deleteRoles, isPending: isDeleting } = useBulkDeleteRoles();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteRoles, {
    loading: "Roles.loading.deleting",
    success: "Roles.success.deleted",
    error: "Roles.error.deleting",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredRoles = getFilteredRoles(roles || []);

  const onActionClicked = async (action: string, rowId: string) => {
    if (action === "edit") {
      setIsFormDialogOpen(true);
      setActionableRole(roles?.find((role) => role.id === rowId) || null);
    }

    if (action === "delete") {
      setSelectedRows([rowId]);
      setIsDeleteDialogOpen(true);
    }

    if (action === "duplicate") {
      const toastId = toast.loading(t("General.loading_operation"), {
        description: t("Roles.loading.duplicating"),
      });
      await duplicateRole(
        { id: rowId, enterprise_id: enterprise?.id || "" },
        {
          onSuccess: () => {
            toast.success(t("General.successful_operation"), {
              description: t("Roles.success.duplicated"),
            });
            toast.dismiss(toastId);
          },
          onError: () => {
            toast.error(t("General.error_operation"), {
              description: t("Roles.error.duplicating"),
            });
            toast.dismiss(toastId);
          },
        },
      );
    }
  };

  if (!enterprise) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">{t("General.select_enterprise")}</p>
      </div>
    );
  }

  return (
    <div>
      <CustomPageMeta title={t("Roles.title")} description={t("Roles.description")} />
      <DataPageLayout>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useRoleStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Roles.title")}
            createHref="/roles/add"
            createLabel={t("Roles.create_role")}
            searchPlaceholder={t("Roles.search_roles")}
          />
        )}

        <div className="p-4">
          <DataModelList
            data={filteredRoles}
            isLoading={loadingFetchRoles}
            error={error as Error | null}
            emptyMessage={t("Roles.no_roles_found")}
            renderItem={(role) => (
              <RoleCard key={role.id} role={role} onActionClick={onActionClicked} />
            )}
            gridCols="3"
          />
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Roles.add_new")}
          formId="role-form"
          loadingSave={loadingSaveRole}
        >
          <RoleForm
            id={"role-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableRole(null);
              setLoadingSaveRole(false);
              toast.success(t("General.successful_operation"), {
                description: t("Roles.success.updated"),
              });
            }}
            defaultValues={{
              ...actionableRole,
              enterprise_id: enterprise.id,
            }}
            editMode={!!actionableRole}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Roles.confirm_delete")}
          description={t("Roles.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
