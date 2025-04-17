import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import JobCard from "@/components/app/job/job.card";
import JobsTable from "@/components/app/job/job.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { useJobs } from "@/hooks/useJobs";

export default function JobsPage() {
  const t = useTranslations("Jobs");
  const { data: jobs, isLoading, error } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredJobs = jobs?.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.location?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/jobs/add"
        createLabel={t("create_job")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_jobs")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div>
        {viewMode === "table" ? (
          <JobsTable
            data={filteredJobs || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredJobs || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("no_jobs_found")}
              renderItem={(job) => <JobCard job={job} />}
              gridCols="3"
            />
          </div>
        )}
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
