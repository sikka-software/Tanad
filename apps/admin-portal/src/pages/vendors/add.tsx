import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { VendorForm, type VendorFormValues } from "@/components/app/vendor/vendor.form";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import { generateDummyData } from "@/lib/dummy-generator";

import { useCreateVendor } from "@/hooks/useVendors";
import useUserStore from "@/stores/use-user-store";

export default function AddVendorPage() {
  const router = useRouter();
  const t = useTranslations();
  const createVendorMutation = useCreateVendor();

  const { user } = useUserStore();

  const onSubmit = async (data: VendorFormValues) => {
    if (!user?.id) {
      toast.error(t("error.title"), {
        description: t("error.not_authenticated"),
      });
      return;
    }

    try {
      const vendorData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company?.trim() || "",
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zipCode: data.zipCode.trim(),
        notes: data.notes?.trim() || null,
        user_id: user?.id,
      };

      await createVendorMutation.mutateAsync(vendorData);
      toast.success(t("General.successful_operation"), {
        description: t("Vendors.messages.success_created"),
      });
      router.push("/vendors");
    } catch (error) {
      console.error("Failed to save vendor:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Vendors.messages.error_save"),
      });
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).vendorForm;
    if (form) {
      form.setValue("name", dummyData.name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zipCode", dummyData.zipCode);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Vendors.add_new")} />
      <PageTitle
        title={t("Vendors.add_new")}
        formButtons
        formId="vendor-form"
        loading={createVendorMutation.isPending}
        onCancel={() => router.push("/vendors")}
        texts={{
          submit_form: t("Vendors.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader className="relative">
            {process.env.NODE_ENV === "development" && (
              <Button variant="outline" className="absolute end-4 top-4" onClick={handleDummyData}>
                Dummy Data
              </Button>
            )}
            <CardTitle>{t("Vendors.vendor_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <VendorForm
              formId="vendor-form"
              user_id={user?.id}
              loading={createVendorMutation.isPending}
              onSubmit={onSubmit}
            />
          </CardContent>
        </Card>
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
