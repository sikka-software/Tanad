import { useRef, RefObject } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { QuoteForm } from "@/components/forms/quote-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddQuotePage() {
  const router = useRouter();
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmitClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Quotes.add_new_quote")}
        createButtonLink="/quotes"
        createButtonText={t("Quotes.back_to_list")}
        customButton={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push("/quotes")}
            >
              {t("General.cancel")}
            </Button>
            <Button type="button" size="sm" onClick={handleSubmitClick}>
              {t("Quotes.create_quote")}
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
            <QuoteForm formRef={formRef as RefObject<HTMLFormElement>} hideFormButtons />
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
