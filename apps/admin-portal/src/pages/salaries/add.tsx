import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { SalaryForm } from "@/components/app/salary/salary.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import useUserStore from "@/hooks/use-user-store";
import { salaryKeys } from "@/hooks/useSalaries";

export default function AddSalaryPage() {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  const handleSuccess = (salary: any) => {
    setLoading(false);
    // Update the salaries cache to include the new salary
    const previousSalaries = queryClient.getQueryData(salaryKeys.lists()) || [];
    queryClient.setQueryData(salaryKeys.lists(), [
      ...(Array.isArray(previousSalaries) ? previousSalaries : []),
      salary,
    ]);

    // Navigate to salaries list
    router.push("/salaries");
  };

  return (
    <div>
      <PageTitle
        title={t("Salaries.add_new")}
        formButtons
        formId="salary-form"
        loading={loading}
        onCancel={() => router.push("/salaries")}
        texts={{
          submit_form: t("Salaries.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Salaries.salary_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalaryForm
              id="salary-form"
              onSuccess={handleSuccess}
              loading={loading}
              setLoading={setLoading}
              user_id={user?.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
