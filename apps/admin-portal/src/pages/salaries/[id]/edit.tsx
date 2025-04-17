import { GetStaticProps, GetStaticPaths } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { SalaryForm } from "@/components/app/salary/salary.form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function EditSalaryPage() {
  const router = useRouter();
  const t = useTranslations();

  const { id: salary_id } = router.query; // Get salary_id from URL query

  // Check if salary_id is valid
  useEffect(() => {
    if (router.isReady && !salary_id) {
      console.error("Salary ID not found in URL");
      // Optionally redirect
    }
  }, [router.isReady, salary_id]);

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
            <SalaryForm salary_id={salary_id as string} onSuccess={handleSuccess} />
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
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default, // Adjust path depth
    },
  };
};
