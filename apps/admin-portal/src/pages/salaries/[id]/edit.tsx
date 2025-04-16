import { useEffect } from "react";

import { GetStaticProps, GetStaticPaths } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { SalaryForm } from "@/components/forms/salary-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function EditSalaryPage() {
  const router = useRouter();
  const t = useTranslations();

  const { id: salaryId } = router.query; // Get salaryId from URL query

  // Check if salaryId is valid
  useEffect(() => {
    if (router.isReady && !salaryId) {
      console.error("Salary ID not found in URL");
      // Optionally redirect
    }
  }, [router.isReady, salaryId]);

  const handleSuccess = () => {
    // SalaryForm handles navigation
  };

  return (
    <div>
      <PageTitle
        title={t("Salaries.edit_salary")}
        customButton={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/salaries")}>
              {t("General.cancel")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Salaries.salary_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalaryForm salaryId={salaryId as string} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Use fallback: 'blocking'
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../../locales/${effectiveLocale}.json`)).default, // Adjust path depth
    },
  };
};
