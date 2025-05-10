import { getCurrencySymbol } from "@root/src/lib/currency-utils";
import { cn } from "@root/src/lib/utils";
import useUserStore from "@root/src/stores/use-user-store";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { FieldError, UseFormReturn } from "react-hook-form";

import FormSectionHeader from "@/components/forms/form-section-header";
import { FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { JobListingFormValues } from "@/modules/job-listing/job-listing.form";
import { Job } from "@/modules/job/job.type";

import { MoneyFormatter } from "../ui/currency-input";

interface JobListingJobsSelectionProps {
  editMode?: boolean;
  t: (key: string) => string;
  setIsJobDialogOpen: (isOpen: boolean) => void;
  form: UseFormReturn<JobListingFormValues>;
  jobs: Job[] | undefined;
  selectedJobs: string[];
  handleJobSelect: (jobId: string) => void;
}

const JobListingJobsSelection = ({
  editMode,
  t,
  setIsJobDialogOpen,
  form,
  jobs,
  selectedJobs,
  handleJobSelect,
}: JobListingJobsSelectionProps) => {
  const currency = useUserStore((state) => state.profile?.user_settings.currency);
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className={cn("bg-background sticky top-[129px] z-10 mx-auto border-b")}>
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
      <div className="form-container">
        <FormField
          control={form.control}
          name="jobs"
          render={() => (
            <FormItem>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job: Job) => (
                    <div
                      key={job.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        selectedJobs.includes(job.id)
                          ? "border-primary bg-primary/5"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleJobSelect(job.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{job.title}</h4>
                          <p className="text-sm text-gray-500">{job.type}</p>
                        </div>
                        {selectedJobs.includes(job.id) && (
                          <div className="bg-primary h-4 w-4 rounded-full" />
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        {job.department && (
                          <p className="text-sm text-gray-600">{job.department}</p>
                        )}
                        {job.location && <p className="text-sm text-gray-600">{job.location}</p>}
                        {job.salary && (
                          <div className="flex flex-row items-center gap-1 text-sm text-gray-600">
                            <span>{MoneyFormatter(job.salary, false)}</span>
                            <span>{getCurrencySymbol(currency || "sar").symbol}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-gray-500">
                    {t("JobListings.jobs_section.no_jobs_found")}
                  </p>
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
