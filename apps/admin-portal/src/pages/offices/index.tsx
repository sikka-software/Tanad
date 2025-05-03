import { GetStaticProps } from "next";
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

import OfficeCard from "@/office/office.card";
import { OfficeForm } from "@/office/office.form";
import { useOffices, useBulkDeleteOffices, useDuplicateOffice } from "@/office/office.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/office/office.options";
import useOfficeStore from "@/office/office.store";
import OfficesTable from "@/office/office.table";
import { OfficeUpdateData } from "@/office/office.type";

import useUserStore from "@/stores/use-user-store";

export default function OfficesPage() {
  const t = useTranslations();
  const router = useRouter();
  const canReadOffices = useUserStore((state) => state.hasPermission("offices.read"));
  const canCreateOffices = useUserStore((state) => state.hasPermission("offices.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableOffice, setActionableOffice] = useState<OfficeUpdateData | null>(null);

  const loadingSaveOffice = useOfficeStore((state) => state.isLoading);
  const setLoadingSaveOffice = useOfficeStore((state) => state.setIsLoading);
  const viewMode = useOfficeStore((state) => state.viewMode);
  const isDeleteDialogOpen = useOfficeStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useOfficeStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const setSelectedRows = useOfficeStore((state) => state.setSelectedRows);
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
  const { mutate: duplicateOffice } = useDuplicateOffice();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: offices,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableOffice,
    duplicateMutation: duplicateOffice,
    moduleName: "Offices",
  });

  const handleConfirmDelete = createDeleteHandler(deleteOffices, {
    loading: "Offices.loading.delete",
    success: "Offices.success.delete",
    error: "Offices.error.delete",
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
              onActionClicked={onActionClicked}
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

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Offices.add_new")}
          formId="office-form"
          loadingSave={loadingSaveOffice}
        >
          <OfficeForm
            formHtmlId={"office-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableOffice(null);
              setLoadingSaveOffice(false);
              toast.success(t("General.successful_operation"), {
                description: t("Offices.success.update"),
              });
            }}
            defaultValues={actionableOffice}
            editMode={true}
          />
        </FormDialog>

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
