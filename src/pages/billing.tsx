// Components
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next";

export default function Billing() {
  const t = useTranslations();
  return (
    <>
      <CustomPageMeta
        title={t("Billing.title")}
        description={t("Billing.description")}
      />
      <main className={`flex flex-col items-center justify-between`}>
        {t("General.coming_soon")}
      </main>
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
