import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import UserCard from "@/user/user.card";
import { UserForm } from "@/user/user.form";
import { useUsers, useBulkDeleteUsers, useDuplicateUser } from "@/user/user.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/user/user.options";
import useEnterpriseUsersStore from "@/user/user.store";
import UsersTable from "@/user/user.table";
import { UserType } from "@/user/user.type";

import useUserStore from "@/stores/use-user-store";

export default function UsersPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadUsers = useUserStore((state) => state.hasPermission("users.read"));
  const canCreateUsers = useUserStore((state) => state.hasPermission("users.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableUser, setActionableUser] = useState<UserType | null>(null);

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

  const { data: users, isLoading, error, refetch: refetchUsers } = useUsers();
  const { mutateAsync: deleteUsers, isPending: isDeleting } = useBulkDeleteUsers();
  const { createDeleteHandler } = useDeleteHandler();
  const { mutate: duplicateUser } = useDuplicateUser();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: users,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableUser,
    duplicateMutation: duplicateUser,
    moduleName: "Users",
  });

  const handleConfirmDelete = createDeleteHandler(deleteUsers, {
    loading: "Users.loading.delete",
    success: "Users.success.delete",
    error: "Users.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
      refetchUsers();
    },
  });

  const filteredUsers = useMemo(() => {
    return getFilteredUsers((users as UserType[]) || []);
  }, [users, getFilteredUsers, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedUsers = useMemo(() => {
    return getSortedUsers(filteredUsers);
  }, [filteredUsers, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleAddClick = () => {
    if (canCreateUsers) {
      setActionableUser(null);
      setIsFormDialogOpen(true);
    } else {
      toast.error(t("General.no_permission"));
    }
  };

  if (!canReadUsers) {
    return <NoPermission />;
  }

  const formDialogTitle = actionableUser ? t("Pages.Users.edit") : t("Pages.Users.add");

  return (
    <div>
      <CustomPageMeta title={t("Pages.Users.title")} description={t("Pages.Users.description")} />
      <DataPageLayout count={users?.length} itemsText={t("Pages.Users.title")}>
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
            title={t("Pages.Users.title")}
            onAddClick={handleAddClick}
            createLabel={t("Pages.Users.add")}
            searchPlaceholder={t("Pages.Users.search")}
            hideOptions={users?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <UsersTable
              data={sortedUsers as unknown as UserType[]}
              isLoading={isLoading}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList<UserType>
                data={sortedUsers}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Pages.Users.no_users_found")}
                renderItem={(user) => <UserCard key={user.id} user={user} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableUser ? t("Pages.Users.edit") : t("Pages.Users.add")}
          formId="user-form"
          loadingSave={loadingSaveUser}
        >
          <UserForm
            formHtmlId="user-form"
            defaultValues={actionableUser}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableUser(null);
              refetchUsers();
              setLoadingSaveUser(false);
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

UsersPage.messages = ["Notes", "Pages", "Users", "Roles", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../../locales/${locale}.json`)).default, UsersPage.messages),
    },
  };
};
