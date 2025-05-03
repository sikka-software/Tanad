import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { VendorForm, type VendorFormValues } from "@/vendor/vendor.form";
import useVendorStore from "@/vendor/vendor.store";

export default function AddVendorPage() {
  const t = useTranslations();
  const router = useRouter();

  const isLoading = useVendorStore((state) => state.isLoading);
  const setIsLoading = useVendorStore((state) => state.setIsLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).vendorForm;
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
      <CustomPageMeta title={t("Vendors.add_new")} />
      <PageTitle
        formButtons
        formId="vendor-form"
        loading={isLoading}
        onCancel={() => router.push("/vendors")}
        texts={{
          title: t("Vendors.add_new"),
          submit_form: t("Vendors.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <VendorForm
        formHtmlId="vendor-form"
        onSuccess={() => {
          router.push("/vendors").then(() => {
            setIsLoading(false);
            toast.success(t("General.successful_operation"), {
              description: t("Vendors.success.create"),
            });
          });
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
