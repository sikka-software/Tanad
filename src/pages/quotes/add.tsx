import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { QuoteForm } from "@/components/forms/quote-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddQuotePage() {
  const t = useTranslations("Quotes");

  return (
    <div>
      <PageTitle
        title={t("add_new")}
        createButtonLink="/quotes"
        createButtonText={t("back_to_list")}
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("quote_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteForm />
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
