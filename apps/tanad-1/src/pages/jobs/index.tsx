import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { format } from "date-fns";
import { Building2, MapPin, Calendar, DollarSign } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { useJobs } from "@/hooks/useJobs";
import { Job } from "@/types/job.type";

export default function JobsPage() {
  const t = useTranslations("Jobs");
  const { data: jobs, isLoading, error } = useJobs();

  const renderJob = (job: Job) => (
    <Card key={job.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.type}</p>
          </div>
          <Badge variant={job.isActive ? "default" : "secondary"}>
            {job.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {job.department && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span>{job.department}</span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.startDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Starts {format(new Date(job.startDate), "MMM dd, yyyy")}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>${job.salary.toLocaleString()}</span>
            </div>
          )}
          {job.description && (
            <p className="mt-2 line-clamp-2 border-t pt-2 text-sm text-gray-500">
              {job.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataPageLayout>
      <PageTitle
        title={t("title")}
        createButtonLink="/jobs/add"
        createButtonText={t("create_job")}
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={jobs}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          errorMessage={error instanceof Error ? t(error.message) : undefined}
          emptyMessage={t("no_jobs_found")}
          renderItem={renderJob}
          gridCols="3"
        />
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
