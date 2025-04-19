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

import { CompanyForm, type CompanyFormValues } from "@/modules/company/company.form";
import { companyKeys } from "@/modules/company/company.hooks";
import { createCompany } from "@/modules/company/company.service";
import { Company, CompanyCreateData } from "@/modules/company/company.type";
import useUserStore from "@/stores/use-user-store";

export default function AddCompanyPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: CompanyFormValues) => {
    setLoading(true);
    try {
      const companyData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        website: data.website?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,
        zip_code: data.zip_code?.trim() || null,
        industry: data.industry?.trim() || null,
        size: data.size?.trim() || null,
        notes: data.notes?.trim() || null,
        is_active: data.is_active,
      };

      let result: Company;

      const companyCreateData = {
        ...companyData,
        user_id: user?.id,
      };
      result = await createCompany(companyCreateData as CompanyCreateData);

      toast.success(t("General.successful_operation"), {
        description: t("Companies.success.created"),
      });

      const previousCompanies = queryClient.getQueryData(companyKeys.lists()) || [];
      queryClient.setQueryData(companyKeys.lists(), [
        ...(Array.isArray(previousCompanies) ? previousCompanies : []),
        result,
      ]);

      router.push("/companies");
    } catch (error) {
      console.error("Failed to save company:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Companies.error.creating"),
      });
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).companyForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Companies.add_new")} />
      <PageTitle
        title={t("Companies.add_new")}
        formButtons
        formId="company-form"
        loading={loading}
        onCancel={() => router.push("/companies")}
        texts={{
          submit_form: t("Companies.add_new"),
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
        <CompanyForm id="company-form" onSubmit={handleSubmit} loading={loading} />
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
