import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowLeft } from "lucide-react";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddInvoicePage() {
  const router = useRouter();
  const t = useTranslations("Invoices");

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/invoices" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{t("add_new")}</h1>
        </div>

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
