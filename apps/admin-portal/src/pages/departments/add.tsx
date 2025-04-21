import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import DepartmentForm, { type DepartmentFormValues } from "@/modules/department/department.form";
import { departmentKeys } from "@/modules/department/department.hooks";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

export default function AddDepartmentPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).departmentForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("description", dummyData.description);
      // form.setValue("locations", dummyData.locations);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Departments.add_new")} />
      <PageTitle
        formButtons
        formId="department-form"
        loading={loading}
        onCancel={() => router.push("/departments")}
        texts={{
          title: t("Departments.add_new"),
          submit_form: t("Departments.add_new"),
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
        <DepartmentForm id="department-form"  />
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
