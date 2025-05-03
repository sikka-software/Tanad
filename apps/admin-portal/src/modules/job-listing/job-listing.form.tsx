import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { ModuleFormProps } from "@/types/common.type";

import { useJobs } from "@/job/job.hooks";

import { useCreateJobListing, useUpdateJobListing } from "@/job-listing/job-listing.hooks";
import useJobListingsStore from "@/job-listing/job-listing.store";
import { JobListing, JobListingUpdateData } from "@/job-listing/job-listing.type";

import useUserStore from "@/stores/use-user-store";

import { Job } from "../job/job.type";

interface JobListingFormProps {
  id?: string;
  onSuccess?: () => void;
  loading?: boolean;
  defaultValues?: JobListingUpdateData | null;
  editMode?: boolean;
}

export const createJobListingFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("JobListings.form.title.required")),
    description: z.string().optional(),
    jobs: z.array(z.string()).min(1, t("JobListings.form.jobs.required")),
  });

export type JobListingFormValues = z.infer<ReturnType<typeof createJobListingFormSchema>>;

export function JobListingForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<JobListing>) {
  const t = useTranslations();
  const { data: jobs, isLoading: isLoadingJobs } = useJobs();

  const { mutateAsync: createJobListing, isPending: isCreating } = useCreateJobListing();
  const { mutateAsync: updateJobListing, isPending: isUpdating } = useUpdateJobListing();

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { profile, membership } = useUserStore();

  const isLoading = useJobListingsStore((state) => state.isLoading);
  const setIsLoading = useJobListingsStore((state) => state.setIsLoading);

  const form = useForm<JobListingFormValues>({
    resolver: zodResolver(createJobListingFormSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      jobs: [],
    },
  });

  const handleJobSelect = (job_id: string) => {
    setSelectedJobs((prev) => {
      if (prev.includes(job_id)) {
        return prev.filter((id) => id !== job_id);
      }
      return [...prev, job_id];
    });
    form.setValue("jobs", selectedJobs);
  };

  const handleSubmit = async (data: JobListingFormValues) => {
    setIsLoading(true);
    if (!profile?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Job Listing ID missing in edit mode");
          toast.error(t("JobListings.error.missing_id"));
          setIsLoading(false);
          return;
        }
        await updateJobListing(
          {
            id: defaultValues.id,
            jobListing: {
              title: data.title.trim(),
              description: data.description?.trim() || null,
              jobs: data.jobs,
              user_id: profile?.id || "",
            },
          },
          {
            onSuccess: async () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      } else {
        await createJobListing(
          {
            id: "",
            title: data.title.trim(),
            description: data.description?.trim() || null,
            jobs: data.jobs,
            user_id: profile?.id || "",
            is_active: true,
            slug: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onSuccess: async () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save job listing:", error);
      toast.error(t("General.error_operation"), {
        description: t("JobListings.error.create"),
      });
    }
  };

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Jobs.form.title.label")} *</FormLabel>
              <FormControl>
                <Input placeholder={t("Jobs.form.title.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Jobs.form.description.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Jobs.form.description.placeholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobs"
          render={() => (
            <FormItem>
              <FormLabel>{t("Jobs.title")} *</FormLabel>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
