import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { format } from "date-fns";
import { Building2, Mail, Phone, Calendar } from "lucide-react";

import { Employee } from "@/api/employees";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { useEmployees } from "@/hooks/useEmployees";

export default function EmployeesPage() {
  const t = useTranslations("Employees");
  const { data: employees, isLoading, error } = useEmployees();

  const renderEmployee = (employee: Employee) => (
    <Card key={employee.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
          </div>
          <Badge variant={employee.isActive ? "default" : "secondary"}>
            {employee.isActive ? "Active" : "Inactive"}
          </Badge>
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
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Hired {format(new Date(employee.hireDate), "MMM dd, yyyy")}</span>
          </div>
          {employee.salary && (
            <p className="text-sm text-gray-600">Salary: ${employee.salary.toLocaleString()}</p>
          )}
          {employee.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500">{employee.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageTitle
        title={t("title")}
        createButtonLink="/employees/add"
        createButtonText={t("create_employee")}
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={employees}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          emptyMessage={t("no_employees_found")}
          renderItem={renderEmployee}
          gridCols="3"
        />
      </div>
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
