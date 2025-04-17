import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Trash2, X } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import DepartmentsTable from "@/components/tables/departments-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Department } from "@/types/department.type";

import { useDepartments } from "@/hooks/useDepartments";

export default function DepartmentsPage() {
  const t = useTranslations();
  const { data: departments, isLoading, error } = useDepartments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredDepartments = departments?.filter(
    (department) =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedDepartments = selectedRows
    .map((id) => departments?.find((dept) => dept.id === id))
    .filter((dept): dept is Department => dept !== undefined);

  const handleSelectedRowsChange = (rows: Department[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  const handleDeleteSelected = () => {
    // TODO: Implement delete functionality
    console.log("Deleting departments:", selectedDepartments);
  };

  const renderDepartment = (department: Department) => (
    <Card key={department.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{department.name}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {department.description || t("Departments.no_description")}
          </p>
          <p className="text-xs text-gray-500">
            {t("common.created_at")}: {new Date(department.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataPageLayout>
      {selectedRows.length > 0 ? (
        <div className="bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.length} {t("General.items_selected")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {t("General.clear")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t("General.delete")}
            </Button>
          </div>
        </div>
      ) : (
        <PageSearchAndFilter
          title={t("Departments.title")}
          createHref="/departments/add"
          createLabel={t("Departments.add_new")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Departments.search_departments")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      <div>
        {viewMode === "table" ? (
          <DepartmentsTable
            data={filteredDepartments || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            onSelectedRowsChange={handleSelectedRowsChange}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredDepartments || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("Departments.no_departments_found")}
              renderItem={renderDepartment}
              gridCols="3"
            />
          </div>
        )}
      </div>
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
