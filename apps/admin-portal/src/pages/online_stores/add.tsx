import { E_COMMERCE_PLATFORMS } from "@root/src/lib/constants";
import { pick } from "lodash";
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
      let dd = dummyData.randomPicker(E_COMMERCE_PLATFORMS);
      form.setValue("domain_name", dummyData.first_name.toLowerCase() + ".com");
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      form.setValue("platform", dd.value);
      form.setValue("notes", dummyData.state);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.OnlineStores.add")} />
      <PageTitle
        formButtons
        formId="online-store-form"
        loading={isLoading}
        onCancel={() => router.push("/online_stores")}
        texts={{
          title: t("Pages.OnlineStores.add"),
          submit_form: t("Pages.OnlineStores.add"),
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

AddOnlineStorePage.messages = ["Notes", "Pages", "OnlineStores", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddOnlineStorePage.messages,
      ),
    },
  };
};
