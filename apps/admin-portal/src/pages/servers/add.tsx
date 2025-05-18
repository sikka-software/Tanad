import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyServer } from "@/lib/dummy-factory";

import { ServerForm } from "@/server/server.form";
import useServerStore from "@/server/server.store";

export default function AddServerPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useServerStore((state) => state.setIsLoading);
  const isLoading = useServerStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Servers.add")} />
      <PageTitle
        formButtons
        formId="server-form"
        loading={isLoading}
        onCancel={() => router.push("/servers")}
        texts={{
          title: t("Pages.Servers.add"),
          submit_form: t("Pages.Servers.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyServer}
      />

      <ServerForm
        formHtmlId="server-form"
        onSuccess={() => {
          router.push("/servers").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddServerPage.messages = [
  "Metadata",
  "Notes",
  "Forms",
  "Pages",
  "Servers",
  "General",
  "PaymentCycles",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddServerPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
