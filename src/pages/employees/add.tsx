import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

import { EmployeeForm, type EmployeeFormValues } from "@/components/forms/employee-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddEmployeePage() {
  const t = useTranslations("Employees");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: EmployeeFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null,
          position: data.position.trim(),
          department: data.department?.trim() || null,
          hireDate: data.hireDate,
          salary: data.salary ? parseFloat(data.salary) : null,
          isActive: data.isActive,
          notes: data.notes?.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("messages.error"));
      }

      // Get the new employee data
      const newEmployee = await response.json();

      // Update the employees cache to include the new employee
      const previousEmployees = queryClient.getQueryData(["employees"]) || [];
      queryClient.setQueryData(
        ["employees"],
        [...(Array.isArray(previousEmployees) ? previousEmployees : []), newEmployee]
      );

      router.push("/employees");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("add_employee")}
        createButtonLink="/employees"
        createButtonText={t("back_to_list")}
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/employees")}>
              {t("cancel")}
            </Button>
            <Button type="submit" size="sm" form="employee-form" disabled={loading}>
              {loading ? t("messages.creating_employee") : t("messages.create_employee")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("employee_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm id="employee-form" onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
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
