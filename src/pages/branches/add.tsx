import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { BranchForm } from "@/components/forms/branch-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { branchKeys } from "@/hooks/useBranches";
import { supabase } from "@/lib/supabase";

export default function AddBranchPage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        // Redirect to login if not authenticated
        console.error("User not authenticated:", error);
        router.push("/auth/login");
      }
      setLoadingUser(false);
    };

    getUserId();
  }, [router]);

  const handleSuccess = (branch: any) => {
    setLoading(false);
    // Update the branches cache to include the new branch
    const previousBranches = queryClient.getQueryData(branchKeys.lists()) || [];
    queryClient.setQueryData(branchKeys.lists(), [
      ...(Array.isArray(previousBranches) ? previousBranches : []),
      branch,
    ]);

    // Navigate to branches list
    router.push("/branches");
  };

  return (
    <div>
      <PageTitle
        title={t("Branches.add_new")}
        formButtons
        formId="branch-form"
        loading={loading}
        onCancel={() => router.push("/branches")}
        texts={{
          submit_form: t("Branches.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Branches.branch_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BranchForm
              id="branch-form"
              userId={userId}
              onSuccess={handleSuccess}
              loading={loading}
              setLoading={setLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
