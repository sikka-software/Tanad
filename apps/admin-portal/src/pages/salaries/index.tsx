import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import SalaryCard from "@/components/app/salary/salary.card";
import SalariesTable from "@/components/app/salary/salary.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import SelectionMode from "@/components/ui/selection-mode";

import type { Salary } from "@/types/salary.type";

import { useSalaries } from "@/hooks/useSalaries";
import { useSalariesStore } from "@/stores/salaries.store";

export default function SalariesPage() {
  const t = useTranslations();
  const { data: salaries, isLoading, error } = useSalaries();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { selectedRows, clearSelection, bulkDeleteSalaries } = useSalariesStore();

  const filteredSalaries = salaries?.filter(
    (salary) =>
      salary.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salary.notes || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConfirmDelete = async () => {
    try {
      await bulkDeleteSalaries(selectedRows);
      clearSelection();
      setIsDeleteDialogOpen(false);
      toast.success(t("Salaries.success.title"), {
        description: t("Salaries.messages.success_deleted"),
      });
    } catch (error) {
      toast.error(t("Salaries.error.title"), {
        description: t("Salaries.messages.error_delete"),
      });
    }
  };

  return (
    <DataPageLayout>
      {selectedRows.length > 0 ? (
        <SelectionMode
          selectedRows={selectedRows}
          clearSelection={clearSelection}
          isDeleting={false}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        />
      ) : (
        <PageSearchAndFilter
          title={t("Salaries.title")}
          createHref="/salaries/add"
          createLabel={t("Salaries.create_salary")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Salaries.search_salaries")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      <div>
        {viewMode === "table" ? (
          <SalariesTable
            data={filteredSalaries || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredSalaries || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("Salaries.no_salaries_found")}
              renderItem={(salary: Salary) => <SalaryCard key={salary.id} salary={salary} />}
              gridCols="3"
            />
          </div>
        )}
      </div>

      <ConfirmDelete
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isDeleting={false}
        handleConfirmDelete={handleConfirmDelete}
        title={t("Salaries.delete_salary")}
        description={t("Salaries.confirm_delete")}
      />
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
