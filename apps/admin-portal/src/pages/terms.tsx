import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";

// import TOSAr from "@/components/legal/tos-ar.mdx";
// import TOSEn from "@/components/legal/tos-en.mdx";

export default function TermsPage() {
  const t = useTranslations();
  const lang = useLocale();

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="p-10 text-5xl font-bold">{t("General.tos")}</div>
      <div className="w-full max-w-7xl p-10 md:p-20">
        <div className="mb-4 flex flex-row gap-1 text-lg font-bold">
          <span>{t("General.last-updated")}:</span>
          <span>{"01/12/2023"}</span>
        </div>
        {/* {lang === "ar" ? <TOSAr /> : <TOSEn />} */}
      </div>
    </div>
  );
}

TermsPage.messages = ["Metadata", "Pages", "Terms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, TermsPage.messages),
    },
  };
};
