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

import { JobForm } from "@/job/job.form";
import { jobKeys } from "@/job/job.hooks";
import { createJob } from "@/job/job.service";
import useJobStore from "@/job/job.store";

export default function AddJobPage() {
  const t = useTranslations();
  const router = useRouter();

  const isLoading = useJobStore((state) => state.isLoading);
  const setIsLoading = useJobStore((state) => state.setIsLoading);

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
        loading={isLoading}
        onCancel={() => router.push("/jobs")}
        texts={{
          title: t("Jobs.add_new"),
          submit_form: t("Jobs.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <div className="mx-auto max-w-2xl p-4">
        <JobForm
          id="job-form"
          onSuccess={() => {
            setIsLoading(false);
            router.push("/jobs");
            toast.success(t("General.successful_operation"), {
              description: t("Jobs.success.create"),
            });
          }}
        />
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
