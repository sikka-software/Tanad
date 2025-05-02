import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

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

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Clients.success.created"),
    });
    router.push("/clients");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Clients.add_new")} />
      <PageTitle
        formButtons
        formId="client-form"
        loading={isLoading}
        onCancel={() => router.push("/clients")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Clients.add_new"),
          submit_form: t("Clients.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <ClientForm id="client-form" loading={isLoading} onSuccess={onAddSuccess} />
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
