import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { InvoiceForm, type InvoiceFormValues } from "@/modules/invoice/invoice.form";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

export default function AddInvoicePage() {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  const handleSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error("You must be logged in to create an invoice");
      }

      // Calculate final amounts
      const subtotal = data.subtotal;
      const tax_amount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + tax_amount;

      // First create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            client_id: data.client_id,
            invoice_number: data.invoice_number.trim(),
            issue_date: data.issue_date,
            due_date: data.due_date,
            status: data.status,
            subtotal: subtotal,
            tax_rate: data.tax_rate,
            notes: data.notes?.trim() || null,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Then add invoice items
      const invoiceItems = data.items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id || null,
        description: item.description || "",
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast.success(t("General.successful_operation"), {
        description: t("Invoices.success.created"),
      });

      router.push("/invoices");
    } catch (error) {
      console.error(error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Invoices.error.create"),
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

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("invoice_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm id="invoice-form" onSubmit={handleSubmit} loading={loading} />
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
