import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import VendorCard from "@/modules/vendor/vendor.card";
import { useVendors, useBulkDeleteVendors } from "@/modules/vendor/vendor.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/modules/vendor/vendor.options";
import { useVendorsStore } from "@/modules/vendor/vendor.store";
import VendorsTable from "@/modules/vendor/vendor.table";

export default function VendorsPage() {
  const t = useTranslations();

  const viewMode = useVendorsStore((state) => state.viewMode);
  const isDeleteDialogOpen = useVendorsStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useVendorsStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useVendorsStore((state) => state.selectedRows);
  const clearSelection = useVendorsStore((state) => state.clearSelection);
  const sortRules = useVendorsStore((state) => state.sortRules);
  const sortCaseSensitive = useVendorsStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useVendorsStore((state) => state.sortNullsFirst);
  const searchQuery = useVendorsStore((state) => state.searchQuery);
  const filterConditions = useVendorsStore((state) => state.filterConditions);
  const filterCaseSensitive = useVendorsStore((state) => state.filterCaseSensitive);
  const getFilteredVendors = useVendorsStore((state) => state.getFilteredVendors);
  const getSortedVendors = useVendorsStore((state) => state.getSortedVendors);

  const { data: vendors, isLoading, error } = useVendors();
  const { mutate: deleteVendors, isPending: isDeleting } = useBulkDeleteVendors();

  const filteredVendors = useMemo(() => {
    return getFilteredVendors(vendors || []);
  }, [vendors, getFilteredVendors, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedVendors = useMemo(() => {
    return getSortedVendors(filteredVendors);
  }, [filteredVendors, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = async () => {
    try {
      await deleteVendors(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete vendors:", error);
          toast.error(t("Vendors.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete vendors:", error);
      setIsDeleteDialogOpen(false);
    }
  };

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
            store={useVendorsStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Vendors.title")}
            createHref="/vendors/add"
            createLabel={t("Vendors.add_new")}
            searchPlaceholder={t("Vendors.search_vendors")}
          />
        )}

        {viewMode === "table" ? (
          <VendorsTable
            key={`sorted-${sortedVendors?.length}-${JSON.stringify(sortRules)}`}
            data={sortedVendors || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
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

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
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
