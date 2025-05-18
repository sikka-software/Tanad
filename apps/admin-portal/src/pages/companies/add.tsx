import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyCompany } from "@/lib/dummy-factory";

import { CompanyForm } from "@/company/company.form";
import useCompanyStore from "@/company/company.store";

export default function AddCompanyPage() {
  const t = useTranslations();
  const router = useRouter();

  const setIsLoading = useCompanyStore((state) => state.setIsLoading);
  const isLoading = useCompanyStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Companies.add")} />
      <PageTitle
        formButtons
        formId="company-form"
        loading={isLoading}
        onCancel={() => router.push("/companies")}
        dummyButton={generateDummyCompany}
        texts={{
          title: t("Pages.Companies.add"),
          submit_form: t("Pages.Companies.add"),
          cancel: t("General.cancel"),
        }}
      />
      <CompanyForm
        formHtmlId="company-form"
        onSuccess={() => {
          router.push("/companies").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddCompanyPage.messages = ["Metadata", "Notes", "Pages", "General", "Companies", "Forms"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddCompanyPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
