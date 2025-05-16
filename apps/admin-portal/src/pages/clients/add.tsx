import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyClient } from "@/lib/dummy-factory";

import { ClientForm } from "@/client/client.form";
import useClientStore from "@/client/client.store";

export default function AddClientPage() {
  const router = useRouter();
  const t = useTranslations();
  const setIsLoading = useClientStore((state) => state.setIsLoading);
  const isLoading = useClientStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Clients.add")} />
      <PageTitle
        formButtons
        formId="client-form"
        loading={isLoading}
        onCancel={() => router.push("/clients")}
        dummyButton={generateDummyClient}
        texts={{
          title: t("Pages.Clients.add"),
          submit_form: t("Pages.Clients.add"),
          cancel: t("General.cancel"),
        }}
      />

      <ClientForm
        formHtmlId="client-form"
        onSuccess={() => {
          router.push("/clients").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddClientPage.messages = ["Pages", "Clients", "Companies", "Forms", "Notes", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddClientPage.messages,
      ),
    },
  };
};
