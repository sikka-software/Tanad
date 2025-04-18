import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import EmployeeRequestForm, {
  type EmployeeRequestFormValues,
} from "@/components/app/employee-request/employee-request.form";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";
import { supabase } from "@/lib/supabase";

import { useEmployeeRequestsStore } from "@/stores/employee-requests.store";
import useUserStore from "@/stores/use-user-store";

export default function AddEmployeeRequestPage() {
  const router = useRouter();
  const t = useTranslations();

  const { setLoadingSave, loadingSave } = useEmployeeRequestsStore();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: EmployeeRequestFormValues) => {
    console.log(data);
    try {
      setLoadingSave(true);
      // Check if user ID is available
      if (!user?.id) {
        throw new Error(t("EmployeeRequests.error.not_authenticated"));
      }

      const { data: newRequest, error } = await supabase
        .from("employee_requests")
        .insert([
          {
            employee_id: data.employee_id,
            type: data.type,
            status: data.status,
            title: data.title,
            description: data.description,
            notes: data.notes,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success(t("General.successful_operation"), {
        description: t("EmployeeRequests.success.created"),
      });

      router.push("/employee-requests");
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("EmployeeRequests.error.creating"),
      });
    }
  };
  const handleDummyData = () => {};

  return (
    <div>
      <CustomPageMeta title={t("EmployeeRequests.add_new")} />
      <PageTitle
        title={t("EmployeeRequests.add_new")}
        formButtons
        formId="employee-request-form"
        loading={loadingSave}
        onCancel={() => router.push("/employee-requests")}
        texts={{
          submit_form: t("EmployeeRequests.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="mx-auto max-w-2xl p-4">
        <EmployeeRequestForm id="employee-request-form" onSubmit={handleSubmit} />
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
