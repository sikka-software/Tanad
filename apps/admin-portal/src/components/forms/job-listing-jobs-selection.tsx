import { Briefcase, Edit, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { FieldError, UseFormReturn } from "react-hook-form";

import { FormField, FormItem } from "@/ui/form";
import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { Input } from "@/ui/inputs/input";

import FormSectionHeader from "@/forms/form-section-header";

import { useAppCurrencySymbol } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

import { JobListingFormValues } from "@/job-listing/job-listing.form";

import { Job } from "@/job/job.type";

import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

interface JobListingJobsSelectionProps {
  editMode?: boolean;
  setIsJobDialogOpen: (isOpen: boolean) => void;
  form: UseFormReturn<JobListingFormValues>;
  jobs: Job[] | undefined;
  selectedJobs: string[];
  handleJobSelect: (jobId: string) => void;
  formCurrency: any;
  loadingJobs?: boolean;
  onEditJob: (job: Job) => void;
}

const JobListingJobsSelection = ({
  editMode,
  setIsJobDialogOpen,
  form,
  jobs,
  selectedJobs,
  handleJobSelect,
  formCurrency,
  onEditJob,
  loadingJobs,
}: JobListingJobsSelectionProps) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const currency = useAppCurrencySymbol().symbol;

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!searchTerm.trim()) return jobs;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
        job.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
        job.location?.toLowerCase().includes(lowerCaseSearchTerm) ||
        job.department?.toLowerCase().includes(lowerCaseSearchTerm),
    );
  }, [jobs, searchTerm]);

  return (
    <div>
      <FormSectionHeader
        inDialog={editMode}
        title={t("JobListings.jobs_section.title")}
        subtitle={t("JobListings.jobs_section.subtitle")}
        onCreateText={t("Pages.Jobs.add")}
        onCreate={() => setIsJobDialogOpen(true)}
        isError={form.formState.errors.jobs as FieldError}
        onErrorText={t("JobListings.form.jobs.required")}
      />
      <div
        className={cn(
          "bg-background sticky z-10 mx-auto border-b",
          editMode ? "top-[81px]" : "top-[129px]",
        )}
      >
        <div className="form-container py-2">
          <div className="relative">
            <Input
              placeholder={t("Pages.Jobs.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-8"
            />
            <Search className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />
          </div>
        </div>
      </div>
      <div className="form-container bg--300 @container/jobs-section max-w-full">
        <FormField
          control={form.control}
          name="jobs"
          render={() => (
            <FormItem>
              <div className="grid gap-4 md:grid-cols-1 @min-[500px]/jobs-section:grid-cols-3 @min-[800px]/jobs-section:grid-cols-4">
                {loadingJobs
                  ? Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className="h-42 w-full" />
                    ))
                  : filteredJobs.length > 0 &&
                    filteredJobs.map((job: Job) => (
                      <div
                        key={job.id}
                        className={`group relative cursor-pointer overflow-hidden rounded-lg border p-4 transition-all ${
                          selectedJobs.includes(job.id)
                            ? "border-primary bg-primary/5"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => handleJobSelect(job.id)}
                      >
                        <div className="mb-2 flex flex-row justify-between">
                          <span className="text-sm text-gray-500">
                            {job.occupied_positions}/{job.total_positions}
                          </span>
                          {selectedJobs.includes(job.id) && (
                            <div className="bg-primary size-3 rounded-full" />
                          )}
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-sm text-gray-500">
                              {t(`Jobs.form.type.${job.type}`)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {job.department && (
                            <p className="text-sm text-gray-600">{job.department}</p>
                          )}
                          {job.location && <p className="text-sm text-gray-600">{job.location}</p>}
                          {job.salary && (
                            <div className="flex flex-row items-center gap-1 text-sm text-gray-600">
                              <span>{MoneyFormatter(Number(job.salary), false)}</span>
                              <span>{formCurrency || currency}</span>
                            </div>
                          )}
                        </div>

                        <div className="absolute end-1 bottom-1 -translate-x-10 translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon_sm"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditJob(job);
                            }}
                          >
                            <Edit />
                          </Button>
                        </div>
                      </div>
                    ))}
                {!loadingJobs && filteredJobs.length === 0 && (
                  <div className="col-span-full">
                    <EmptyState
                      title={t("Jobs.create_first.title")}
                      description={t("Jobs.create_first.description")}
                      icons={[Briefcase, Plus, Briefcase]}
                      action={{
                        label: t("Pages.Jobs.add"),
                        onClick: () => setIsJobDialogOpen(true),
                      }}
                    />
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default JobListingJobsSelection;
