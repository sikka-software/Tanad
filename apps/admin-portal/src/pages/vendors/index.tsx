import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import VendorCard from "@/components/app/vendor/vendor.card";
import VendorsTable from "@/components/app/vendor/vendor.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import { sortVendors } from "@/lib/sort-utils";
import { Vendor } from "@/types/vendor.type";

import { useVendors, useBulkDeleteVendors } from "@/hooks/models/useVendors";
import { useVendorsStore } from "@/stores/vendors.store";

// Assuming a useVendors hook exists or will be created
export default function VendorsPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortRules, setSortRules] = useState<{ field: string; direction: string }[]>([
    { field: "created_at", direction: "desc" },
  ]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [nullsFirst, setNullsFirst] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const sortableColumns = [
    { value: "created_at", label: t("General.created_at") },
    { value: "name", label: t("Vendors.form.name.label") },
    { value: "email", label: t("Vendors.form.email.label") },
    { value: "phone", label: t("Vendors.form.phone.label") },
    { value: "company", label: t("Vendors.form.company.label") },
    { value: "address", label: t("Vendors.form.address.label") },
    { value: "city", label: t("Vendors.form.city.label") },
    { value: "state", label: t("Vendors.form.state.label") },
    { value: "zip_code", label: t("Vendors.form.zip_code.label") },
  ];

  const handleSortRulesChange = (newSortRules: { field: string; direction: string }[]) => {
    setSortRules(newSortRules);
  };

  const handleCaseSensitiveChange = (value: boolean) => {
    setCaseSensitive(value);
  };

  const handleNullsFirstChange = (value: boolean) => {
    setNullsFirst(value);
  };

  const { data: vendors, isLoading, error } = useVendors();
  const { selectedRows, setSelectedRows, clearSelection } = useVendorsStore();
  const { mutate: deleteVendors, isPending: isDeleting } = useBulkDeleteVendors();

  const filteredVendors = vendors?.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedVendors = sortVendors(filteredVendors || [], sortRules, {
    caseSensitive,
    nullsFirst,
  });

  const handleRowSelectionChange = (rows: Vendor[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

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
            title={t("Vendors.title")}
            createHref="/vendors/add"
            createLabel={t("Vendors.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Vendors.search_vendors")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortRules={sortRules}
            onSortRulesChange={handleSortRulesChange}
            sortableColumns={sortableColumns}
            caseSensitive={caseSensitive}
            onCaseSensitiveChange={handleCaseSensitiveChange}
            nullsFirst={nullsFirst}
            onNullsFirstChange={handleNullsFirstChange}
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
              renderItem={(vendor: Vendor) => <VendorCard key={vendor.id} vendor={vendor} />}
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
