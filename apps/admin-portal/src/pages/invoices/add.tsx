import { format } from "date-fns";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { InvoiceForm, type InvoiceFormValues } from "@/invoice/invoice.form";

export default function AddInvoicePage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      // Calculate final amounts
      const subtotal = data.subtotal;
      const tax_amount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + tax_amount;

      // Format dates to ISO string (YYYY-MM-DD)
      const formattedIssueDate = format(data.issue_date, "yyyy-MM-dd");
      const formattedDueDate = format(data.due_date, "yyyy-MM-dd");

      // Prepare data payload for the API
      const payload = {
        client_id: data.client_id,
        invoice_number: data.invoice_number.trim(),
        issue_date: formattedIssueDate,
        due_date: formattedDueDate,
        status: data.status,
        subtotal: subtotal,
        tax_rate: data.tax_rate,
        notes: data.notes?.trim() || null,
        items: data.items.map((item) => ({
          product_id: item.product_id || null,
          description: item.description || "",
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
        })),
      };

      // Call the API endpoint
      const response = await fetch("/api/resource/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      toast.success(t("General.successful_operation"), {
        description: t("Invoices.success.created"),
      });

      router.push("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(t("General.error_operation"), {
        description: t("Invoices.error.creating"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Invoices.add_new")} />
      <PageTitle
        formButtons
        formId="invoice-form"
        loading={loading}
        onCancel={() => router.push("/invoices")}
        texts={{
          title: t("Invoices.add_new"),
          submit_form: t("Invoices.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <InvoiceForm id="invoice-form" onSubmit={handleSubmit} loading={loading} />
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
