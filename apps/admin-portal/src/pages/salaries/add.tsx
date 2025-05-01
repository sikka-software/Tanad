import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import { generateDummySalary } from "@/lib/dummy-factory";

import { SalaryForm } from "@/salary/salary.form";
import useSalaryStore from "@/salary/salary.store";

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
