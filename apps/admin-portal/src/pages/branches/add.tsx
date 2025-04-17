import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";

import { BranchForm } from "@/components/app/branch/branch.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import useUserStore from "@/hooks/use-user-store";
import { branchKeys } from "@/hooks/useBranches";

export default function AddBranchPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useUserStore();

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

  if (!user) {
    router.push("/auth");
  }

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
              user_id={user?.id}
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
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
