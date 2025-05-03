import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import { createClient } from "@/utils/supabase/component";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { BranchForm } from "@/branch/branch.form";
import { branchKeys } from "@/branch/branch.hooks";
import useBranchStore from "@/branch/branch.store";

import useUserStore from "@/stores/use-user-store";

export default function AddBranchPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const setIsLoading = useBranchStore((state) => state.setIsLoading);
  const isLoading = useBranchStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).branchForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("code", "BR-" + Math.random().toString(36).substr(2, 6));
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zip_code", dummyData.zip_code);
      form.setValue("manager", dummyData.full_name);
      form.setValue("is_active", true);
      form.setValue("notes", "Test branch notes");
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Branches.success.create"),
    });
    router.push("/branches");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Branches.add_new")} />
      <PageTitle
        formButtons
        formId="branch-form"
        loading={isLoading}
        onCancel={() => router.push("/branches")}
        texts={{
          title: t("Branches.add_new"),
          submit_form: t("Branches.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <BranchForm id="branch-form" onSuccess={onAddSuccess} />
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
