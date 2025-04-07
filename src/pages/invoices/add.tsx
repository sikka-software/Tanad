import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddInvoicePage() {
  const router = useRouter();
  const t = useTranslations("Invoices");

  return (
    <div>
      <PageTitle
        title={t("add_new")}
        createButtonLink="/invoices"
        createButtonText={t("back_to_list")}
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("invoice_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm />
          </CardContent>
        </Card>
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
