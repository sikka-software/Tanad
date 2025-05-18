import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyEmployee } from "@/lib/dummy-factory";

import { EmployeeForm } from "@/employee/employee.form";
import useEmployeesStore from "@/employee/employee.store";

export default function AddEmployeePage() {
  const t = useTranslations();
  const router = useRouter();

  const setLoadingSave = useEmployeesStore((state) => state.setIsLoading);
  const loadingSave = useEmployeesStore((state) => state.isLoading);

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
        dummyButton={generateDummyEmployee}
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
  "Metadata",
  "Employees",
  "Jobs",
  "Departments",
  "Pages",
  "Notes",
  "General",
  "Forms",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddEmployeePage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
