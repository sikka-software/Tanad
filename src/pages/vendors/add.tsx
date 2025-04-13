import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { VendorForm, VendorFormValues } from "@/components/forms/vendor-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import { useCreateVendor } from "@/hooks/useVendors";
import type { VendorCreateData } from "@/types/vendor.type";

// Schema factory for vendor form validation with translations
const createVendorSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Vendors.form.name.required")),
    email: z.string().email(t("Vendors.form.email.invalid")),
    phone: z.string().min(1, t("Vendors.form.phone.required")),
    company: z.string().optional(),
    address: z.string().min(1, t("Vendors.form.address.required")),
    city: z.string().min(1, t("Vendors.form.city.required")),
    state: z.string().min(1, t("Vendors.form.state.required")),
    zipCode: z.string().min(5, t("Vendors.form.zip_code.required")),
    notes: z.string().nullable(),
  });

export default function AddVendorPage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const createVendorMutation = useCreateVendor();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(createVendorSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

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
        company: data.company?.trim() || '',
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

  return (
    <div>
      <PageTitle
        title={t("Vendors.add_new")}
        customButton={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/vendors")}>
              {t("General.cancel")}
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              form="vendor-form" 
              disabled={createVendorMutation.isPending}
            >
              {createVendorMutation.isPending ? t("General.saving") : t("Vendors.add_new")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Vendors.vendor_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <VendorForm
              formId="vendor-form"
              userId={userId}
              loading={createVendorMutation.isPending}
              form={form}
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
