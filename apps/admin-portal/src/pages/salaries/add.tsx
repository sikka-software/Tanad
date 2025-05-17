import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import { generateDummySalary } from "@/lib/dummy-factory";

import { SalaryForm } from "@/salary/salary.form";
import useSalaryStore from "@/salary/salary.store";

export default function AddSalaryPage() {
  const router = useRouter();
  const t = useTranslations();

  const setLoadingSave = useSalaryStore((state) => state.setIsLoading);
  const loadingSave = useSalaryStore((state) => state.isLoading);

  return (
    <div>
      <PageTitle
        formButtons
        formId="salary-form"
        loading={loadingSave}
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
          router.push("/salaries").then(() => {
            setLoadingSave(false);
          });
        }}
      />
    </div>
  );
}

AddSalaryPage.messages = [
  "Metadata",
  "Notes",
  "Pages",
  "Salaries",
  "Employees",
  "Jobs",
  "Forms",
  "Departments",
  "General",
];

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
