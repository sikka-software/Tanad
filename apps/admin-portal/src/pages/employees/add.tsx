import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { EmployeeForm } from "@/employee/employee.form";
import useEmployeesStore from "@/employee/employee.store";

import { useCreateEmployee, useUpdateEmployee } from "@/modules/employee/employee.hooks";

export default function AddEmployeePage() {
  const t = useTranslations();
  const router = useRouter();
  const setLoadingSave = useEmployeesStore((state) => state.setIsLoading);
  const loadingSave = useEmployeesStore((state) => state.isLoading);

  const { mutateAsync: updateEmployeeMutate, isPending: isUpdatingEmployee } = useUpdateEmployee();
  const { mutateAsync: createEmployeeMutate, isPending: isCreatingEmployee } = useCreateEmployee();

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).employeeForm;
    if (form) {
      form.setValue("first_name", dummyData.first_name);
      form.setValue("last_name", dummyData.last_name);
      form.setValue("email", dummyData.randomNumber + dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("position", dummyData.employee_position);
      form.setValue("hire_date", dummyData.employee_hire_date);
      form.setValue("status", dummyData.employee_status);
      form.setValue("notes", dummyData.employee_notes);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Employees.add_new")} />
      <PageTitle
        formButtons
        formId="employee-form"
        loading={isCreatingEmployee}
        onCancel={() => router.push("/employees")}
        texts={{
          title: t("Employees.add_new"),
          submit_form: t("Employees.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />
      <EmployeeForm
        formHtmlId="employee-form"
        onSuccess={() =>
          router.push("/employees").then(() => {
            setLoadingSave(false);
          })
        }
        createEmployee={createEmployeeMutate}
        updateEmployee={updateEmployeeMutate}
        isSubmitting={isCreatingEmployee || isUpdatingEmployee}
      />
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
