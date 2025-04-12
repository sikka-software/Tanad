import { useState, useEffect, useRef } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { QuoteForm, type QuoteFormValues } from "@/components/forms/quote-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function AddQuotePage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        router.push("/auth/login");
      }
    };

    getUserId();
  }, [router]);

  const handleSubmit = async (data: QuoteFormValues) => {
    setLoading(true);
    try {
      // Calculate final amounts
      const subtotal = data.items.reduce((acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return acc + quantity * unitPrice;
      }, 0);

      const taxAmount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + taxAmount;

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
            user_id: userId,
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

      toast.success(t("Quotes.success.title"), {
        description: t("Quotes.success.created"),
      });

      router.push("/quotes");
    } catch (error) {
      toast.error(t("Quotes.error.title"), {
        description: error instanceof Error ? error.message : t("Quotes.error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Quotes.add_new_quote")}
        createButtonLink="/quotes"
        createButtonText={t("Quotes.back_to_list")}
        customButton={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/quotes")}>
              {t("General.cancel")}
            </Button>
            <Button type="submit" size="sm" form="quote-form" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Quotes.create_quote")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Quotes.quote_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteForm
              id="quote-form"
              userId={userId}
              onSubmit={handleSubmit}
              loading={loading}
              hideFormButtons
            />
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
