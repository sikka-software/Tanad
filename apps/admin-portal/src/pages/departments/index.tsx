import { useState } from "react";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next";

import DataPageLayout from "@/components/layouts/data-page-layout";
import DepartmentsTable from "@/components/tables/departments-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useDepartments } from "@/hooks/useDepartments";
import { Department } from "@/types/department.type";

export default function DepartmentsPage() {
  const t = useTranslations();
  const { data: departments, isLoading, error } = useDepartments();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredDepartments = departments?.filter(
    (department) =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      <PageSearchAndFilter
        title={t("Departments.title")}
        createHref="/departments/add"
        createLabel={t("Departments.add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("Departments.search_departments")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div>
        {viewMode === "table" ? (
          <DepartmentsTable
            data={filteredDepartments || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
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