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
import { Salary, SalaryCreateData } from "@/modules/salary/salary.type";
import useUserStore from "@/stores/use-user-store";

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

  // Data is SalaryFormValues (numbers for amounts)
  const handleSubmit = async (data: SalaryFormValues) => {
    setLoading?.(true);
    try {
      const salaryData = {
        ...data,
        deductions: data.deductions ? JSON.parse(data.deductions) : null,
        notes: data.notes?.trim() || null,
        user_id: user?.id,
      };

      let result: Salary;

      result = await createSalary(salaryData as SalaryCreateData);

      toast.success(t("General.successful_operation"), {
        description: t("Salaries.messages.success_created"),
      });

      const previousSalaries = queryClient.getQueryData(salaryKeys.lists()) || [];
      queryClient.setQueryData(salaryKeys.lists(), [
        ...(Array.isArray(previousSalaries) ? previousSalaries : []),
        result,
      ]);

      router.push("/salaries");
    } catch (error) {
      console.error("Failed to save salary:", error);
      const description =
        error instanceof SyntaxError
          ? t("Salaries.form.deductions.invalid_json")
          : error instanceof Error
            ? error.message
            : t("Salaries.messages.error_save");
      toast.error(t("Salaries.error.title"), {
        description,
      });
      setLoading(false);
    }
  };

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
        <SalaryForm id="salary-form" onSubmit={handleSubmit} loading={loading} />
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
