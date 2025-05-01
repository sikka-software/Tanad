import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/ui/button";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

export default function Eror404Page() {
  const t = useTranslations("Landing");
  return (
    <>
      <CustomPageMeta title={t("not-found.title")} />
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-10 md:px-0">
        <div className="text-center text-5xl font-bold">{t("not-found.title")} - 404</div>
        <div className="text-center">{t("not-found.subtitle")}</div>
        <Link href="/">
          <Button>{t("home")}</Button>
        </Link>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
