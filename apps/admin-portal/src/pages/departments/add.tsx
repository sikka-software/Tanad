import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import DepartmentForm from "@/department/department.form";
import useDepartmentStore from "@/department/department.store";

export default function AddDepartmentPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useDepartmentStore((state) => state.setIsLoading);
  const isLoading = useDepartmentStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).departmentForm;
    if (form) {
      form.setValue("name", dummyData.job_department);
      form.setValue("description", dummyData.description);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Departments.add")} />
      <PageTitle
        formButtons
        formId="department-form"
        loading={isLoading}
        onCancel={() => router.push("/departments")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Pages.Departments.add"),
          submit_form: t("Pages.Departments.add"),
          cancel: t("General.cancel"),
        }}
      />

      <DepartmentForm
        formHtmlId="department-form"
        onSuccess={() => {
          router.push("/departments");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddDepartmentPage.messages = ["Notes", "Pages", "Departments", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddDepartmentPage.messages,
      ),
    },
  };
};
