import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { EmployeeForm } from "@/employee/employee.form";
import useEmployeesStore from "@/employee/employee.store";

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
      form.setValue("email", dummyData.randomNumber(3) + dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("position", dummyData.employee_position);
      form.setValue("status", dummyData.employee_status);
      form.setValue("notes", dummyData.employee_notes);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Employees.add")} />
      <PageTitle
        formButtons
        formId="employee-form"
        loading={loadingSave}
        onCancel={() => router.push("/employees")}
        texts={{
          title: t("Pages.Employees.add"),
          submit_form: t("Pages.Employees.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />
      <EmployeeForm
        formHtmlId="employee-form"
        onSuccess={() => {
          router.push("/employees").then(() => {
            setLoadingSave(false);
          });
        }}
      />
    </div>
  );
}

AddEmployeePage.messages = [
  "Employees",
  "Jobs",
  "Departments",
  "Pages",
  "Notes",
  "General",
  "Forms",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddEmployeePage.messages,
      ),
    },
  };
};
