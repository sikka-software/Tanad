import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import WaitlistSection from "@/components/landing/waitlist-section";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      <CustomPageMeta title={t("SEO.landing.title")} description={t("SEO.landing.description")} />
      <WaitlistSection />
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
