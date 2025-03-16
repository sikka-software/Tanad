import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

export default function LegalPage() {
  const t = useTranslations("Landing");
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="text-7xl font-bold">Legal</div>
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
