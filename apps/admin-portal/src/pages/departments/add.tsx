import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import DepartmentForm from "@/modules/department/department.form";
import useDepartmentStore from "@/modules/department/department.store";

export default function AddDepartmentPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useDepartmentStore((state) => state.setIsLoading);
  const isLoading = useDepartmentStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).departmentForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("description", dummyData.description);
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Departments.success.created"),
    });
    router.push("/departments");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Departments.add_new")} />
      <PageTitle
        formButtons
        formId="department-form"
        loading={isLoading}
        onCancel={() => router.push("/departments")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Departments.add_new"),
          submit_form: t("Departments.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="mx-auto max-w-2xl p-4">
        <DepartmentForm id="department-form" onSuccess={onAddSuccess} />
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
