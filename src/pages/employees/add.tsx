import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { EmployeeForm } from "@/components/forms/employee-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddEmployeePage() {
  const t = useTranslations("Employees");

  return (
    <div>
      <PageTitle
        title={t("add_employee")}
        createButtonLink="/employees"
        createButtonText={t("back_to_list")}
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("employee_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm />
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
