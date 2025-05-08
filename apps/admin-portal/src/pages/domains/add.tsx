import useDomainStore from "@root/src/modules/domain/domain.store";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { DomainForm } from "@/modules/domain/domain.form";

export default function AddDomainPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useDomainStore((state) => state.setIsLoading);
  const isLoading = useDomainStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).domainForm;
    if (form) {
      form.setValue("domain_name", dummyData.first_name.toLowerCase() + ".com");
      form.setValue("registrar", dummyData.email);
      form.setValue("monthly_cost", dummyData.randomNumber);
      form.setValue("annual_cost", dummyData.randomNumber);
      form.setValue("payment_cycle", dummyData.randomPicker(["monthly", "annual"]));
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      form.setValue("notes", dummyData.state);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Domains.add_new")} />
      <PageTitle
        formButtons
        formId="domain-form"
        loading={isLoading}
        onCancel={() => router.push("/domains")}
        texts={{
          title: t("Domains.add_new"),
          submit_form: t("Domains.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <DomainForm
        formHtmlId="domain-form"
        onSuccess={() => {
          router.push("/domains");
          setIsLoading(false);
        }}
      />
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
