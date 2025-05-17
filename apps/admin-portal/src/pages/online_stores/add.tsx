import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyOnlineStore } from "@/lib/dummy-factory";

import { OnlineStoreForm } from "@/online-store/online-store.form";
import useOnlineStoreStore from "@/online-store/online-store.store";

export default function AddOnlineStorePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useOnlineStoreStore((state) => state.setIsLoading);
  const isLoading = useOnlineStoreStore((state) => state.isLoading);

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
        dummyButton={generateDummyOnlineStore}
      />

      <OnlineStoreForm
        formHtmlId="online-store-form"
        onSuccess={() => {
          router.push("/online_stores").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddOnlineStorePage.messages = ["Metadata", "Notes", "Pages", "OnlineStores", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddOnlineStorePage.messages,
      ),
    },
  };
};
