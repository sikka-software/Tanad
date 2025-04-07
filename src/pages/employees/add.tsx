import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { EmployeeForm } from "@/components/forms/employee-form";
import PageTitle from "@/components/ui/page-title";

export default function AddEmployeePage() {
  const t = useTranslations("Employees");

  return (
    <div className="container py-10">
      <PageTitle
        title={t("add_employee")}
        createButtonLink="/employees"
        createButtonText={t("back_to_list")}
      />
      <div className="mt-8">
        <EmployeeForm />
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
