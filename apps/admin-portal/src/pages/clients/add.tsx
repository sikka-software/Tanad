import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ClientForm } from "@/client/client.form";
import useClientStore from "@/client/client.store";

export default function AddClientPage() {
  const router = useRouter();
  const t = useTranslations();
  const setIsLoading = useClientStore((state) => state.setIsLoading);
  const isLoading = useClientStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).clientForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zip_code", dummyData.zip_code);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Clients.add")} />
      <PageTitle
        formButtons
        formId="client-form"
        loading={isLoading}
        onCancel={() => router.push("/clients")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Pages.Clients.add"),
          submit_form: t("Pages.Clients.add"),
          cancel: t("General.cancel"),
        }}
      />

      <ClientForm
        formHtmlId="client-form"
        onSuccess={() => {
          router.push("/clients");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddClientPage.messages = ["Pages", "Clients", "Forms", "Notes", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddClientPage.messages,
      ),
    },
  };
};
