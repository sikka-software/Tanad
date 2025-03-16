import { useTranslations } from "next-intl";
import { GetStaticProps } from "next";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import BottomCTA from "@/components/landing/BottomCTA";
import HeroSection from "@/components/landing/HeroSection";
import FloatingPuklas from "@/components/landing/FloatingPuklas";
import Features from "@/components/landing/Features";
import Link from "next/link";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      <CustomPageMeta
        title={t("SEO.landing.title")}
        description={t("SEO.landing.description")}
      />

      <div className="flex flex-col gap-[150px]">
        <div className="flex flex-col gap-[150px] px-10 py-24 pt-32 md:pt-44">
          <HeroSection
            withAction
            title={t("Landing.hero.title")}
            subtitle={t("Landing.hero.subtitle")}
            actionPath="/dashboard"
          />
        </div>
      </div>
      <FloatingPuklas />
      <Features />
      <BottomCTA
        title={t("Landing.cta.title")}
        subtitle={t("Landing.cta.subtitle")}
        primaryActionText={t("Landing.cta.action-1-text")}
        primaryActionSlug={"/dashboard"}
      />
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
