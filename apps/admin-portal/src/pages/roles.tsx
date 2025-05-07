import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { Badge } from "@/ui/badge";
import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import RoleCard from "@/role/role.card";
import { RoleForm } from "@/role/role.form";
import {
  useSystemRoles,
  useBulkDeleteRoles,
  useDuplicateRole,
  useCustomRoles,
} from "@/role/role.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/role/role.options";
import useRoleStore from "@/role/role.store";

import { Role } from "@/modules/role/role.type";
import useUserStore from "@/stores/use-user-store";

export default function RolesPage() {
  const t = useTranslations();

  const canReadRoles = useUserStore((state) => state.hasPermission("roles.read"));
  const canCreateRoles = useUserStore((state) => state.hasPermission("roles.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { enterprise, profile, membership } = useUserStore();

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

  const { data: customRoles, isLoading: loadingCustomRoles, error: customError } = useCustomRoles();
  const { data: systemRoles, isLoading: loadingSystemRoles, error: systemError } = useSystemRoles();

  const allRoles = useMemo(() => {
    const combined = new Map<string, Role>();
    (customRoles || []).forEach((role) => combined.set(role.id, role));
    (systemRoles || []).forEach((role) => combined.set(role.id, role));
    return Array.from(combined.values());
  }, [customRoles, systemRoles]);

  const isLoading = loadingCustomRoles || loadingSystemRoles;
  const error = customError || systemError;

  const { mutate: duplicateRole } = useDuplicateRole();
  const { mutateAsync: deleteRoles, isPending: isDeleting } = useBulkDeleteRoles();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteRoles, {
    loading: "Roles.loading.delete",
    success: "Roles.success.delete",
    error: "Roles.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredRoles = getFilteredRoles(allRoles || []) as Role[];

  const onActionClicked = async (action: string, rowId: string) => {
    if (action === "edit") {
      const roleToEdit = allRoles.find((role) => role.id === rowId);
      if (roleToEdit) {
        setEditingRole(roleToEdit);
        setIsFormDialogOpen(true);
      }
    }

    if (action === "delete") {
      const roleToDelete = allRoles.find((r) => r.id === rowId);
      if (roleToDelete && !roleToDelete.is_system) {
        setSelectedRows([rowId]);
        setIsDeleteDialogOpen(true);
      } else if (roleToDelete?.is_system) {
        toast.warning(t("Roles.cannot_delete_system"));
      }
    }

    if (action === "duplicate") {
      const roleToDuplicate = allRoles.find((r) => r.id === rowId);
      if (roleToDuplicate && !roleToDuplicate.is_system) {
        const toastId = toast.loading(t("General.loading_operation"), {
          description: t("Roles.loading.duplicate"),
        });
        await duplicateRole(
          { id: rowId, enterprise_id: enterprise?.id || "" },
          {
            onSuccess: () => {
              toast.success(t("General.successful_operation"), {
                description: t("Roles.success.duplicate"),
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
      } else if (roleToDuplicate?.is_system) {
        toast.warning(t("Roles.cannot_duplicate_system"));
      }
    }
  };

  const userRoleName = allRoles.find((role) => role.id === membership?.role_id)?.name;

  if (!canReadRoles) {
    return <NoPermission />;
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
            onAddClick={() => {
              if (canCreateRoles) {
                setEditingRole(null);
                setIsFormDialogOpen(true);
              } else {
                return undefined;
              }
            }}
            createLabel={t("Roles.create_role")}
            searchPlaceholder={t("Roles.search_roles")}
            count={allRoles?.length}
            hideOptions={allRoles?.length === 0}
          />
        )}

        <div className="p-4">
          {userRoleName && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{t("Roles.your_role")}:</span>
              <Badge variant="outline" className="text-sm">
                {t(`Roles.predefined.${userRoleName.toLowerCase()}.title`)}
              </Badge>
            </div>
          )}
          <DataModelList
            data={filteredRoles}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage={t("Roles.no_roles_found")}
            renderItem={(role) => (
              <RoleCard
                key={role.id}
                role={role}
                onActionClick={onActionClicked}
                disableActions={role.is_system || false}
              />
            )}
            gridCols="3"
          />
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={editingRole ? t("Roles.edit_role") : t("Roles.add_new")}
          formId="role-form"
          loadingSave={loadingSaveRole}
        >
          <RoleForm
            formHtmlId={"role-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setLoadingSaveRole(false);
              setEditingRole(null);
            }}
            editMode={!!editingRole}
            defaultValues={editingRole as any}
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
