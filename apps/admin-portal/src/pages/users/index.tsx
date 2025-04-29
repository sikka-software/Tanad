import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { FormDialog } from "@/components/ui/form-dialog";

import { useDeleteHandler } from "@/hooks/use-delete-handler";
import UserCard from "@/modules/user/user.card";
import { UserForm } from "@/modules/user/user.form";
import { useUsers, useBulkDeleteUsers } from "@/modules/user/user.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/user/user.options";
import useEnterpriseUsersStore from "@/modules/user/user.store";
import UsersTable, { UserType } from "@/modules/user/user.table";
import { User, UserUpdateData } from "@/modules/user/user.type";

export default function UsersPage() {
  const t = useTranslations();

  const loadingSaveUser = useEnterpriseUsersStore((state) => state.isLoading);
  const setLoadingSaveUser = useEnterpriseUsersStore((state) => state.setIsLoading);
  const viewMode = useEnterpriseUsersStore((state) => state.viewMode);
  const isDeleteDialogOpen = useEnterpriseUsersStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useEnterpriseUsersStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useEnterpriseUsersStore((state) => state.selectedRows);
  const setSelectedRows = useEnterpriseUsersStore((state) => state.setSelectedRows);
  const clearSelection = useEnterpriseUsersStore((state) => state.clearSelection);
  const sortRules = useEnterpriseUsersStore((state) => state.sortRules);
  const sortCaseSensitive = useEnterpriseUsersStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useEnterpriseUsersStore((state) => state.sortNullsFirst);
  const searchQuery = useEnterpriseUsersStore((state) => state.searchQuery);
  const filterConditions = useEnterpriseUsersStore((state) => state.filterConditions);
  const filterCaseSensitive = useEnterpriseUsersStore((state) => state.filterCaseSensitive);
  const getFilteredUsers = useEnterpriseUsersStore((state) => state.getFilteredData);
  const getSortedUsers = useEnterpriseUsersStore((state) => state.getSortedData);

  const { data: users, isLoading, error } = useUsers();
  const { mutateAsync: deleteUsers, isPending: isDeleting } = useBulkDeleteUsers();
  const { createDeleteHandler } = useDeleteHandler();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableUser, setActionableUser] = useState<UserUpdateData | null>(null);

  const handleConfirmDelete = createDeleteHandler(deleteUsers, {
    loading: "Users.loading.deleting",
    success: "Users.success.deleted",
    error: "Users.error.deleting",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredUsers = useMemo(() => {
    return getFilteredUsers(users || []);
  }, [users, getFilteredUsers, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedUsers = useMemo(() => {
    return getSortedUsers(filteredUsers);
  }, [filteredUsers, sortRules, sortCaseSensitive, sortNullsFirst]);

  const onActionClicked = async (action: string, rowId: string) => {
    if (action === "edit") {
      setIsFormDialogOpen(true);
      setActionableUser(users?.find((user) => user.id === rowId) || null);
    }

    if (action === "delete") {
      setSelectedRows([rowId]);
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Users.title")} description={t("Users.description")} />
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
            store={useEnterpriseUsersStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Users.title")}
            createHref="/users/add"
            createLabel={t("Users.create_user")}
            searchPlaceholder={t("Users.search_users")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <UsersTable
              users={sortedUsers as UserType[]}
              isLoading={isLoading}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedUsers}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Users.no_users_found")}
                renderItem={(user) => <UserCard key={user.id} user={user as User} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Users.add_new")}
          formId="user-form"
          loadingSave={loadingSaveUser}
        >
          <UserForm
            id="user-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableUser(null);
              setLoadingSaveUser(false);
              toast.success(t("General.successful_operation"), {
                description: t("Users.success.updated"),
              });
            }}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Users.confirm_delete")}
          description={t("Users.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
