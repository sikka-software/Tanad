import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, ShoppingCart, Store, Warehouse } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";

import { ModuleFormProps } from "@/types/common.type";

import { useCreateJob, useUpdateJob } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";
import { JobUpdateData, JobCreateData } from "@/job/job.type";

import DepartmentForm from "@/department/department.form";
import { useDepartments } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";

import useUserStore from "@/stores/use-user-store";

import { BranchForm } from "../branch/branch.form";
import { OfficeForm } from "../office/office.form";
import { WarehouseForm } from "../warehouse/warehouse.form";

const createJobFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t("Jobs.form.title.required")),
    description: z.string().optional(),
    requirements: z.string().optional(),
    responsibilities: z.string().optional(),
    benefits: z.string().optional(),
    location: z.string().optional(),
    department: z.string().optional(),
    type: z.string().min(1, t("Jobs.form.type.required")),
    salary: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        t("Jobs.form.salary.invalid"),
      ),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    status: z.string().default("active"),
  });

export type JobFormValues = z.input<ReturnType<typeof createJobFormSchema>>;

export function JobForm({
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
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const setIsDepartmentSaving = useDepartmentStore((state) => state.setIsLoading);
  const isDepartmentSaving = useDepartmentStore((state) => state.isLoading);

  const [isChooseLocationDialogOpen, setIsChooseLocationDialogOpen] = useState(false);
  const [chosenForm, setChosenForm] = useState<
    "Warehouses" | "Offices" | "Branches" | "OnlineShops" | "Departments"
  >();

  const { mutate: createJob } = useCreateJob();
  const { mutate: updateJob } = useUpdateJob();

  const isLoading = useJobStore((state) => state.isLoading);
  const setIsLoading = useJobStore((state) => state.setIsLoading);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(createJobFormSchema(t)),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      requirements: defaultValues?.requirements || "",
      responsibilities: defaultValues?.responsibilities || "",
      benefits: defaultValues?.benefits || "",
      location: defaultValues?.location || "",
      department: defaultValues?.department || "",
      type: defaultValues?.type || "full-time",
      salary: defaultValues?.salary ? String(defaultValues.salary) : undefined,
      start_date: defaultValues?.start_date ? new Date(defaultValues.start_date) : undefined,
      end_date: defaultValues?.end_date ? new Date(defaultValues.end_date) : undefined,
      status: defaultValues?.status || "active",
    },
  });

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.name,
  }));

  const handleSubmit = async (data: JobFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateJob(
          {
            id: defaultValues?.id || "",
            data: {
              title: data.title.trim(),
              description: data.description?.trim() || null,
              requirements: data.requirements?.trim() || null,
              responsibilities: data.responsibilities?.trim() || null,
              benefits: data.benefits?.trim() || null,
              location: data.location?.trim() || null,
              department: data.department?.trim() || null,
              type: data.type.trim(),
              salary: data.salary ? parseFloat(data.salary) : null,
              status: data.status as "active" | "inactive" | "draft" | "archived" | null,
              start_date: data.start_date?.toISOString() || null,
              end_date: data.end_date?.toISOString() || null,
            },
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      } else {
        await createJob(
          {
            title: data.title.trim(),
            description: data.description?.trim() || null,
            requirements: data.requirements?.trim() || null,
            responsibilities: data.responsibilities?.trim() || null,
            benefits: data.benefits?.trim() || null,
            location: data.location?.trim() || null,
            department: data.department?.trim() || null,
            enterprise_id: enterprise?.id || "",
            type: data.type.trim(),
            salary: data.salary ? parseFloat(data.salary) : null,
            status: data.status as "active" | "inactive" | "draft" | "archived" | null,
            start_date: data.start_date?.toISOString() || null,
            end_date: data.end_date?.toISOString() || null,
            user_id: user?.id,
          },
          {
            onSuccess: async (response) => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save job:", error);
      toast.error(t("General.error_operation"), {
        description: t("Jobs.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).jobForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      <SelectItem value="full-time">{t("Jobs.form.type.full_time")}</SelectItem>
                      <SelectItem value="part-time">{t("Jobs.form.type.part_time")}</SelectItem>
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
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={departmentOptions}
                      isLoading={departmentsLoading}
                      defaultValue={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("Jobs.form.department.placeholder"),
                        searchPlaceholder: t("Departments.search_departments"),
                        noItems: t("Departments.no_departments"),
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
                <FormItem>
                  <FormLabel>{t("Jobs.form.location.label")}</FormLabel>
                  <FormControl>
                    <ComboboxAdd
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={departmentOptions}
                      isLoading={departmentsLoading}
                      defaultValue={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      texts={{
                        placeholder: t("Jobs.form.location.placeholder"),
                        searchPlaceholder: t("Pages.Locations.search"),
                        noItems: t("Pages.Locations.no_locations"),
                      }}
                      addText={t("Pages.Locations.add")}
                      onAddClick={() => setIsChooseLocationDialogOpen(true)}
                    />
                    {/* <Input placeholder={t("Jobs.form.location.placeholder")} {...field} /> */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.start_date.label")}</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={value}
                      onSelect={onChange}
                      placeholder={t("Jobs.form.start_date.placeholder")}
                      ariaInvalid={form.formState.errors.start_date !== undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>{t("Jobs.form.end_date.label")}</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={value}
                      onSelect={onChange}
                      placeholder={t("Jobs.form.end_date.placeholder")}
                      ariaInvalid={form.formState.errors.end_date !== undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    disabled={isLoading}
                  />
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
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.requirements.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Jobs.form.requirements.placeholder")}
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
            name="responsibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.responsibilities.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Jobs.form.responsibilities.placeholder")}
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
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Jobs.form.benefits.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Jobs.form.benefits.placeholder")}
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
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t("Jobs.form.status.label")}</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value === "active"} onCheckedChange={field.onChange} />
                </FormControl>
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
                <CardTitle>{t("Warehouses.singular")}</CardTitle>
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
                <CardTitle>{t("Offices.singular")}</CardTitle>
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
                <CardTitle>{t("Branches.singular")}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="relative flex cursor-not-allowed flex-col items-center justify-center overflow-clip pt-6">
              <Badge className="absolute -end-0 -top-0 rounded-sm rounded-e-none !rounded-t-none bg-blue-200 p-1 px-2 text-[10px] text-black dark:bg-blue-800 dark:text-white">
                {t("General.soon")}
              </Badge>
              <ShoppingCart className="text-muted-foreground/50 h-10 w-10" />
              <CardHeader>
                <CardTitle className="text-muted-foreground/50">
                  {t("OnlineShops.singular")}
                </CardTitle>
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
        loadingSave={isDepartmentSaving}
        // dummyData={() => process.env.NODE_ENV === "development" && generateDummyDepartment()} // Commented out
      >
        {chosenForm === "Warehouses" && (
          <WarehouseForm
            nestedForm
            formHtmlId="warehouse-form"
            onSuccess={() => {
              setIsDepartmentSaving(false);
              setIsDepartmentDialogOpen(false);
            }}
          />
        )}
        {chosenForm === "Offices" && (
          <OfficeForm
            nestedForm
            formHtmlId="office-form"
            onSuccess={() => {
              setIsDepartmentSaving(false);
              setIsDepartmentDialogOpen(false);
            }}
          />
        )}
        {chosenForm === "Branches" && (
          <BranchForm
            nestedForm
            formHtmlId="branch-form"
            onSuccess={() => {
              setIsDepartmentSaving(false);
              setIsDepartmentDialogOpen(false);
            }}
          />
        )}
        {chosenForm === "Departments" && (
          <DepartmentForm
            nestedForm
            formHtmlId="department-form"
            onSuccess={() => {
              setIsDepartmentSaving(false);
              setIsDepartmentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["departments"] });
            }}
          />
        )}
      </FormDialog>
    </Form>
  );
}
