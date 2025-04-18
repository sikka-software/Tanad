import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { CompanyForm, type CompanyFormValues } from "@/components/app/company/company.form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import useUserStore from "@/stores/use-user-store";
import { generateDummyData } from "@/lib/dummy-generator";

export default function AddCompanyPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: CompanyFormValues) => {
    if (!user?.id) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/companies/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          zipCode: data.zipCode?.trim() || null,
          industry: data.industry?.trim() || null,
          size: data.size?.trim() || null,
          notes: data.notes?.trim() || null,
          is_active: data.is_active,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Companies.messages.error"));
      }

      // Get the new company data
      const newCompany = await response.json();

      // Update the companies cache to include the new company
      const previousCompanies = queryClient.getQueryData(["companies", user.id]) || [];
      queryClient.setQueryData(
        ["companies", user.id],
        [...(Array.isArray(previousCompanies) ? previousCompanies : []), newCompany],
      );

      router.push("/companies");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    // Access form through window since it's exposed by the form component
    const form = (window as any).companyForm;
    if (form) {
      form.setValue("name", dummyData.name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
    }
  };

  return (
    <div>
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
      />

      <div className="p-4">
        <Card>
          <CardHeader className="relative">
            {process.env.NODE_ENV === "development" && (
              <Button variant="outline" className="absolute end-4 top-4" onClick={handleDummyData}>
                Dummy Data
              </Button>
            )}
            <CardTitle>{t("Companies.company_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyForm id="company-form" onSubmit={handleSubmit} loading={loading} />
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
