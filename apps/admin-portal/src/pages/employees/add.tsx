import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { EmployeeForm, type EmployeeFormValues } from "@/components/app/employee/employee.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import { useEmployeesStore } from "@/stores/employees.store";
import useUserStore from "@/stores/use-user-store";

export default function AddEmployeePage() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const { loadingSave, setLoadingSave } = useEmployeesStore();

  const handleSubmit = async (data: EmployeeFormValues) => {
    setLoadingSave(true);
    // try {
    //   const response = await fetch("/api/employees/create", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${user?.id}`,
    //     },
    //     body: JSON.stringify({
    //       first_name: data.first_name.trim(),
    //       last_name: data.last_name.trim(),
    //       email: data.email.trim(),
    //       phone: data.phone?.trim() || null,
    //       position: data.position.trim(),
    //       department_id: data.department || null,
    //       hireDate: data.hireDate,
    //       salary: data.salary ? parseFloat(data.salary) : null,
    //       status: data.status,
    //       notes: data.notes?.trim() || null,
    //     }),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.error || t("Employees.messages.error"));
    //   }

    //   // Get the new employee data
    //   const newEmployee = await response.json();

    //   const previousEmployees = queryClient.getQueryData(["employees"]) || [];
    //   queryClient.setQueryData(
    //     ["employees"],
    //     [...(Array.isArray(previousEmployees) ? previousEmployees : []), newEmployee],
    //   );

    //   toast.success(t("General.successful_operation"), {
    //     description: t("Employees.success.created"),
    //   });
    //   router.push("/employees");
    // } catch (error) {
    //   console.error(error);
    //   toast.error(t("General.error_operation"), {
    //     description: error instanceof Error ? error.message : t("Employees.error.create"),
    //   });
    //   throw error;
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div>
      <PageTitle
        title={t("Employees.add_new")}
        formButtons
        formId="employee-form"
        loading={loadingSave}
        onCancel={() => router.push("/employees")}
        texts={{
          submit_form: t("Employees.add_new"),
          cancel: t("General.cancel"),
        }}
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Employees.employee_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm id="employee-form" onSubmit={handleSubmit} />
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
