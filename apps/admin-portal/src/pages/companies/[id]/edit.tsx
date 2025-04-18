import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";

import { CompanyForm, type CompanyFormValues } from "@/components/app/company/company.form";

import { useCompany, useUpdateCompany } from "@/hooks/models/useCompanies";

export default function EditCompanyPage() {
  const t = useTranslations();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const { data: company, isLoading: isLoadingCompany } = useCompany(id as string);
  const { mutateAsync: updateCompany } = useUpdateCompany();

  const handleSubmit = async (data: CompanyFormValues) => {
    if (!id) return;

    setLoading(true);
    try {
      await updateCompany({
        id: id as string,
        data: {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || undefined,
          website: data.website?.trim() || undefined,
          address: data.address?.trim() || undefined,
          city: data.city?.trim() || undefined,
          state: data.state?.trim() || undefined,
          zip_code: data.zip_code?.trim() || undefined,
          industry: data.industry?.trim() || undefined,
          size: data.size?.trim() || undefined,
          notes: data.notes?.trim() || undefined,
          is_active: data.is_active,
        },
      });

      router.push("/companies");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <div className="p-4">
        <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-[400px] animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {t("Companies.company_not_found")}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t("Companies.edit_company")}
        formButtons
        formId="company-form"
        loading={loading}
        onCancel={() => router.push("/companies")}
        texts={{
          submit_form: t("General.save"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Companies.company_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyForm
              id="company-form"
              onSubmit={handleSubmit}
              loading={loading}
              defaultValues={{
                name: company.name,
                email: company.email,
                phone: company.phone || "",
                website: company.website || "",
                address: company.address || "",
                city: company.city || "",
                state: company.state || "",
                zip_code: company.zip_code || "",
                industry: company.industry || "",
                size: company.size || "",
                notes: company.notes || "",
                is_active: company.is_active,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
