import { FieldError, UseFormReturn } from "react-hook-form";

import FormSectionHeader from "@/components/forms/form-section-header";
import { FormField, FormItem } from "@/components/ui/form";

import { JobListingFormValues } from "@/modules/job-listing/job-listing.form";
import { Job } from "@/modules/job/job.type";

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
      <div className="form-container">
        <FormField
          control={form.control}
          name="jobs"
          render={() => (
            <FormItem>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                {jobs?.map((job: Job) => (
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
                      {job.department && <p className="text-sm text-gray-600">{job.department}</p>}
                      {job.location && <p className="text-sm text-gray-600">{job.location}</p>}
                      {job.salary && <p className="text-sm text-gray-600">{job.salary}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default JobListingJobsSelection;
