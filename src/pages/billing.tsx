// Components
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/UserContext";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

export default function Billing() {
  const t = useTranslations();
  const { user } = useAuth();
  return (
    <>
      <CustomPageMeta title={t("Billing.title")} description={t("Billing.description")} />
      <main className={`flex flex-col items-center justify-between`}>
        {user?.subscribed_to ? (
          <div>
            <h1>{t("Billing.title")}</h1>
          </div>
        ) : (
          <div>{t("Billing.upgrade_dialog.title")}</div>
        )}
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
