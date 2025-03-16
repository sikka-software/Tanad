import { useTranslations, useLocale } from "next-intl";
import { GetStaticProps } from "next";
import TOSEn from "@/components/legal/tos-en.mdx";
import TOSAr from "@/components/legal/tos-ar.mdx";

export default function TermsPage() {
  const t = useTranslations();
  const lang = useLocale();

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="p-10 text-5xl font-bold">{t("General.tos")}</div>
      <div className="max-w-7xl w-full p-10 md:p-20">
        <div className="flex flex-row gap-1 text-lg font-bold mb-4">
          <span>{t("General.last-updated")}:</span>
          <span>{"01/12/2023"}</span>
        </div>
        {lang === "ar" ? <TOSAr /> : <TOSEn />}
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
