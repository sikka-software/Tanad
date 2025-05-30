import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { useQueryClient } from "@tanstack/react-query";
import { createInsertSchema } from "drizzle-zod";
import { Building2, ShoppingCart, Store, Warehouse } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import BooleanTabs from "@/ui/boolean-tabs";
import { Card, CardHeader, CardTitle } from "@/ui/card";
import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import { Dialog } from "@/ui/dialog";
import { DialogContent } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { DateInput } from "@/ui/inputs/date-input";
import { Input } from "@/ui/inputs/input";
import NumberInputWithButtons from "@/ui/inputs/number-input-buttons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { renderLocationOption } from "@/components/app/location-options";

import { formatToYYYYMMDD } from "@/utils/date-utils";
import { validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { OfficeForm } from "@/office/office.form";

import { WarehouseForm } from "@/warehouse/warehouse.form";

import { BranchForm } from "@/branch/branch.form";
import useBranchStore from "@/branch/branch.store";

import DepartmentForm from "@/department/department.form";
import { useDepartments } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";

import { useCreateJob, useUpdateJob } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";
import { JobUpdateData, JobCreateData } from "@/job/job.type";

import { OnlineStoreForm } from "@/online-store/online-store.form";
import useOnlineStoreStore from "@/online-store/online-store.store";

import { jobs } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

import { useBranches } from "../branch/branch.hooks";
import { useOffices } from "../office/office.hooks";
import { useOnlineStores } from "../online-store/online-store.hooks";
import { useWarehouses } from "../warehouse/warehouse.hooks";

const createJobFormSchema = (t: (key: string) => string) => {
  const JobSelectSchema = createInsertSchema(jobs, {
    title: z
      .string({
        message: t("Jobs.form.title.required"),
      })
      .min(1, t("Jobs.form.title.required")),
    type: z
      .string({
        message: t("Jobs.form.type.required"),
      })
      .min(1, t("Jobs.form.type.required")),
    salary: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        t("Jobs.form.salary.invalid"),
      ),
    start_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Jobs.form.start_date.invalid")),
    end_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Jobs.form.end_date.invalid")),
    location: z.string(),
    location_id: z.string(),
    location_type: z.string(),

    total_positions: z.coerce.string().optional().default("1"),
  });

  return JobSelectSchema;
};

type JobFormValues = z.input<ReturnType<typeof createJobFormSchema>>;

function JobForm({
  formHtmlId,
  defaultValues,
  editMode = false,
  onSuccess,
}: ModuleFormProps<JobUpdateData | JobCreateData>) {
  const t = useTranslations();
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);

  const { data: departments = [], isLoading: isFetchingDepartments } = useDepartments();
  const { data: offices = [], isLoading: isFetchingOffices } = useOffices();
  const { data: warehouses = [], isLoading: isFetchingWarehouses } = useWarehouses();
  const { data: branches = [], isLoading: isFetchingBranches } = useBranches();
  const { data: onlineStores = [], isLoading: isFetchingOnlineStores } = useOnlineStores();

  const isFetchingLocations =
    isFetchingOffices || isFetchingWarehouses || isFetchingBranches || isFetchingOnlineStores;

  const setIsSavingDepartment = useDepartmentStore((state) => state.setIsLoading);
  const isSavingDepartment = useDepartmentStore((state) => state.isLoading);

  const isSavingBranch = useBranchStore((state) => state.isLoading);
  const setIsSavingBranch = useBranchStore((state) => state.setIsLoading);

  const isSavingOnlineStore = useOnlineStoreStore((state) => state.isLoading);
  const setIsSavingOnlineStore = useOnlineStoreStore((state) => state.setIsLoading);

  const [isChooseLocationDialogOpen, setIsChooseLocationDialogOpen] = useState(false);
  const [chosenForm, setChosenForm] = useState<
    "Warehouses" | "Offices" | "Branches" | "OnlineStores" | "Departments"
  >();

  const { mutate: createJob } = useCreateJob();
  const { mutate: updateJob } = useUpdateJob();

  const isSavingJob = useJobStore((state) => state.isLoading);
  const setIsSavingJob = useJobStore((state) => state.setIsLoading);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(createJobFormSchema(t)),
    defaultValues: {
      ...defaultValues,
      location_id: defaultValues?.location_id || "",
      location_type: defaultValues?.location_type || "",
      salary: defaultValues?.salary ? String(defaultValues.salary) : undefined,
      status: defaultValues?.status || "active",
      location: defaultValues?.location || "",
    },
  });

  const departmentOptions = useMemo(
    () =>
      departments.map((dept) => ({
        label: dept.name,
        value: dept.name,
      })),
    [departments],
  );

  const locationOptions = useMemo(() => {
    let officesOptions = offices.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "office" as const },
    }));
    let warehousesOptions = warehouses.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "warehouse" as const },
    }));
    let branchesOptions = branches.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "branch" as const },
    }));
    return [...officesOptions, ...warehousesOptions, ...branchesOptions];
  }, [offices, warehouses, branches]);

  const handleSubmit = async (data: JobFormValues) => {
    setIsSavingJob(true);
    console.log("data", data);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode && defaultValues?.id) {
        await updateJob(
          { id: defaultValues.id, data },
          {
            onSuccess: () => onSuccess?.(),
            onError: () => setIsSavingJob(false),
          },
        );
      } else {
        await createJob(
          {
            ...data,
            start_date: formatToYYYYMMDD(data.start_date),
            end_date: formatToYYYYMMDD(data.end_date),
          },
          {
            onSuccess: () => onSuccess?.(),
            onError: () => setIsSavingJob(false),
          },
        );
      }
    } catch (error) {
      setIsSavingJob(false);
      console.error("Failed to save job:", error);
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).jobForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "job-form"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(form.getValues());
          form.handleSubmit(handleSubmit)(e);
        }}
      >
        <input hidden type="text" value={user?.id} {...form.register("user_id")} />
        <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
        <div className="form-container">
          <div className="form-fields-cols-2">
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.type.label")} *</FormLabel>
                  <Select
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Jobs.form.type.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_time">{t("Jobs.form.type.full_time")}</SelectItem>
                      <SelectItem value="part_time">{t("Jobs.form.type.part_time")}</SelectItem>
                      <SelectItem value="contract">{t("Jobs.form.type.contract")}</SelectItem>
                      <SelectItem value="internship">{t("Jobs.form.type.internship")}</SelectItem>
                      <SelectItem value="temporary">{t("Jobs.form.type.temporary")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.department.label")}</FormLabel>
                  <FormControl>
                    <ComboboxAdd
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      data={departmentOptions}
                      isLoading={isFetchingDepartments}
                      defaultValue={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("Jobs.form.department.placeholder"),
                        searchPlaceholder: t("Pages.Departments.search"),
                        noItems: t("Pages.Departments.no_departments_found"),
                      }}
                      addText={t("Pages.Departments.add")}
                      onAddClick={() => {
                        setChosenForm("Departments");
                        setIsDepartmentDialogOpen(true);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("Jobs.form.location.label")}</FormLabel>
                  <ComboboxAdd
                    data={locationOptions}
                    defaultValue={field.value}
                    valueKey="value"
                    labelKey="label"
                    onChange={(selectedValue) => {
                      const selectedOption = locationOptions.find(
                        (opt) => opt.value === selectedValue,
                      );
                      if (selectedOption) {
                        field.onChange(selectedOption.value);
                        form.setValue("location_type", selectedOption.metadata.type, {
                          shouldValidate: true,
                        });
                        form.setValue("location_id", selectedOption.id, { shouldValidate: true });
                      } else {
                        field.onChange("");
                        form.setValue("location_type", "", { shouldValidate: true });
                        form.setValue("location_id", "", { shouldValidate: true });
                      }
                    }}
                    texts={{
                      placeholder: t("Jobs.form.location.placeholder"),
                      searchPlaceholder: t("Pages.Jobs.search"),
                      noItems: t("Pages.Jobs.no_jobs_found"),
                    }}
                    isLoading={isFetchingLocations}
                    renderOption={(option) => renderLocationOption(option, t)}
                    renderSelected={(item) => {
                      if (!item) {
                        const currentId = field.value;
                        const foundOption = locationOptions.find((opt) => opt.value === currentId);
                        return foundOption
                          ? foundOption.label
                          : t("Jobs.form.location.placeholder");
                      }
                      return item.label;
                    }}
                    addText={t("Pages.Locations.add")}
                    onAddClick={() => {
                      setIsChooseLocationDialogOpen(true);
                    }}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.start_date.label")}</FormLabel>
                  <FormControl>
                    <DateInput
                      placeholder={t("Jobs.form.start_date.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={isSavingJob}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.end_date.label")}</FormLabel>
                  <FormControl>
                    <DateInput
                      placeholder={t("Jobs.form.end_date.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={isSavingJob}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="total_positions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.total_positions.label")}</FormLabel>
                <FormControl>
                  <NumberInputWithButtons
                    value={field.value ? parseInt(field.value) : 1}
                    minValue={0}
                    onChange={(numericValue) => {
                      if (isNaN(numericValue)) {
                        field.onChange("");
                      } else {
                        field.onChange(numericValue);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.salary.label")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      showCommas={true}
                      value={field.value ? parseFloat(field.value) : undefined}
                      onChange={(value) => field.onChange(value?.toString() || "")}
                      placeholder={t("Jobs.form.salary.placeholder")}
                      disabled={isSavingJob}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.status.label")} *</FormLabel>
                  <BooleanTabs
                    trueText={t("Jobs.form.status.active")}
                    falseText={t("Jobs.form.status.inactive")}
                    value={field.value === "active"}
                    onValueChange={(newValue) => {
                      field.onChange(newValue ? "active" : "inactive");
                    }}
                    listClassName="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.requirements.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Jobs.form.requirements.placeholder")}
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.responsibilities.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Jobs.form.responsibilities.placeholder")}
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.benefits.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Jobs.form.benefits.placeholder")}
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>

      <Dialog open={isChooseLocationDialogOpen} onOpenChange={setIsChooseLocationDialogOpen}>
        <DialogContent>
          <div className="m-4 grid grid-cols-2 gap-4">
            <Card
              onClick={() => {
                setChosenForm("Warehouses");
                setIsDepartmentDialogOpen(true);
              }}
              className="flex cursor-pointer flex-col items-center justify-center pt-6 transition-all duration-300 hover:shadow-xl"
            >
              <Warehouse className="h-10 w-10" />
              <CardHeader>
                <CardTitle>{t("Pages.Warehouses.singular")}</CardTitle>
              </CardHeader>
            </Card>
            <Card
              onClick={() => {
                setChosenForm("Offices");
                setIsDepartmentDialogOpen(true);
              }}
              className="flex cursor-pointer flex-col items-center justify-center pt-6 transition-all duration-300 hover:shadow-xl"
            >
              <Building2 className="h-10 w-10" />
              <CardHeader>
                <CardTitle>{t("Pages.Offices.singular")}</CardTitle>
              </CardHeader>
            </Card>
            <Card
              onClick={() => {
                setChosenForm("Branches");
                setIsDepartmentDialogOpen(true);
              }}
              className="flex cursor-pointer flex-col items-center justify-center pt-6 transition-all duration-300 hover:shadow-xl"
            >
              <Store className="h-10 w-10" />
              <CardHeader>
                <CardTitle>{t("Pages.Branches.singular")}</CardTitle>
              </CardHeader>
            </Card>
            <Card
              onClick={() => {
                setChosenForm("OnlineStores");
                setIsDepartmentDialogOpen(true);
              }}
              className="flex cursor-pointer flex-col items-center justify-center pt-6 transition-all duration-300 hover:shadow-xl"
            >
              <ShoppingCart className="h-10 w-10" />
              <CardHeader>
                <CardTitle>{t("Pages.OnlineStores.singular")}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <FormDialog
        open={isDepartmentDialogOpen}
        onOpenChange={setIsDepartmentDialogOpen}
        title={t(`Pages.${chosenForm}.add`)}
        formId="department-form"
        loadingSave={isSavingDepartment}
        // dummyData={() => process.env.NODE_ENV === "development" && generateDummyDepartment()} // Commented out
      >
        {chosenForm === "Warehouses" && (
          <WarehouseForm
            nestedForm
            formHtmlId="warehouse-form"
            onSuccess={() => {
              setIsSavingDepartment(false);
              setIsDepartmentDialogOpen(false);
            }}
          />
        )}
        {chosenForm === "Offices" && (
          <OfficeForm
            nestedForm
            formHtmlId="office-form"
            onSuccess={() => {
              // setIsDepartmentSaving(false);
              // setIsDepartmentDialogOpen(false);
            }}
          />
        )}
        {chosenForm === "Branches" && (
          <BranchForm
            nestedForm
            formHtmlId="branch-form"
            onSuccess={() => {
              setIsSavingBranch(false);
              setIsDepartmentDialogOpen(false);
            }}
          />
        )}
        {chosenForm === "Departments" && (
          <DepartmentForm
            nestedForm
            formHtmlId="department-form"
            onSuccess={() => {
              setIsSavingDepartment(false);
              setIsDepartmentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["departments"] });
            }}
          />
        )}
        {chosenForm === "OnlineStores" && (
          <OnlineStoreForm
            nestedForm
            formHtmlId="online-store-form"
            onSuccess={() => {
              setIsSavingOnlineStore(false);
              setIsDepartmentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["departments"] });
            }}
          />
        )}
      </FormDialog>
    </Form>
  );
}

export default JobForm;
