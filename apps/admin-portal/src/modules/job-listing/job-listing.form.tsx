import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Textarea } from "@/ui/textarea";

import JobListingJobsSelection from "@/components/forms/job-listing-jobs-selection";
import JobListingOptionsSection from "@/components/forms/job-listing-options-section";
import { Input } from "@/components/ui/inputs/input";

import { ModuleFormProps } from "@/types/common.type";

import JobForm from "@/job/job.form";
import { useJobs } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";

import { useCreateJobListing, useUpdateJobListing } from "@/job-listing/job-listing.hooks";
import {
  bulkAssociateJobsWithListing,
  updateListingJobAssociations,
} from "@/job-listing/job-listing.service";
import useJobListingsStore from "@/job-listing/job-listing.store";
import { JobListingUpdateData, JobListingCreateData } from "@/job-listing/job-listing.type";

import { job_listings, offices } from "@/db/schema";
import { useBranches } from "@/modules/branch/branch.hooks";
import { useDepartments } from "@/modules/department/department.hooks";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";

const createJobListingSchema = (t: (key: string) => string) => {
  const JobListingSelectSchema = createInsertSchema(job_listings, {
    title: z.string().min(1, t("JobListings.form.title.required")),
    description: z.string().optional(),
    currency: z.string().optional(),
    enable_search_filtering: z.boolean().optional(),

    locations: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
  });
  const JobListingItemsSchema = z.array(z.string()).min(1, t("JobListings.form.jobs.required"));

  return JobListingSelectSchema.extend({
    jobs: JobListingItemsSchema,
  });
};

export type JobListingFormValues = z.input<ReturnType<typeof createJobListingSchema>>;

export function JobListingForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<JobListingUpdateData | JobListingCreateData>) {
  const t = useTranslations();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { data: jobs, isLoading: isLoadingJobs } = useJobs();

  const { data: departments, isLoading: isLoadingDepartments } = useDepartments();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();
  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const { data: offices, isLoading: isLoadingOffices } = useOffices();

  const { mutateAsync: createJobListing, isPending: isCreating } = useCreateJobListing();
  const { mutateAsync: updateJobListing, isPending: isUpdating } = useUpdateJobListing();

  const getJobIds = (jobs: any[] | undefined) =>
    Array.isArray(jobs)
      ? jobs.map((j: any) => (typeof j === "string" ? j : j.job_id || j.id)).filter(Boolean)
      : [];

  const [selectedJobs, setSelectedJobs] = useState<string[]>(() => getJobIds(defaultValues?.jobs));

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const isJobSaving = useJobStore((state) => state.isLoading);
  const setIsJobSaving = useJobStore((state) => state.setIsLoading);
  const isLoading = useJobListingsStore((state) => state.isLoading);
  const setIsLoading = useJobListingsStore((state) => state.setIsLoading);

  const form = useForm<JobListingFormValues>({
    resolver: zodResolver(createJobListingSchema(t)),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      currency: defaultValues?.currency || "sar",
      enable_search_filtering: defaultValues?.enable_search_filtering || true,
      slug: defaultValues?.slug || "",
      status: defaultValues?.status || "active",
      is_public: defaultValues?.is_public || true,
      jobs: Array.isArray(defaultValues?.jobs) ? defaultValues.jobs.map((job: any) => job.id) : [],
    },
  });

  console.log("default jobs ", defaultValues);

  const handleJobSelect = (job_id: string) => {
    setSelectedJobs((prev) => {
      const newSelection = prev.includes(job_id)
        ? prev.filter((id) => id !== job_id)
        : [...prev, job_id];
      form.setValue("jobs", newSelection);
      return newSelection;
    });
  };

  const handleSubmit = async (data: JobListingFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }

    if (!enterprise?.id) {
      toast.error(t("General.error_operation"), {
        description: t("JobListings.error.missing_enterprise"),
      });
      setIsLoading(false);
      return;
    }

    const {
      jobs: selectedJobIds,
      currency,
      enable_search_filtering,
      locations,
      departments,
      ...coreListingData
    } = data;

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
            data: {
              title: coreListingData.title.trim(),
              description: coreListingData.description?.trim() || null,
            },
          },
          {
            onSuccess: async (updatedListing) => {
              try {
                await updateListingJobAssociations(defaultValues.id!, selectedJobIds);
                // toast.info(t("JobListings.success.associations_updated"));
              } catch (assocError) {
                console.error("Failed to update job associations:", assocError);
                toast.warning(t("JobListings.warning.associations_failed"));
              }

              if (onSuccess) {
                onSuccess();
              }
            },
            onError: (error) => {
              console.error("Failed to update job listing:", error);
              toast.error(t("General.error_operation"), {
                description: t("JobListings.error.update"),
              });
            },
            onSettled: () => {
              setIsLoading(false);
            },
          },
        );
      } else {
        const generatedSlug = `${coreListingData.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;

        await createJobListing(
          {
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",
            updated_at: new Date().toISOString(),
            title: coreListingData.title.trim(),
            description: coreListingData.description?.trim() || null,
            status: "active",
            is_public: true,
            slug: generatedSlug,
          },
          {
            onSuccess: async (createdListing) => {
              if (selectedJobIds.length > 0) {
                try {
                  await bulkAssociateJobsWithListing(createdListing.id, selectedJobIds);
                } catch (assocError) {
                  console.error("Failed to associate jobs:", assocError);
                  toast.warning(t("JobListings.warning.associations_failed_create"));
                }
              }

              if (onSuccess) onSuccess();
            },
            onError: (error) => {
              console.error("Failed to create job listing:", error);
              toast.error(t("General.error_operation"), {
                description: t("JobListings.error.create"),
              });
            },
            onSettled: () => {
              setIsLoading(false);
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save job listing (outer catch):", error);
      toast.error(t("General.error_operation"), {
        description: t("JobListings.error.generic_save"),
      });
    }
  };

  const isLoadingLocations = isLoadingWarehouses || isLoadingBranches || isLoadingOffices;
  const availableLocations = useMemo(() => {
    const allLocations: { id: string; name: string }[] = [];

    if (warehouses) {
      allLocations.push(
        ...warehouses.map((w) => ({ id: `warehouse:${w.id}`, name: `${w.name} (Warehouse)` })),
      );
    }
    if (branches) {
      allLocations.push(
        ...branches.map((b) => ({ id: `branch:${b.id}`, name: `${b.name} (Branch)` })),
      );
    }
    if (offices) {
      allLocations.push(
        ...offices.map((o) => ({ id: `office:${o.id}`, name: `${o.name} (Office)` })),
      );
    }

    // Sort alphabetically by name for better UX
    return allLocations.sort((a, b) => a.name.localeCompare(b.name));
  }, [warehouses, branches, offices]);

  const availableDepartments = useMemo(() => {
    if (!departments) return [];
    return departments
      .map((dept) => ({ id: dept.id, name: dept.name }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }, [departments]);
  // --- End Options Data ---

  useEffect(() => {
    const jobIds = getJobIds(defaultValues?.jobs);
    setSelectedJobs(jobIds);
    form.setValue("jobs", jobIds);
  }, [defaultValues?.jobs]);

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)} className="mb-40">
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />

          <div className="form-container">
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
          </div>

          <JobListingOptionsSection
            inDialog={editMode}
            form={form}
            availableLocations={availableLocations}
            availableDepartments={availableDepartments}
            loadingLocations={isLoadingLocations}
            loadingDepartments={isLoadingDepartments}
          />
          <JobListingJobsSelection
            editMode={editMode}
            currency={form.watch("currency")}
            setIsJobDialogOpen={setIsJobDialogOpen}
            form={form}
            jobs={jobs}
            selectedJobs={selectedJobs}
            handleJobSelect={handleJobSelect}
          />
        </form>
      </Form>
      <FormDialog
        open={isJobDialogOpen}
        onOpenChange={setIsJobDialogOpen}
        title={t("Pages.Jobs.add")}
        formId="job-form"
        loadingSave={isJobSaving}
      >
        <JobForm
          nestedForm
          formHtmlId="job-form"
          onSuccess={() => {
            setIsJobDialogOpen(false);
            setIsJobSaving(false);
          }}
        />
      </FormDialog>
    </>
  );
}
