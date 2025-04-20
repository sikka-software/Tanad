import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { CompanyForm } from "@/modules/company/company.form";
import useCompanyStore from "@/modules/company/company.store";

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
      form.setValue("address", dummyData.address);
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Companies.success.created"),
    });
    router.push("/companies");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Companies.add_new")} />
      <PageTitle
        formButtons
        formId="company-form"
        loading={isLoading}
        onCancel={() => router.push("/companies")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Companies.add_new"),
          submit_form: t("Companies.add_new"),
          cancel: t("General.cancel"),
        }}
      />
      <div className="mx-auto max-w-2xl p-4">
        <CompanyForm id="company-form" onSuccess={onAddSuccess} />
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
