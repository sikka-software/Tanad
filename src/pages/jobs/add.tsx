import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { JobForm, type JobFormValues } from "@/components/forms/job-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { createJob } from "@/services/jobService";
import { toast } from "sonner";

export default function AddJobPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: JobFormValues) => {
    setLoading(true);
    try {
      // Use the jobService function that handles the user ID properly
      await createJob({
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        requirements: data.requirements?.trim() || undefined,
        location: data.location?.trim() || undefined,
        department: data.department?.trim() || undefined,
        type: data.type.trim(),
        salary: data.salary ? parseFloat(data.salary) : undefined,
        isActive: data.isActive,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      });

      toast.success(t("messages.job_created"));
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
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/jobs")}>
              {t("cancel")}
            </Button>
            <Button type="submit" form="job-form" disabled={loading}>
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
