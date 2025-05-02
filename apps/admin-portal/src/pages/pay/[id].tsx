import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import { createClient } from "@/utils/supabase/server-props";

import { MoneyFormatter } from "@/components/ui/currency-input";

import { Invoice, InvoiceItem } from "@/invoice/invoice.type";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";

interface Props {
  invoice: Invoice;
}

export default function InvoicePreviewPage({ invoice }: Props) {
  const t = useTranslations("Invoices");

  console.log("invoice is ", invoice);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-2xl font-bold">
          {t("invoice_number", { number: invoice.invoice_number })}
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">{t("issue_date")}</p>
          <p>{new Date(invoice.issue_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-2 text-lg font-semibold">{t("from")}</h2>
          <p>Your Company Name</p>
          <p>Your Company Address</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">{t("to")}</h2>
          <p>{invoice.client?.company}</p>
          <p>{invoice.client?.name}</p>
          <p>{invoice.client?.email}</p>
        </div>
      </div>

      {/* Invoice items table would go here */}

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between">
          <span className="font-semibold">{t("total")}</span>
          <span className="text-lg font-bold">{MoneyFormatter(invoice.total)}</span>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, locale, req, res } = context;
  const invoice_id = params?.id as string;
  console.log(">>> Fetching invoice for ID:", invoice_id);

  if (!invoice_id) {
    console.log(">>> No invoice ID provided in params.");
    return { notFound: true };
  }

  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(">>> Supabase auth error:", userError);
    return { notFound: true };
  }

  try {
    const invoiceData = await supabase.from("invoices").select("*").eq("id", invoice_id).single();

    console.log(">>> Base invoice data fetched:", invoiceData);

    if (!invoiceData) {
      console.log(">>> Invoice not found or RLS prevented access.");
      return { notFound: true };
    }

    const invoiceItems = await db.query.invoice_items.findMany({
      where: eq(schema.invoice_items.invoice_id, invoice_id),
    });

    console.log(">>> Invoice items fetched:", invoiceItems);

    const fullInvoice: Invoice = {
      ...(invoiceData as unknown as Omit<Invoice, "items">),
      items: invoiceItems as unknown as InvoiceItem[],
    };

    return {
      props: {
        invoice: fullInvoice,
        messages: (await import(`../../../locales/${locale}.json`)).default,
      },
    };
  } catch (error) {
    console.error(">>> Error fetching invoice details directly:", error);
    return { notFound: true };
  }
};
