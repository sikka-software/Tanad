import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import OfficeCard from "@/modules/office/office.card";
import OfficesTable from "@/modules/office/office.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Office } from "@/types/office.type";

import { useOffices, useBulkDeleteOffices } from "@/hooks/models/useOffices";
import { useOfficesStore } from "@/stores/offices.store";

export default function OfficesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: offices, isLoading, error } = useOffices();

  const { selectedRows, setSelectedRows, clearSelection } = useOfficesStore();
  const { mutate: deleteOffices, isPending: isDeleting } = useBulkDeleteOffices();

  const filteredOffices = offices?.filter(
    (office: Office) =>
      office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRowSelectionChange = (rows: Office[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteOffices(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete offices:", error);
          toast.error(t("Offices.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete offices:", error);
      setIsDeleteDialogOpen(false);
    }
  };

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
            title={t("Offices.title")}
            createHref="/offices/add"
            createLabel={t("Offices.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Offices.search_offices")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <OfficesTable
              data={filteredOffices || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onSelectedRowsChange={handleRowSelectionChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredOffices || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Offices.no_offices_found")}
                renderItem={(office: Office) => <OfficeCard office={office} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
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
