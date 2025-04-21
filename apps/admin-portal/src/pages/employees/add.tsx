import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";

import { generateDummyData } from "@/lib/dummy-generator";

import { EmployeeForm } from "@/modules/employee/employee.form";
import useEmployeesStore from "@/modules/employee/employee.store";

export default function AddEmployeePage() {
  const t = useTranslations();
  const router = useRouter();
  const setLoadingSave = useEmployeesStore((state) => state.setIsLoading);
  const loadingSave = useEmployeesStore((state) => state.isLoading);

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
      form.setValue("salary", dummyData.randomNumber);
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
        loading={loadingSave}
        onCancel={() => router.push("/employees")}
        texts={{
          title: t("Employees.add_new"),
          submit_form: t("Employees.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />
      <div className="mx-auto max-w-2xl p-4">
        <EmployeeForm
          id="employee-form"
          onSuccess={() =>
            router.push("/employees").then(() => {
              setLoadingSave(false);
            })
          }
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
