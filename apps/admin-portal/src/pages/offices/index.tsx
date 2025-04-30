import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import LoadingPage from "@/components/loading-page";
import NoPermission from "@/components/ui/no-permission";

import { useDeleteHandler } from "@/hooks/use-delete-handler";
import { usePermission } from "@/hooks/use-permission";
import OfficeCard from "@/modules/office/office.card";
import { useOffices, useBulkDeleteOffices } from "@/modules/office/office.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/office/office.options";
import useOfficeStore from "@/modules/office/office.store";
import OfficesTable from "@/modules/office/office.table";
import useUserStore from "@/stores/use-user-store";

export default function OfficesPage() {
  const t = useTranslations();
  const router = useRouter();
  const canReadOffices = useUserStore((state) => state.hasPermission("offices.read"));
  const canCreateOffices = useUserStore((state) => state.hasPermission("offices.create"));

  const viewMode = useOfficeStore((state) => state.viewMode);
  const isDeleteDialogOpen = useOfficeStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useOfficeStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const clearSelection = useOfficeStore((state) => state.clearSelection);
  const sortRules = useOfficeStore((state) => state.sortRules);
  const sortCaseSensitive = useOfficeStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useOfficeStore((state) => state.sortNullsFirst);
  const searchQuery = useOfficeStore((state) => state.searchQuery);
  const filterConditions = useOfficeStore((state) => state.filterConditions);
  const filterCaseSensitive = useOfficeStore((state) => state.filterCaseSensitive);
  const getFilteredOffices = useOfficeStore((state) => state.getFilteredData);
  const getSortedOffices = useOfficeStore((state) => state.getSortedData);

  const { data: offices, isLoading, error } = useOffices();
  const { mutateAsync: deleteOffices, isPending: isDeleting } = useBulkDeleteOffices();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteOffices, {
    loading: "Offices.loading.deleting",
    success: "Offices.success.deleted",
    error: "Offices.error.deleting",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredOffices = useMemo(() => {
    return getFilteredOffices(offices || []);
  }, [offices, getFilteredOffices, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedOffices = useMemo(() => {
    return getSortedOffices(filteredOffices);
  }, [filteredOffices, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadOffices) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Offices.title")} description={t("Offices.description")} />
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
            store={useOfficeStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Offices.title")}
            onAddClick={canCreateOffices ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Offices.add_new")}
            searchPlaceholder={t("Offices.search_offices")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <OfficesTable
              data={sortedOffices}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedOffices}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Offices.no_offices_found")}
                renderItem={(office) => <OfficeCard office={office} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Offices.confirm_delete_title")}
          description={t("Offices.confirm_delete", { count: selectedRows.length })}
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
