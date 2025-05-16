import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyDepartment } from "@/lib/dummy-factory";

import DepartmentForm from "@/department/department.form";
import useDepartmentStore from "@/department/department.store";

export default function AddDepartmentPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useDepartmentStore((state) => state.setIsLoading);
  const isLoading = useDepartmentStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Departments.add")} />
      <PageTitle
        formButtons
        formId="department-form"
        loading={isLoading}
        onCancel={() => router.push("/departments")}
        dummyButton={generateDummyDepartment}
        texts={{
          title: t("Pages.Departments.add"),
          submit_form: t("Pages.Departments.add"),
          cancel: t("General.cancel"),
        }}
      />

      <DepartmentForm
        formHtmlId="department-form"
        onSuccess={() => {
          router.push("/departments").then(() => {
            setIsLoading(false);
          });
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
