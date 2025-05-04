import { SERVER_OS } from "@root/src/lib/constants";
import { SERVER_PROVIDERS } from "@root/src/lib/constants";
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
    console.log("form is ,", form);
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("ip_address", dummyData.random_ip_address);
      form.setValue("location", dummyData.locations);
      form.setValue("provider", dummyData.randomPicker(SERVER_PROVIDERS).value);
      form.setValue("os", dummyData.randomPicker(SERVER_OS).value);
      form.setValue("status", dummyData.randomPicker(["Active", "Inactive", "Pending"]));
      form.setValue("notes", dummyData.randomString);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Servers.add_new")} />
      <PageTitle
        formButtons
        formId="server-form"
        loading={isLoading}
        onCancel={() => router.push("/servers")}
        texts={{
          title: t("Servers.add_new"),
          submit_form: t("Servers.add_new"),
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
