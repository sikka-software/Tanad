import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { VendorForm, type VendorFormValues } from "@/modules/vendor/vendor.form";
import { vendorKeys } from "@/modules/vendor/vendor.hooks";
import { createVendor } from "@/modules/vendor/vendor.service";
import { Vendor, VendorCreateData } from "@/modules/vendor/vendor.type";
import useUserStore from "@/stores/use-user-store";

export default function AddVendorPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: VendorFormValues) => {
    setLoading(true);
    try {
      const vendorData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company?.trim() || "",
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        notes: data.notes?.trim() || null,
        user_id: user?.id,
      };

      let result: Vendor;

      result = await createVendor(vendorData as VendorCreateData);

      toast.success(t("General.successful_operation"), {
        description: t("Vendors.messages.success_created"),
      });

      const previousVendors = queryClient.getQueryData(vendorKeys.lists()) || [];
      queryClient.setQueryData(vendorKeys.lists(), [
        ...(Array.isArray(previousVendors) ? previousVendors : []),
        result,
      ]);

      router.push("/vendors");
    } catch (error) {
      console.error("Failed to save vendor:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Vendors.messages.error_save"),
      });
      setLoading(false);
    }
  };

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
        loading={loading}
        onCancel={() => router.push("/vendors")}
        texts={{
          title: t("Vendors.add_new"),
          submit_form: t("Vendors.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <VendorForm
          formId="vendor-form"
          user_id={user?.id}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
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
