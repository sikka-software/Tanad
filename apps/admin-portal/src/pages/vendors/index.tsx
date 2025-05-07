import { FormDialog } from "@root/src/components/ui/form-dialog";
import { BranchForm } from "@root/src/modules/branch/branch.form";
import { Branch, BranchUpdateData } from "@root/src/modules/branch/branch.type";
import { VendorForm } from "@root/src/modules/vendor/vendor.form";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import VendorCard from "@/vendor/vendor.card";
import { useVendors, useBulkDeleteVendors, useDuplicateVendor } from "@/vendor/vendor.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/vendor/vendor.options";
import useVendorStore from "@/vendor/vendor.store";
import VendorsTable from "@/vendor/vendor.table";

import { Vendor, VendorUpdateData } from "@/modules/vendor/vendor.type";
import useUserStore from "@/stores/use-user-store";

export default function VendorsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadVendors = useUserStore((state) => state.hasPermission("vendors.read"));
  const canCreateVendors = useUserStore((state) => state.hasPermission("vendors.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableVendor, setActionableVendor] = useState<VendorUpdateData | null>(null);
  const [displayData, setDisplayData] = useState<Vendor[]>([]);

  const loadingSaveVendor = useVendorStore((state) => state.isLoading);
  const setLoadingSaveVendor = useVendorStore((state) => state.setIsLoading);

  const viewMode = useVendorStore((state) => state.viewMode);
  const isDeleteDialogOpen = useVendorStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useVendorStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useVendorStore((state) => state.selectedRows);
  const setSelectedRows = useVendorStore((state) => state.setSelectedRows);
  const clearSelection = useVendorStore((state) => state.clearSelection);
  const sortRules = useVendorStore((state) => state.sortRules);
  const sortCaseSensitive = useVendorStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useVendorStore((state) => state.sortNullsFirst);
  const searchQuery = useVendorStore((state) => state.searchQuery);
  const filterConditions = useVendorStore((state) => state.filterConditions);
  const filterCaseSensitive = useVendorStore((state) => state.filterCaseSensitive);
  const getFilteredVendors = useVendorStore((state) => state.getFilteredData);
  const getSortedVendors = useVendorStore((state) => state.getSortedData);

  const { data: vendors, isLoading, error } = useVendors();
  const { mutateAsync: deleteVendors, isPending: isDeleting } = useBulkDeleteVendors();
  const { mutateAsync: duplicateVendor } = useDuplicateVendor();

  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: vendors,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableVendor,
    duplicateMutation: duplicateVendor,
    moduleName: "Vendors",
  });

  const handleConfirmDelete = createDeleteHandler(deleteVendors, {
    loading: "Vendors.loading.delete",
    success: "Vendors.success.delete",
    error: "Vendors.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredVendors = useMemo(() => {
    return getFilteredVendors(vendors || []);
  }, [vendors, getFilteredVendors, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedVendors = useMemo(() => {
    return getSortedVendors(filteredVendors);
  }, [filteredVendors, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadVendors) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Vendors.title")} description={t("Vendors.description")} />
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
            store={useVendorStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Vendors.title")}
            onAddClick={canCreateVendors ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Vendors.add_new")}
            searchPlaceholder={t("Vendors.search_vendors")}
            count={vendors?.length}
            hideOptions={vendors?.length === 0}
          />
        )}

        {viewMode === "table" ? (
          <VendorsTable
            key={`sorted-${sortedVendors?.length}-${JSON.stringify(sortRules)}`}
            data={sortedVendors || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            onActionClicked={onActionClicked}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={sortedVendors || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("Vendors.no_vendors")}
              renderItem={(vendor) => <VendorCard key={vendor.id} vendor={vendor} />}
              gridCols="3"
            />
          </div>
        )}

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Vendors.edit_vendor")}
          formId="vendor-form"
          loadingSave={loadingSaveVendor}
        >
          <VendorForm
            formHtmlId={"vendor-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableVendor(null);
              setLoadingSaveVendor(false);
            }}
            defaultValues={actionableVendor as Vendor}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Vendors.confirm_delete_title")}
          description={t("Vendors.confirm_delete", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
