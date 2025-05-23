import { pick } from "lodash";
import { GetStaticProps } from "next";

export default function LegalPage() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="text-7xl font-bold">Legal</div>
    </div>
  );
}

LegalPage.messages = ["Metadata", "Pages", "General", "Legal"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, LegalPage.messages),
    },
  };
};
