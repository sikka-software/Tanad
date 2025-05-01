import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";

import { Card, CardContent } from "@/ui/card";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { OnboardingForm } from "@/modules/onboarding/onboarding.form";

export default function OnboardingPage() {
  const t = useTranslations();
  const lang = useLocale();
  const { resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="flex h-full flex-col items-center justify-center py-12 sm:px-6 lg:px-8"
    >
      <CustomPageMeta title={t("SEO.auth.title")} description={t("SEO.auth.description")} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          loading="lazy"
          width={512}
          height={512}
          src={`https://sikka-images.s3.ap-southeast-1.amazonaws.com/products/tanad/tanad_symbol_${
            !isMounted || resolvedTheme === "dark" ? "white" : "black"
          }.png`}
          className="aspect-auto h-[30px] w-auto mb-4"
          alt="Tanad Logo"
        />
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
