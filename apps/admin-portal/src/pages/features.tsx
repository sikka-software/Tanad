import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import BottomCTA from "@/components/landing/BottomCTA";
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import FeatureCard from "@/components/landing/FeatureCard";

import settings from "../../landing.config";

export default function FeaturesPage() {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col">
      <CustomPageMeta title={t("SEO.features.title")} description={t("SEO.features.description")} />
      <div className="flex flex-col items-center justify-center py-10 pb-2">
        <div className="flex flex-col items-center justify-center gap-2 py-10">
          <CustomMotionDiv className="max-w-5xl p-10 pb-0 text-center text-5xl font-bold">
            {t("Features.hero.title")}
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.1} className="text-md p-0 px-2 text-center">
            {t("Features.hero.subtitle")}
          </CustomMotionDiv>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 py-20 md:p-12">
        <div className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settings.features?.map((f: any, i: any) => (
            <FeatureCard
              soon={f.soon}
              soonText={t("General.soon")}
              index={i}
              key={i}
              icon={f.icon}
              title={t(`Features.${f.title}`)}
              subtitle={t(`Features.${f.description}`)}
            />
          ))}
        </div>
      </div>
      <BottomCTA
        title={t("Landing.cta.title")}
        subtitle={t("Landing.cta.subtitle")}
        primaryActionText={t("Landing.cta.action-1-text")}
        primaryActionSlug={"/dashboard"}
      />
    </div>
  );
}

FeaturesPage.messages = ["Metadata", "Pages", "General", "Features"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, FeaturesPage.messages),
    },
  };
};
