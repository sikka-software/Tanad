import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { SalaryForm } from "@/components/forms/salary-form";
// Import SalaryForm
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { salaryKeys } from "@/hooks/useSalaries";

export default function AddSalaryPage() {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const handleSuccess = (salary: any) => {
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
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/salaries")}>
              {t("General.cancel")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Salaries.salary_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalaryForm onSuccess={handleSuccess} />
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
