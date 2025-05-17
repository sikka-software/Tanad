import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";

import CustomMotionDiv from "@/components/landing/CustomMotionDiv";

export default function SupportPage() {
  const t = useTranslations("Support");
  return (
    <div className="flex flex-col items-center justify-center py-10 pb-32">
      <div className="flex flex-col items-center justify-center gap-2 p-10">
        <CustomMotionDiv className="p-10 pb-0 text-5xl font-bold">{t("title")}</CustomMotionDiv>
        <CustomMotionDiv delay={0.1} className="text-md p-0">
          {t("subtitle")}
        </CustomMotionDiv>
      </div>
    </div>
  );
}

SupportPage.messages = ["Metadata", "Pages", "Support", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, SupportPage.messages),
    },
  };
};
