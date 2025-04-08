import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { toast } from "sonner";

import { InvoiceForm, type InvoiceFormValues } from "@/components/forms/invoice-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function AddInvoicePage() {
  const t = useTranslations("Invoices");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      if (!userId) {
        throw new Error("You must be logged in to create an invoice");
      }

      // Calculate final amounts
      const subtotal = data.subtotal;
      const taxAmount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + taxAmount;

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
            user_id: userId,
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

      toast.success(t("success.title"), {
        description: t("success.created"),
      });

      router.push("/invoices");
    } catch (error) {
      console.error(error);
      toast.error(t("error.title"), {
        description: error instanceof Error ? error.message : t("error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("add_new")}
        createButtonLink="/invoices"
        createButtonText={t("back_to_list")}
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/invoices")}>
              {t("cancel")}
            </Button>
            <Button type="submit" form="invoice-form" disabled={loading}>
              {loading ? t("saving") : t("save")}
            </Button>
          </div>
        }
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
