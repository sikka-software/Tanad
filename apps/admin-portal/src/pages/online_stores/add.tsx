import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { OnlineStoreForm } from "@/modules/online-store/online-store.form";
import useOnlineStoreStore from "@/modules/online-store/online-store.store";

export default function AddOnlineStorePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useOnlineStoreStore((state) => state.setIsLoading);
  const isLoading = useOnlineStoreStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).onlineStoreForm;
    if (form) {
      form.setValue("domain_name", dummyData.first_name.toLowerCase() + ".com");
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      form.setValue("notes", dummyData.state);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("OnlineStores.add_new")} />
      <PageTitle
        formButtons
        formId="online-store-form"
        loading={isLoading}
        onCancel={() => router.push("/online_stores")}
        texts={{
          title: t("OnlineStores.add_new"),
          submit_form: t("OnlineStores.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <OnlineStoreForm
        formHtmlId="online-store-form"
        onSuccess={() => {
          router.push("/online_stores");
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
