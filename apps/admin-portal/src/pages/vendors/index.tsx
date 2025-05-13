import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import VendorCard from "@/vendor/vendor.card";
import useVendorColumns from "@/vendor/vendor.columns";
import { VendorForm } from "@/vendor/vendor.form";
import { useVendors, useBulkDeleteVendors, useDuplicateVendor } from "@/vendor/vendor.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/vendor/vendor.options";
import useVendorStore from "@/vendor/vendor.store";
import VendorsTable from "@/vendor/vendor.table";
import { Vendor, VendorUpdateData } from "@/vendor/vendor.type";

export default function VendorsPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useVendorColumns();

  const moduleHooks = createModuleStoreHooks(useVendorStore, "vendors");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<VendorUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();

  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();

  const viewMode = moduleHooks.useViewMode();
  const clearSelection = moduleHooks.useClearSelection();
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const searchQuery = moduleHooks.useSearchQuery();
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();

  const { data: vendors, isLoading, error } = useVendors();
  const { mutateAsync: deleteVendors, isPending: isDeleting } = useBulkDeleteVendors();
  const { mutate: duplicateVendor } = useDuplicateVendor();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: vendors,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem,
    duplicateMutation: duplicateVendor,
    moduleName: "Vendors",
  });

  const handleConfirmDelete = createDeleteHandler(deleteVendors, {
    loading: "Vendors.loading.delete",
    success: "Vendors.success.delete",
    error: "Vendors.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useVendorStore((state) => state.data) || [];
  const setData = useVendorStore((state) => state.setData);

  useEffect(() => {
    if (vendors && setData) {
      setData(vendors);
    }
  }, [vendors, setData]);

  const filteredData = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedData = useMemo(() => {
    return getSortedData(filteredData);
  }, [filteredData, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Vendors.title")}
        description={t("Pages.Vendors.description")}
      />
      <DataPageLayout count={vendors?.length} itemsText={t("Pages.Vendors.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={(open) => {
              if (open) setPendingDeleteIds(selectedRows);
              setIsDeleteDialogOpen(open);
            }}
          />
        ) : (
          <PageSearchAndFilter
            store={useVendorStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Vendors.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Vendors.add")}
            searchPlaceholder={t("Pages.Vendors.search")}
            hideOptions={vendors?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
          />
        )}

        {viewMode === "table" ? (
          <VendorsTable
            key={`sorted-${sortedData?.length}-${JSON.stringify(sortRules)}`}
            data={sortedData || []}
            isLoading={isLoading}
            error={error}
            onActionClicked={onActionClicked}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={sortedData || []}
              isLoading={isLoading}
              error={error}
              emptyMessage={t("Vendors.no_vendors")}
              renderItem={(vendor) => <VendorCard key={vendor.id} vendor={vendor} />}
              gridCols="3"
            />
          </div>
        )}

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.Vendors.edit") : t("Pages.Vendors.add")}
          formId="vendor-form"
          loadingSave={loadingSave}
        >
          <VendorForm
            formHtmlId={"vendor-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableItem as Vendor}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Vendors.confirm_delete", { count: selectedRows.length })}
          description={t("Vendors.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
      </DataPageLayout>
    </div>
  );
}

VendorsPage.messages = ["Notes", "Pages", "Vendors", "Forms", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        VendorsPage.messages,
      ),
    },
  };
};
