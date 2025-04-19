import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { OfficeForm, type OfficeFormValues } from "@/modules/office/office.form";
import { useCreateOffice } from "@/modules/office/office.hooks";

export default function AddOfficePage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutate: createOffice } = useCreateOffice();

  const handleSubmit = async (data: OfficeFormValues) => {
    setLoading(true);
    try {
      await createOffice({
        name: data.name.trim(),
        email: data.email?.trim(),
        phone: data.phone?.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        is_active: true,
      });

      toast.success(t("General.successful_operation"), {
        description: t("Offices.success.created"),
      });
      router.push("/offices");
      setLoading(false);
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Offices.error.creating"),
      });
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).officeForm;
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
      <CustomPageMeta title={t("Offices.add_new")} />
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
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <OfficeForm id="office-form" onSubmit={handleSubmit} loading={loading} />
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
