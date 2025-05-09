import { SERVER_OS } from "@root/src/lib/constants";
import { SERVER_PROVIDERS } from "@root/src/lib/constants";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ServerForm } from "@/modules/server/server.form";
import useServerStore from "@/modules/server/server.store";

export default function AddServerPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useServerStore((state) => state.setIsLoading);
  const isLoading = useServerStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).serverForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("ip_address", dummyData.random_ip_address);
      form.setValue("location", dummyData.locations);
      form.setValue("provider", dummyData.randomPicker(SERVER_PROVIDERS).value);
      form.setValue("os", dummyData.randomPicker(SERVER_OS).value);
      form.setValue("notes", dummyData.randomString);
    }
  };

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
        dummyButton={handleDummyData}
      />

      <ServerForm
        formHtmlId="server-form"
        onSuccess={() => {
          router.push("/servers");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddServerPage.messages = ["Notes", "Pages", "Servers", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddServerPage.messages,
      ),
    },
  };
};
