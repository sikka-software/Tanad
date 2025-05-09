import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import CustomersSection from "@/ui/customers-section";
import { HeroSection as HeroSection2 } from "@/ui/hero-section-2";

// import BottomCTA from "@/components/landing/BottomCTA";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
// import Features from "@/components/landing/Features";
// import FloatingPuklas from "@/components/landing/FloatingPuklas";
// import HeroSection from "@/components/landing/HeroSection";
import { DepartmentsFeatures } from "@/components/landing/departments-features";
import { FeaturesSection } from "@/components/landing/features-section";
import { Pricing } from "@/components/landing/pricing-with-comparison";

// import WaitlistSection from "@/components/landing/waitlist-section";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      <CustomPageMeta title={t("SEO.landing.title")} description={t("SEO.landing.description")} />
      <HeroSection2 />
      <CustomersSection />
      <DepartmentsFeatures />
      <FeaturesSection />
      <Pricing />

      {/* <div className="flex flex-col gap-[150px]">
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
      /> */}
    </div>
  );
}

LandingPage.messages = ["Pages", "General", "Landing"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, LandingPage.messages),
    },
  };
};
