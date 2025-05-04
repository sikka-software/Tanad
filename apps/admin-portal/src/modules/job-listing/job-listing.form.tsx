import { zodResolver } from "@hookform/resolvers/zod";
import FormSectionHeader from "@root/src/components/forms/form-section-header";
import { FormDialog } from "@root/src/components/ui/form-dialog";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import JobListingOptionsSection from "@/components/forms/job-listing-options-section";

import { ModuleFormProps } from "@/types/common.type";

import { useJobs } from "@/job/job.hooks";

import { useCreateJobListing, useUpdateJobListing } from "@/job-listing/job-listing.hooks";
import useJobListingsStore from "@/job-listing/job-listing.store";
import {
  JobListing,
  JobListingUpdateData,
  JobListingCreateData,
} from "@/job-listing/job-listing.type";

import { useBranches } from "@/modules/branch/branch.hooks";
import { useDepartments } from "@/modules/department/department.hooks";
import { useOffices } from "@/modules/office/office.hooks";
import { useWarehouses } from "@/modules/warehouse/warehouse.hooks";
import useUserStore from "@/stores/use-user-store";

import { JobForm } from "../job/job.form";
import useJobStore from "../job/job.store";
import { Job } from "../job/job.type";
import { bulkAssociateJobsWithListing, updateListingJobAssociations } from "./job-listing.service";

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
}: ModuleFormProps<JobListingUpdateData>) {
  const t = useTranslations();
  const { data: jobs, isLoading: isLoadingJobs } = useJobs();

  const { data: departments, isLoading: isLoadingDepartments } = useDepartments();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();
  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const { data: offices, isLoading: isLoadingOffices } = useOffices();

  const { mutateAsync: createJobListing, isPending: isCreating } = useCreateJobListing();
  const { mutateAsync: updateJobListing, isPending: isUpdating } = useUpdateJobListing();

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { profile, membership } = useUserStore();

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
    if (!profile?.id) {
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
    const userId = profile.id;

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
          {
            id: defaultValues.id,
            jobListing: updatePayload,
          },
          {
            onSuccess: async (updatedListing) => {
              toast.success(t("JobListings.success.update"));

              // Update associations
              try {
                await updateListingJobAssociations(defaultValues.id!, selectedJobIds);
                toast.info(t("JobListings.success.associations_updated"));
              } catch (assocError) {
                console.error("Failed to update job associations:", assocError);
                toast.warning(t("JobListings.warning.associations_failed"));
                // The main listing update was successful, but associations failed.
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
          user_id: userId,
          enterprise_id: enterpriseId,
          is_active: true,
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
            toast.success(t("JobListings.success.create"));

            // Associate selected jobs
            if (selectedJobIds.length > 0) {
              try {
                await bulkAssociateJobsWithListing(createdListing.id, selectedJobIds);
                toast.info(t("JobListings.success.associations_created"));
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

  // --- Prepare Options Data ---
  const availableCurrencies = useMemo(
    () => [
      // Replace with your actual currency list source if needed
      { value: "USD", label: "USD - US Dollar" },
      { value: "EUR", label: "EUR - Euro" },
      { value: "GBP", label: "GBP - British Pound" },
      // Add other currencies as needed
    ],
    [],
  );

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

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
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
            form={form}
            availableCurrencies={availableCurrencies}
            availableLocations={availableLocations}
            availableDepartments={availableDepartments}
            loadingLocations={isLoadingLocations}
            loadingDepartments={isLoadingDepartments}
          />

          <FormSectionHeader
            title={t("JobListings.jobs_section.title")}
            subtitle={t("JobListings.jobs_section.subtitle")}
            onCreateText={t("Jobs.add_new")}
            onCreate={() => setIsJobDialogOpen(true)}
          />
          <div className="form-container">
            <FormField
              control={form.control}
              name="jobs"
              render={() => (
                <FormItem>
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
                          {job.department && (
                            <p className="text-sm text-gray-600">{job.department}</p>
                          )}
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
          </div>
        </form>
      </Form>
      <FormDialog
        open={isJobDialogOpen}
        onOpenChange={setIsJobDialogOpen}
        title={t("Jobs.add_new")}
        formId="job-form"
        loadingSave={isJobSaving}
      >
        <JobForm
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
