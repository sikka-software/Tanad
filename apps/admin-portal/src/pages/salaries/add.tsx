import { pick } from "lodash";
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
          title: t("Pages.Salaries.add"),
          submit_form: t("Pages.Salaries.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummySalary}
      />

      <SalaryForm
        formHtmlId="salary-form"
        onSuccess={() => {
          router.push("/salaries");
          setLoading(false);
        }}
      />
    </div>
  );
}

AddSalaryPage.messages = ["Notes", "Pages", "Salaries", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddSalaryPage.messages,
      ),
    },
  };
};
