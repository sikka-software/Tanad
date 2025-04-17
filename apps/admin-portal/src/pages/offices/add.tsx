import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { OfficeForm, type OfficeFormValues } from "@/components/app/office/office.form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import { generateDummyData } from "@/lib/dummy-generator";
import { supabase } from "@/lib/supabase";

import useUserStore from "@/hooks/use-user-store";

export default function AddOfficePage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: OfficeFormValues) => {
    setLoading(true);
    try {
      // Check if user ID is available
      if (!user?.id) {
        throw new Error(t("Offices.error.not_authenticated"));
      }

      const { data: newOffice, error } = await supabase
        .from("offices")
        .insert([
          {
            name: data.name.trim(),
            email: data.email?.trim(),
            phone: data.phone?.trim(),
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zip_code: data.zip_code.trim(),
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      //     Update the clients cache to include the new client
      const previousOffices = queryClient.getQueryData(["offices"]) || [];
      queryClient.setQueryData(
        ["offices"],
        [...(Array.isArray(previousOffices) ? previousOffices : []), newOffice],
      );

      toast.success(t("General.successful_operation"), {
        description: t("Offices.success.created"),
      });

      router.push("/offices");
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Offices.error.creating"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).officeForm;
    if (form) {
      form.setValue("name", dummyData.name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zip_code", dummyData.zipCode);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Offices.add_new")}
        formButtons
        formId="office-form"
        loading={loading}
        onCancel={() => router.push("/offices")}
        texts={{
          submit_form: t("Offices.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="relative">
            {process.env.NODE_ENV === "development" && (
              <Button variant="outline" className="absolute end-4 top-4" onClick={handleDummyData}>
                Dummy Data
              </Button>
            )}
            <CardTitle>{t("Offices.office_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OfficeForm
              id="office-form"
              user_id={user?.id}
              onSubmit={handleSubmit}
              loading={loading}
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
