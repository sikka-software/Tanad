import { useState, useEffect } from "react";

import { GetStaticProps, GetStaticPaths } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { SalaryForm } from "@/components/forms/salary-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function EditSalaryPage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const { id: salaryId } = router.query; // Get salaryId from URL query

  // Fetch user ID
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
