import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { InvoiceForm } from "@/invoice/invoice.form";

import useInvoiceStore from "@/modules/invoice/invoice.store";

export default function AddInvoicePage() {
  const t = useTranslations();
  const router = useRouter();

  const isLoading = useInvoiceStore((state) => state.isLoading);
  const setIsLoading = useInvoiceStore((state) => state.setIsLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Invoices.add")} />
      <PageTitle
        formButtons
        formId="invoice-form"
        loading={isLoading}
        onCancel={() => router.push("/invoices")}
        texts={{
          title: t("Pages.Invoices.add"),
          submit_form: t("Pages.Invoices.add"),
          cancel: t("General.cancel"),
        }}
      />

      <InvoiceForm
        formHtmlId="invoice-form"
        onSuccess={() => {
          router.push("/invoices").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddInvoicePage.messages = ["Metadata",
  "Notes",
  "Pages",
  "Invoices",
  "Clients",
  "Companies",
  "Forms",
  "Products",
  "ProductsFormSection",
  "General",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddInvoicePage.messages,
      ),
    },
  };
};
