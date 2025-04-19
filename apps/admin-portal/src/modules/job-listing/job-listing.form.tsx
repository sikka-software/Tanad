import { useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { Job } from "@/modules/job/job.type";

import { useJobs } from "@/modules/job/job.hooks";

interface JobListingFormProps {
  id?: string;
  onSuccess?: () => void;
  onSubmit: (data: JobListingFormValues) => Promise<void>;
  loading?: boolean;
}

const jobListingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  jobs: z.array(z.string()).min(1, "At least one job is required"),
});

export type JobListingFormValues = z.infer<typeof jobListingFormSchema>;

export function JobListingForm({ id, onSuccess, onSubmit, loading = false }: JobListingFormProps) {
  const t = useTranslations();
  const { data: jobs, isLoading: isLoadingJobs } = useJobs();
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const form = useForm<JobListingFormValues>({
    resolver: zodResolver(jobListingFormSchema),
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

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
