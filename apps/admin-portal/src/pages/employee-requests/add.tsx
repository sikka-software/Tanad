import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import EmployeeRequestForm, {
  type EmployeeRequestFormValues,
} from "@/modules/employee-request/employee-request.form";
import { createEmployeeRequest } from "@/modules/employee-request/employee-request.service";
import { useEmployeeRequestsStore } from "@/modules/employee-request/employee-request.store";
import { employeeKeys } from "@/modules/employee/employee.hooks";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

export default function AddEmployeeRequestPage() {
  const supabase = createClient();
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

      // const { data: newRequest, error } = await supabase
      //   .from("employee_requests")
      //   .insert([
      //     {
      //       employee_id: data.employee_id,
      //       type: data.type,
      //       status: data.status,
      //       title: data.title,
      //       description: data.description,
      //       notes: data.notes,
      //       user_id: user?.id,
      //     },
      //   ])
      //   .select()
      //   .single();

      // if (error) throw error;
      const newRequest = await createEmployeeRequest({
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        type: data.type as "leave" | "expense" | "document" | "other",
        startDate: data.startDate?.toISOString() || undefined,
        endDate: data.endDate?.toISOString() || undefined,
        amount: data.amount || undefined,
        employee_id: data.employee_id,
        status: data.status || "pending",
      });

      toast.success(t("General.successful_operation"), {
        description: t("EmployeeRequests.success.created"),
      });

      const previousRequests = queryClient.getQueryData(employeeKeys.lists()) || [];
      queryClient.setQueryData(employeeKeys.lists(), [
        ...(Array.isArray(previousRequests) ? previousRequests : []),
        newRequest,
      ]);

      router.push("/employee-requests");
      setLoadingSave(false);
    } catch (error) {
      setLoadingSave(false);
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
