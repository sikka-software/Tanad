import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import { BranchForm, type BranchFormValues } from "@/modules/branch/branch.form";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { branchKeys } from "@/modules/branch/branch.hooks";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

export default function AddBranchPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: BranchFormValues) => {
    setLoading(true);
    try {
      // Check if user ID is available
      if (!user?.id) {
        throw new Error(t("Branches.error.not_authenticated"));
      }

      const { data: newBranch, error } = await supabase
        .from("branches")
        .insert([
          {
            name: data.name.trim(),
            code: data.code.trim(),
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zip_code: data.zip_code.trim(),
            phone: data.phone?.trim() || null,
            email: data.email?.trim() || null,
            manager: data.manager?.trim() || null,
            is_active: data.is_active,
            notes: data.notes?.trim() || null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the branches cache to include the new branch
      const previousBranches = queryClient.getQueryData(branchKeys.lists()) || [];
      queryClient.setQueryData(branchKeys.lists(), [
        ...(Array.isArray(previousBranches) ? previousBranches : []),
        newBranch,
      ]);

      toast.success(t("General.successful_operation"), {
        description: t("Branches.messages.success_created"),
      });

      router.push("/branches");
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Branches.messages.error_save"),
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      <CustomPageMeta title={t("Branches.add_new")} />
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
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <BranchForm id="branch-form" onSubmit={handleSubmit} loading={loading} />
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
