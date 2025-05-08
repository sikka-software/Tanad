import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { WebsiteForm } from "@/modules/website/website.form";
import useWebsiteStore from "@/modules/website/website.store";

export default function AddWebsitePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useWebsiteStore((state: any) => state.setIsLoading);
  const isLoading = useWebsiteStore((state: any) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).websiteForm;
    if (form) {
      const randomSuffix = Math.random().toString(36).substr(2, 6);
      form.setValue("domain_name", `example-${randomSuffix}.com`);
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      form.setValue(
        "notes",
        "This is a test website generated on " + new Date().toLocaleDateString(),
      );
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Websites.add_new")} />
      <PageTitle
        formButtons
        formId="website-form"
        loading={isLoading}
        onCancel={() => router.push("/websites")}
        texts={{
          title: t("Websites.add_new"),
          submit_form: t("Websites.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <WebsiteForm
        formHtmlId="website-form"
        onSuccess={() => {
          router.push("/websites");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddWebsitePage.messages = ["Pages", "Websites", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddWebsitePage.messages,
      ),
    },
  };
};
