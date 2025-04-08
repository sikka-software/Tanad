import { useState, useEffect } from "react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

import { SalaryForm } from "@/components/forms/salary-form"; // Import SalaryForm
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import { salaryKeys } from "@/hooks/useSalaries";

export default function AddSalaryPage() {
  const router = useRouter();
  const t = useTranslations("Salaries"); // Use Salaries namespace
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const queryClient = useQueryClient();

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

  const handleSuccess = (salary: any) => {
    // Update the salaries cache to include the new salary
    const previousSalaries = queryClient.getQueryData(salaryKeys.lists()) || [];
    queryClient.setQueryData(
      salaryKeys.lists(),
      [...(Array.isArray(previousSalaries) ? previousSalaries : []), salary]
    );
    
    // Navigate to salaries list
    router.push("/salaries");
  };

  return (
    <div>
      <PageTitle
        title={t("add_new")} // Salaries.add_new
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/salaries")}>
              {t("common.cancel")} {/* Common cancel text */}
            </Button>
            {/* Submit button is inside SalaryForm */}
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
            ) : userId ? (
              <SalaryForm userId={userId} onSuccess={handleSuccess} />
            ) : (
              <p>{t("error.failed_to_load_user")}</p> /* Salaries.error.failed_to_load_user */
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? 'en';
  return {
    props: {
      messages: (
        await import(`../../../locales/${effectiveLocale}.json`)
      ).default,
    },
  };
}; 