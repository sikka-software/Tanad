import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import SocialIcons from "@/components/landing/SocialIcons";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

// Constants
import settings from "../../landing.config";

export default function HelpPage() {
  const t = useTranslations();
  return (
    <>
      <CustomPageMeta title={t("SEO.help.title")} description={t("SEO.help.description")} />
      <div className="flex flex-col items-center justify-center py-10 pb-32">
        <div className="flex flex-col items-center justify-center gap-2 p-10">
          <CustomMotionDiv className="p-10 pb-0 text-center text-5xl font-bold">
            {t("Help.hero.title")}
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.1} className="text-md p-0 text-center">
            {t("Help.hero.subtitle")}
          </CustomMotionDiv>
        </div>
        <CustomMotionDiv delay={0.2} className="text-md p-2 text-center md:p-0">
          {t("Help.hero.in-the-meantime")}
        </CustomMotionDiv>
        <CustomMotionDiv delay={0.3} className="text-md mt-4 flex flex-row p-0">
          <SocialIcons {...settings.contact} phone={""} />
        </CustomMotionDiv>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <CustomMotionDiv delay={0.4} className="text-md mt-4 flex w-full flex-row p-0">
            <Link href={"/contact"} className="w-full">
              <Card className="h-full w-full">
                <CardContent headless className="space-y-2">
                  <CardTitle>{t("Help.contact.title")}</CardTitle>
                  <CardDescription>{t("Help.contact.subtitle")}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.4} className="text-md mt-4 flex w-full flex-row p-0">
            <Link href={"/report"} className="w-full">
              <Card className="h-full w-full">
                <CardContent headless className="space-y-2">
                  <CardTitle>{t("ReportPage.page-title")}</CardTitle>
                  <CardDescription>{t("ReportPage.page-subtitle")}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.4} className="text-md mt-4 flex w-full flex-row p-0">
            <Link href={"/report-ip"} className="w-full">
              <Card className="h-full w-full">
                <CardContent headless className="space-y-2">
                  <CardTitle>{t("ReportPage.report-ip.title")}</CardTitle>
                  <CardDescription>{t("ReportPage.report-ip.subtitle")}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.5} className="text-md mt-4 flex w-full flex-row p-0">
            <Link href={"/appeal"} className="w-full">
              <Card className="h-full w-full">
                <CardContent headless className="space-y-2">
                  <CardTitle>{t("AppealPage.page-title")}</CardTitle>
                  <CardDescription>{t("AppealPage.page-subtitle")}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </CustomMotionDiv>
        </div>
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
