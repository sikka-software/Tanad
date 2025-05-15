import { zodResolver } from "@hookform/resolvers/zod";
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

import { useBranches } from "@/modules/branch/branch.hooks";
import { useDepartments } from "@/modules/department/department.hooks";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";

export const createJobListingFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("JobListings.form.title.required")),
    description: z.string().optional(),
    jobs: z.array(z.string()).min(1, t("JobListings.form.jobs.required")),
    currency: z.string().optional(),
    enableSearchFiltering: z.boolean().optional(),
    locations: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
  });

export type JobListingFormValues = z.infer<ReturnType<typeof createJobListingFormSchema>>;

export function JobListingForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<JobListingUpdateData | JobListingCreateData>) {
  const t = useTranslations();
  const { data: jobs, isLoading: isLoadingJobs } = useJobs();

  const { data: departments, isLoading: isLoadingDepartments } = useDepartments();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();
  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const { data: offices, isLoading: isLoadingOffices } = useOffices();

  const { mutateAsync: createJobListing, isPending: isCreating } = useCreateJobListing();
  const { mutateAsync: updateJobListing, isPending: isUpdating } = useUpdateJobListing();

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { user, membership } = useUserStore();

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const isJobSaving = useJobStore((state) => state.isLoading);
  const setIsJobSaving = useJobStore((state) => state.setIsLoading);
  const isLoading = useJobListingsStore((state) => state.isLoading);
  const setIsLoading = useJobListingsStore((state) => state.setIsLoading);

  const form = useForm<JobListingFormValues>({
    resolver: zodResolver(createJobListingFormSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      jobs: [],
      currency: "sar",
      enableSearchFiltering: true,
      locations: [],
      departments: [],
    },
  });

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

    if (!membership?.enterprise_id) {
      toast.error(t("General.error_operation"), {
        description: t("JobListings.error.missing_enterprise"),
      });
      setIsLoading(false);
      return;
    }

    const {
      jobs: selectedJobIds,
      currency,
      enableSearchFiltering,
      locations,
      departments,
      ...coreListingData
    } = data;
    const enterpriseId = membership.enterprise_id;

    try {
      if (editMode && defaultValues) {
        if (!defaultValues.id) {
          console.error("Job Listing ID missing in edit mode");
          toast.error(t("JobListings.error.missing_id"));
          setIsLoading(false);
          return;
        }

        const updatePayload: JobListingUpdateData = {
          title: coreListingData.title.trim(),
          description: coreListingData.description?.trim() || null,
        };

        await updateJobListing(
          { id: defaultValues.id, data: updatePayload },
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
        const createPayload: JobListingCreateData = {
          title: coreListingData.title.trim(),
          description: coreListingData.description?.trim() || null,
          user_id: user?.id || "",
          enterprise_id: enterpriseId,
          status: "active",
          is_public: true,
          slug: "",
          updated_at: new Date().toISOString(),
        };

        // Generate a simple slug from the title + timestamp for uniqueness
        const generatedSlug = `${coreListingData.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;

        const createPayloadWithSlug: JobListingCreateData = {
          ...createPayload,
          slug: generatedSlug,
        };

        await createJobListing(createPayloadWithSlug, {
          onSuccess: async (createdListing) => {
            toast.success(t("General.successful_operation"), {
              description: t("JobListings.success.create"),
            });

            // Associate selected jobs
            if (selectedJobIds.length > 0) {
              try {
                await bulkAssociateJobsWithListing(createdListing.id, selectedJobIds);
              } catch (assocError) {
                console.error("Failed to associate jobs:", assocError);
                toast.warning(t("JobListings.warning.associations_failed_create"));
                // The listing was created, but associating jobs failed.
              }
            }

            if (onSuccess) {
              onSuccess();
            }
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
        });
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
    //  if there's at least one job selected, remove the form validation error state
    if (form.getValues("jobs").length > 0) {
      form.clearErrors("jobs");
    }
  }, [form.getValues("jobs")]);

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)} className="mb-40">
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
