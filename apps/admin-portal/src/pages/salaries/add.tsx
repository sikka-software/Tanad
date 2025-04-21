import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";

import { generateDummySalary } from "@/lib/dummy-factory";

import { SalaryForm, SalaryFormValues } from "@/modules/salary/salary.form";
import { salaryKeys } from "@/modules/salary/salary.hooks";
import { createSalary } from "@/modules/salary/salary.service";
import useSalaryStore from "@/modules/salary/salary.store";
import { Salary, SalaryCreateData } from "@/modules/salary/salary.type";
import useUserStore from "@/stores/use-user-store";

export default function AddSalaryPage() {
  const router = useRouter();
  const t = useTranslations();

  const setLoading = useSalaryStore((state) => state.setIsLoading);
  const loading = useSalaryStore((state) => state.isLoading);

  return (
    <div>
      <PageTitle
        formButtons
        formId="salary-form"
        loading={loading}
        onCancel={() => router.push("/salaries")}
        texts={{
          title: t("Salaries.add_new"),
          submit_form: t("Salaries.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={generateDummySalary}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <SalaryForm
          id="salary-form"
          onSuccess={() =>
            router.push("/salaries").then(() => {
              setLoading(false);
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
