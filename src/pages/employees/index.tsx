import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { format } from "date-fns";
import { Building2, Mail, Phone } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import EmployeesTable from "@/components/tables/employees-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useEmployees } from "@/hooks/useEmployees";
import { Employee } from "@/types/employee.type";

export default function EmployeesPage() {
  const t = useTranslations("Employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { data: employees, isLoading, error } = useEmployees();

  const filteredEmployees = Array.isArray(employees)
    ? employees.filter(
        (employee: Employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.department?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const renderEmployee = (employee: Employee) => (
    <Card key={employee.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{employee.name}</h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${employee.email}`} className="hover:text-primary">
              {employee.email}
            </a>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${employee.phone}`} className="hover:text-primary">
                {employee.phone}
              </a>
            </div>
          )}
          {employee.department && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>{employee.department}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/employees/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_employees")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div>
        {viewMode === "table" ? (
          <EmployeesTable
            data={filteredEmployees}
            isLoading={isLoading}
            error={error as Error | null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredEmployees}
              isLoading={isLoading}
              error={error as Error | null}
              emptyMessage={t("no_employees")}
              addFirstItemMessage={t("add_first_employee")}
              renderItem={renderEmployee}
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
