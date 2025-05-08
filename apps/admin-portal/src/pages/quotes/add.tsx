import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { QuoteForm } from "@/quote/quote.form";

import useQuoteStore from "@/modules/quote/quote.store";

export default function AddQuotePage() {
  const router = useRouter();
  const t = useTranslations();

  const isLoading = useQuoteStore((state) => state.isLoading);
  const setIsLoading = useQuoteStore((state) => state.setIsLoading);

  return (
    <div>
      <CustomPageMeta title={t("Quotes.add_new")} />
      <PageTitle
        formButtons
        formId="quote-form"
        loading={isLoading}
        onCancel={() => router.push("/quotes")}
        texts={{
          title: t("Quotes.add_new"),
          submit_form: t("Quotes.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <QuoteForm
        formHtmlId="quote-form"
        onSuccess={() => {
          router.push("/quotes");
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
