import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { CompanyForm } from "@/company/company.form";
import useCompanyStore from "@/company/company.store";

export default function AddCompanyPage() {
  const t = useTranslations();
  const router = useRouter();

  const setIsLoading = useCompanyStore((state) => state.setIsLoading);
  const isLoading = useCompanyStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).companyForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("street_name", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("region", "Eastern");
      form.setValue("zip_code", String(dummyData.zip_code));
      form.setValue("building_number", String(dummyData.randomNumber));
      form.setValue("additional_number", String(dummyData.randomNumber));
      form.setValue("industry", dummyData.randomString);
      form.setValue("size", String(dummyData.randomNumber));
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Companies.success.create"),
    });
    router.push("/companies");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Companies.add")} />
      <PageTitle
        formButtons
        formId="company-form"
        loading={isLoading}
        onCancel={() => router.push("/companies")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Pages.Companies.add"),
          submit_form: t("Pages.Companies.add"),
          cancel: t("General.cancel"),
        }}
      />
      <CompanyForm formHtmlId="company-form" onSuccess={onAddSuccess} />
    </div>
  );
}

AddCompanyPage.messages = ["Pages", "General", "Companies", "Forms"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddCompanyPage.messages,
      ),
    },
  };
};
