import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyDomain } from "@/lib/dummy-factory";

import { DomainForm } from "@/domain/domain.form";
import useDomainStore from "@/domain/domain.store";

export default function AddDomainPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useDomainStore((state) => state.setIsLoading);
  const isLoading = useDomainStore((state) => state.isLoading);

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
        dummyButton={generateDummyDomain}
      />

      <DomainForm
        formHtmlId="domain-form"
        onSuccess={() => {
          router.push("/domains").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddDomainPage.messages = ["Metadata","Pages", "Domains", "Notes", "General", "PaymentCycles"];

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
