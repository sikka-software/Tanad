import { pick } from "lodash";
import { Plus, UserPlus } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
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

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  const pendingDeleteIds = moduleHooks.usePendingDeleteIds();
  const setPendingDeleteIds = moduleHooks.useSetPendingDeleteIds();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

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

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  useEffect(() => {
    setPendingDeleteIds(selectedRows);
  }, [selectedRows, setPendingDeleteIds]);

  return (
    <div>
      <CustomPageMeta
        title={t("Pages.Vendors.title")}
        description={t("Pages.Vendors.description")}
      />
      <DataPageLayout count={vendors?.length} itemsText={t("Pages.Vendors.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode store={useVendorStore} isDeleting={isDeleting} />
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
          />
        )}

        {viewMode === "table" ? (
          <VendorsTable
            key={`sorted-${sortedData?.length}-${JSON.stringify(sortRules)}`}
            data={sortedData || []}
            isLoading={isLoading}
            error={error}
            onActionClicked={onActionClicked}
            sorting={tanstackSorting}
            onSortingChange={handleTanstackSortingChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={sortedData || []}
              isLoading={isLoading}
              error={error}
              empty={{
                title: t("Vendors.create_first.title"),
                description: t("Vendors.create_first.description"),
                add: t("Pages.Vendors.add"),
                icons: [UserPlus, Plus, UserPlus],
                onClick: () => router.push(router.pathname + "/add"),
              }}
              renderItem={(vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} onActionClicked={onActionClicked} />
              )}
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
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

VendorsPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "Vendors",
  "Forms",
  "General",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      VendorsPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
