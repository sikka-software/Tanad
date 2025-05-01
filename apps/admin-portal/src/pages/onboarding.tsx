import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";

import { Card, CardContent } from "@/ui/card";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { OnboardingForm } from "@/modules/onboarding/onboarding.form";

export default function OnboardingPage() {
  const t = useTranslations();
  const lang = useLocale();

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="flex h-full flex-col items-center justify-center py-12 sm:px-6 lg:px-8"
    >
      <CustomPageMeta title={t("SEO.auth.title")} description={t("SEO.auth.description")} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">{t("OnBoarding.title")}</h1>
        <div className="text-muted-foreground w-full pt-4 text-center text-sm md:text-start xl:whitespace-nowrap">
          {t("OnBoarding.description")}
        </div>
      </div>
      <div className="mt-8 flex w-full max-w-[90%] flex-col gap-2 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="w-full">
          <CardContent className="pt-6">
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
