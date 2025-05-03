import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { EmployeeRequestForm } from "@/employee-request/employee-request.form";
import useEmployeeRequestsStore from "@/employee-request/employee-request.store";

export default function AddEmployeeRequestPage() {
  const router = useRouter();
  const t = useTranslations();

  const setLoadingSave = useEmployeeRequestsStore((state) => state.setIsLoading);
  const loadingSave = useEmployeeRequestsStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("EmployeeRequests.add_new")} />
      <PageTitle
        formButtons
        formId="employee-request-form"
        loading={loadingSave}
        onCancel={() => router.push("/employee_requests")}
        texts={{
          title: t("EmployeeRequests.add_new"),
          submit_form: t("EmployeeRequests.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <EmployeeRequestForm
        formHtmlId="employee-request-form"
        onSuccess={() =>
          router.push("/employee_requests").then(() => {
            setLoadingSave(false);
          })
        }
      />
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
