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

import { JobForm, type JobFormValues } from "@/modules/job/job.form";
import { jobKeys } from "@/modules/job/job.hooks";
import { createJob } from "@/modules/job/job.service";

export default function AddJobPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).jobForm;
    if (form) {
      form.setValue("title", dummyData.job_title);
      form.setValue("description", dummyData.job_description);
      form.setValue("requirements", dummyData.requirements);
      form.setValue("location", dummyData.job_location);
      form.setValue("department", dummyData.job_department);
      form.setValue("type", dummyData.job_type);
      form.setValue("salary", dummyData.job_salary);
      form.setValue("is_active", dummyData.job_is_active);
      form.setValue("start_date", dummyData.job_start_date);
      form.setValue("end_date", dummyData.job_end_date);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Jobs.add_new")} />
      <PageTitle
        formButtons
        formId="job-form"
        loading={loading}
        onCancel={() => router.push("/jobs")}
        texts={{
          title: t("Jobs.add_new"),
          submit_form: t("Jobs.add_new"),
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
        <JobForm id="job-form" />
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
