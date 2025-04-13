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
  const t = useTranslations("Salaries");
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
        title={t("edit_salary")} // Salaries.edit_salary
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/salaries")}>
              {t("General.cancel")}
            </Button>
            {/* SalaryForm has its own update button */}
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("salary_details")}</CardTitle> {/* Salaries.salary_details */}
          </CardHeader>
          <CardContent>
            {loadingUser ? (
              <p>{t("common.loading")}</p>
            ) : userId && typeof salaryId === "string" ? (
              <SalaryForm
                salaryId={salaryId} // Pass salaryId for edit mode
                onSuccess={handleSuccess}
              />
            ) : (
              <p>
                {typeof salaryId !== "string"
                  ? t("error.invalid_salary_id") /* Salaries.error.invalid_salary_id */
                  : t("error.failed_to_load_user")}{" "}
                /* Salaries.error.failed_to_load_user */
              </p>
            )}
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
