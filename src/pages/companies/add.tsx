import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { CompanyForm, type CompanyFormValues } from "@/components/forms/company-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useUser } from "@/providers/UserProvider";

export default function AddCompanyPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { userId } = useUser();

  const handleSubmit = async (data: CompanyFormValues) => {
    if (!userId) {
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
          isActive: data.isActive,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Companies.messages.error"));
      }

      // Get the new company data
      const newCompany = await response.json();

      // Update the companies cache to include the new company
      const previousCompanies = queryClient.getQueryData(["companies", userId]) || [];
      queryClient.setQueryData(
        ["companies", userId],
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

  return (
    <div>
      <PageTitle
        title={t("Companies.add_new")}
        createButtonLink="/companies"
        createButtonText={t("Companies.back_to_list")}
        customButton={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/companies")}>
              {t("General.cancel")}
            </Button>
            <Button
              type="submit"
              className="min-w-24"
              size="sm"
              form="company-form"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("Companies.create_company")
              )}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
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
