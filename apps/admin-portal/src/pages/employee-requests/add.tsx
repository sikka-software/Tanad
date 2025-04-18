import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";

import PageTitle from "@/ui/page-title";

import EmployeeRequestForm, {
  type EmployeeRequestFormValues,
} from "@/components/app/employee-request/employee-request.form";

import { generateDummyData } from "@/lib/dummy-generator";
import { supabase } from "@/lib/supabase";

import useUserStore from "@/stores/use-user-store";

export default function AddEmployeeRequestPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: EmployeeRequestFormValues) => {};

  const handleDummyData = () => {};

  return (
    <div>
      <PageTitle
        title={t("EmployeeRequests.add_new")}
        formButtons
        formId="employee-request-form"
        loading={loading}
        onCancel={() => router.push("/employee-requests")}
        texts={{
          submit_form: t("EmployeeRequests.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="mx-auto max-w-2xl p-4">
        <EmployeeRequestForm id="employee-request-form" onSubmit={handleSubmit} loading={loading} />
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
