import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JobForm, type JobFormValues } from "@/components/forms/job-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { createJob } from "@/services/jobService";

export default function AddJobPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: JobFormValues) => {
    setLoading(true);
    try {
      // Use the jobService function that handles the user ID properly
      const newJob = await createJob({
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        requirements: data.requirements?.trim() || undefined,
        location: data.location?.trim() || undefined,
        department: data.department?.trim() || undefined,
        type: data.type.trim(),
        salary: data.salary ? parseFloat(data.salary) : undefined,
        isActive: data.isActive,
        startDate: data.startDate?.toISOString() || undefined,
        endDate: data.endDate?.toISOString() || undefined,
      });

      // Update the jobs cache to include the new job
      const previousJobs = queryClient.getQueryData(["jobs"]) || [];
      queryClient.setQueryData(
        ["jobs"],
        [...(Array.isArray(previousJobs) ? previousJobs : []), newJob],
      );

      toast.success(t("messages.job_created"));
      // Now we can navigate without the refresh parameter
      router.push("/jobs");
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast.error(error.message || t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("add_job")}
        createButtonLink="/jobs"
        createButtonText={t("back_to_list")}
        customButton={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/jobs")}>
              {t("cancel")}
            </Button>
            <Button type="submit" size="sm" form="job-form" disabled={loading}>
              {loading ? t("messages.creating_job") : t("messages.create_job")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("job_details")}</CardTitle>
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
