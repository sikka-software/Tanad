import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import { format } from "date-fns";

import { Invoice } from "@/types/invoice.type";
import { fetchInvoiceById } from "@/services/invoiceService";

interface Props {
  invoice: Invoice;
}

export default function InvoicePreviewPage({ invoice }: Props) {
  const t = useTranslations("Invoices");

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-2xl font-bold">
          {t("invoice_number", { number: invoice.invoiceNumber })}
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">{t("issue_date")}</p>
          <p>{format(new Date(invoice.issueDate), "MMM dd, yyyy")}</p>
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
          <span className="text-lg font-bold">${invoice.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, locale } = context;
  const invoiceId = params?.invoice as string;

  try {
    const invoice = await fetchInvoiceById(invoiceId);
    if (!invoice) {
      return { notFound: true };
    }

    return {
      props: {
        invoice,
        messages: (await import(`../../../locales/${locale}.json`)).default,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
};
