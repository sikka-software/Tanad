import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

// Components
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";

export default function BlogPage() {
  const t = useTranslations("Blog");
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

BlogPage.messages = ["Pages", "General", "Blog"];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, BlogPage.messages),
    },
  };
};
