import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { VendorForm } from "@/vendor/vendor.form";
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

AddVendorPage.messages = ["Notes", "Pages", "Vendors", "Forms", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddVendorPage.messages,
      ),
    },
  };
};
