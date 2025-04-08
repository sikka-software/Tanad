import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { JobForm, type JobFormValues } from "@/components/forms/job-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

export default function AddJobPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: JobFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description?.trim() || null,
          requirements: data.requirements?.trim() || null,
          location: data.location?.trim() || null,
          department: data.department?.trim() || null,
          type: data.type.trim(),
          salary: data.salary ? parseFloat(data.salary) : null,
          isActive: data.isActive,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("messages.error"));
      }

      router.push("/jobs");
    } catch (error) {
      console.error(error);
      throw error;
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
