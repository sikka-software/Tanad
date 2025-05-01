import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import { createClient } from "@/utils/supabase/component";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { QuoteForm, type QuoteFormValues } from "@/quote/quote.form";

import useUserStore from "@/stores/use-user-store";

export default function AddQuotePage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  const handleSubmit = async (data: QuoteFormValues) => {
    setLoading(true);
    try {
      // Calculate final amounts
      const subtotal = data.items.reduce((acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unit_price = parseFloat(item.unit_price) || 0;
        return acc + quantity * unit_price;
      }, 0);

      const tax_amount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + tax_amount;

      // First create the quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert([
          {
            client_id: data.client_id,
            quote_number: data.quote_number.trim(),
            issue_date: data.issue_date,
            expiry_date: data.expiry_date,
            status: data.status,
            subtotal: subtotal,
            tax_rate: data.tax_rate,
            notes: data.notes?.trim() || null,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Then add quote items
      const quoteItems = data.items.map((item) => ({
        quote_id: quote.id,
        product_id: item.product_id || null,
        description: item.description || "",
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      }));

      const { error: itemsError } = await supabase.from("quote_items").insert(quoteItems);

      if (itemsError) throw itemsError;

      toast.success(t("General.successful_operation"), {
        description: t("Quotes.success.created"),
      });

      router.push("/quotes");
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Quotes.error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Quotes.add_new")} />
      <PageTitle
        formButtons
        formId="quote-form"
        loading={loading}
        onCancel={() => router.push("/quotes")}
        texts={{
          title: t("Quotes.add_new"),
          submit_form: t("Quotes.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="mx-auto max-w-2xl p-4">
        <QuoteForm
          id="quote-form"
          user_id={user?.id}
          onSubmit={handleSubmit}
          loading={loading}
          hideFormButtons
        />
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
