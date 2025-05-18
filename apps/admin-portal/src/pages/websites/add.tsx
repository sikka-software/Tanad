import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyWebsite } from "@/lib/dummy-factory";

import { WebsiteForm } from "@/website/website.form";
import useWebsiteStore from "@/website/website.store";

export default function AddWebsitePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useWebsiteStore((state: any) => state.setIsLoading);
  const isLoading = useWebsiteStore((state: any) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Websites.add")} />
      <PageTitle
        formButtons
        formId="website-form"
        loading={isLoading}
        onCancel={() => router.push("/websites")}
        texts={{
          title: t("Pages.Websites.add"),
          submit_form: t("Pages.Websites.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyWebsite}
      />

      <WebsiteForm
        formHtmlId="website-form"
        onSuccess={() => {
          router.push("/websites").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddWebsitePage.messages = ["Metadata", "Notes", "Pages", "Websites", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddWebsitePage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
