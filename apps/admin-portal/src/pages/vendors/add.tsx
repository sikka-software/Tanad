import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyVendor } from "@/lib/dummy-factory";

import { VendorForm } from "@/vendor/vendor.form";
import useVendorStore from "@/vendor/vendor.store";

export default function AddVendorPage() {
  const t = useTranslations();
  const router = useRouter();

  const isLoading = useVendorStore((state) => state.isLoading);
  const setIsLoading = useVendorStore((state) => state.setIsLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Vendors.add")} />
      <PageTitle
        formButtons
        formId="vendor-form"
        loading={isLoading}
        onCancel={() => router.push("/vendors")}
        texts={{
          title: t("Pages.Vendors.add"),
          submit_form: t("Pages.Vendors.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyVendor}
      />

      <VendorForm
        formHtmlId="vendor-form"
        onSuccess={() => {
          router.push("/vendors").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddVendorPage.messages = ["Metadata","Notes", "Pages", "Vendors", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddVendorPage.messages,
      ),
    },
  };
};
