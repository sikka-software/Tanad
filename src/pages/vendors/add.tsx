import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { toast } from "sonner";

import { VendorForm, type VendorFormValues } from "@/components/forms/vendor-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useCreateVendor } from "@/hooks/useVendors";
import { generateDummyData } from "@/lib/dummy-generator";
import { supabase } from "@/lib/supabase";

export default function AddVendorPage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const createVendorMutation = useCreateVendor();

  // Fetch user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        console.error("User not authenticated:", error);
        router.push("/auth/login");
      }
      setLoadingUser(false);
    };

    getUserId();
  }, [router]);

  const onSubmit = async (data: VendorFormValues) => {
    if (!userId) {
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
        userId: userId,
      };

      await createVendorMutation.mutateAsync(vendorData);
      toast.success(t("success.title"), {
        description: t("Vendors.messages.success_created"),
      });
      router.push("/vendors");
    } catch (error) {
      console.error("Failed to save vendor:", error);
      toast.error(t("error.title"), {
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
              userId={userId}
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
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
