import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { JobForm, type JobFormValues } from "@/components/app/job/job.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import { createJob } from "@/services/jobService";

export default function AddJobPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: JobFormValues) => {
    setLoading(true);
    try {
      // Use the jobService function that handles the user ID properly
      const newJob = await createJob({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        requirements: data.requirements?.trim() || null,
        location: data.location?.trim() || null,
        department: data.department?.trim() || null,
        type: data.type.trim(),
        salary: data.salary ? parseFloat(data.salary) : null,
        is_active: data.is_active,
        startDate: data.startDate?.toISOString() || null,
        endDate: data.endDate?.toISOString() || null,
      });

      // Update the jobs cache to include the new job
      const previousJobs = queryClient.getQueryData(["jobs"]) || [];
      queryClient.setQueryData(
        ["jobs"],
        [...(Array.isArray(previousJobs) ? previousJobs : []), newJob],
      );

      toast.success(t("General.successful_operation"), {
        description: t("Jobs.messages.job_created"),
      });
      // Now we can navigate without the refresh parameter
      router.push("/jobs");
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Jobs.messages.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Jobs.add_new")}
        formButtons
        formId="job-form"
        loading={loading}
        onCancel={() => router.push("/jobs")}
        texts={{
          submit_form: t("Jobs.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Jobs.job_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm id="job-form" onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
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
