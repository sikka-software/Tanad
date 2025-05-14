import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { DomainForm } from "@/domain/domain.form";
import useDomainStore from "@/domain/domain.store";

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
      form.setValue("monthly_cost", dummyData.randomNumber(3));
      form.setValue("annual_cost", dummyData.randomNumber(3));
      form.setValue("payment_cycle", dummyData.randomPicker(["monthly", "annual"]));
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      form.setValue("notes", dummyData.state);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Domains.add")} />
      <PageTitle
        formButtons
        formId="domain-form"
        loading={isLoading}
        onCancel={() => router.push("/domains")}
        texts={{
          title: t("Pages.Domains.add"),
          submit_form: t("Pages.Domains.add"),
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

AddDomainPage.messages = ["Pages", "Domains", "Notes", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddDomainPage.messages,
      ),
    },
  };
};
