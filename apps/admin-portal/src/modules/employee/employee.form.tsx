import { zodResolver } from "@hookform/resolvers/zod";
import FormSectionHeader from "@root/src/components/forms/form-section-header";
import NotesSection from "@root/src/components/forms/notes-section";
import { Tooltip, TooltipContent, TooltipTrigger } from "@root/src/components/ui/tooltip";
import { getNotesValue } from "@root/src/lib/utils";
import { PlusCircle, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import CountryInput from "@/ui/country-input";
import { CurrencyInput, MoneyFormatter } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { createClient } from "@/utils/supabase/component";

import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/ui/phone-input";

import { ModuleFormProps } from "@/types/common.type";

import DepartmentForm from "@/department/department.form";
import { useDepartments } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";

import { SALARY_COMPONENT_TYPES } from "@/employee/employee.options";
import useEmployeeStore from "@/employee/employee.store";
import type { EmployeeCreateData, EmployeeUpdateData } from "@/employee/employee.types";

import useUserStore from "@/stores/use-user-store";

import { JobForm } from "../job/job.form";
import { useJobs } from "../job/job.hooks";
import useJobStore from "../job/job.store";
import { useCreateEmployee } from "./employee.hooks";
import { useUpdateEmployee } from "./employee.hooks";

const salaryComponentSchema = z.object({
  type: z.string().min(1, "Type is required"),
  amount: z.coerce
    .number({
      invalid_type_error: "Amount must be a number",
    })
    .min(0, "Amount must be non-negative")
    .default(0),
});

export function EmployeeForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<EmployeeUpdateData | EmployeeCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const isDepartmentSaving = useDepartmentStore((state) => state.isLoading);
  const setIsDepartmentSaving = useDepartmentStore((state) => state.setIsLoading);

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const isJobSaving = useJobStore((state) => state.isLoading);
  const setIsJobSaving = useJobStore((state) => state.setIsLoading);

  const { mutateAsync: updateEmployeeMutate, isPending: isUpdatingEmployee } = useUpdateEmployee();
  const { mutateAsync: createEmployeeMutate, isPending: isCreatingEmployee } = useCreateEmployee();

  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);

  const setIsFormDialogOpen = useEmployeeStore((state) => state.setIsFormDialogOpen);

  const actualEmployeeId = editMode ? defaultValues?.id : undefined;
  const initialEmail = editMode ? defaultValues?.email : undefined;

  const createEmployeeFormSchema = () => {
    const supabase = createClient();

    return z.object({
      first_name: z.string().min(1, t("Employees.form.first_name.required")),
      last_name: z.string().min(1, t("Employees.form.last_name.required")),
      email: z
        .string()
        .email(t("Employees.form.email.invalid"))
        .refine(async (email) => {
          if (actualEmployeeId && email === initialEmail) {
            return true;
          }
          setIsEmployeeSaving(true);

          const { user } = useUserStore.getState();
          if (!user?.id) return true;
          const query = supabase
            .from("employees")
            .select("id", { count: "exact" })
            .eq("email", email)
            .eq("user_id", user.id);

          if (actualEmployeeId) {
            query.neq("id", actualEmployeeId);
          }

          const { error, count } = await query;

          if (error) {
            console.error("Email validation error:", error);
            return false;
          }

          setIsEmployeeSaving(false);
          return count === 0;
        }, t("Employees.form.email.duplicate")),
      phone: z.string().optional(),
      job_id: z.string().min(1, t("Employees.form.job.required")),
      hire_date: z.date({
        required_error: t("Employees.form.hire_date.required"),
      }),
      salary: z.array(salaryComponentSchema).optional(),
      status: z.enum(["active", "inactive", "on_leave", "terminated"]),
      nationality: z.string().optional(),
      notes: z.any().optional().nullable(),
    });
  };

  const form = useForm<z.input<ReturnType<typeof createEmployeeFormSchema>>>({
    resolver: zodResolver(createEmployeeFormSchema()),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone ?? "",
      job_id: defaultValues?.job_id || "",
      hire_date: defaultValues?.hire_date ? new Date(defaultValues.hire_date) : undefined,
      salary: defaultValues?.salary as { type: string; amount: number }[] | undefined,
      status: (["active", "inactive", "on_leave", "terminated"].includes(
        (defaultValues?.status || "") as string,
      )
        ? defaultValues?.status
        : "active") as "active" | "inactive" | "on_leave" | "terminated",
      notes: getNotesValue(defaultValues) || "",
      nationality: defaultValues?.nationality || "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      // Map status to allowed union type for reset
      const mappedStatus = ["active", "inactive", "on_leave", "terminated"].includes(
        (defaultValues.status || "") as string,
      )
        ? defaultValues.status
        : "active";
      form.reset({
        ...defaultValues,
        status: mappedStatus as "active" | "inactive" | "on_leave" | "terminated",
        hire_date: defaultValues.hire_date ? new Date(defaultValues.hire_date) : undefined,
        job_id: defaultValues.job_id || "",
        phone: defaultValues.phone || "",
        salary:
          (defaultValues.salary as { type: string; amount: number }[] | undefined) || undefined,
        notes: getNotesValue(defaultValues) || "",
        nationality: defaultValues.nationality || "",
      });
    } else {
      // Optionally reset to empty if defaultValues becomes null (e.g., switching modes)
      // form.reset(mapDataToFormDefaults(null));
    }
  }, [defaultValues, form.reset]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salary",
  });

  const salaryComponents = form.watch("salary");
  const totalSalary =
    salaryComponents?.reduce((sum, comp) => sum + (Number(comp.amount) || 0), 0) || 0;

  const handleSubmit = async (data: z.input<ReturnType<typeof createEmployeeFormSchema>>) => {
    setIsEmployeeSaving(true);
    // Log dirtyFields for debugging
    // console.log("Form dirtyFields:", form.formState.dirtyFields);
    // console.log("Form isDirty:", form.formState.isDirty);

    // Explicitly check if any field has been marked as dirty
    const isActuallyDirty = Object.keys(form.formState.dirtyFields).length > 0;
    // console.log("Is Actually Dirty (based on dirtyFields object):", isActuallyDirty);

    // Check if editing and if the form is actually dirty based on the dirtyFields object
    if (editMode && !isActuallyDirty) {
      // console.log("Form not dirty (based on dirtyFields), closing without saving.");
      // If nothing changed, just close the form without an API call or toast
      onSuccess?.();
      return;
    }

    const submitData = {
      ...data,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      hire_date: data.hire_date ? data.hire_date.toISOString().split("T")[0] : undefined,
      notes: data.notes,
      salary: (data.salary || []).map((comp) => ({
        ...comp,
        amount: Number(comp.amount) || 0,
      })),
    };

    const finalSubmitData = submitData;

    try {
      if (editMode) {
        await updateEmployeeMutate({
          id: actualEmployeeId!,
          updates: { ...finalSubmitData },
        });
        onSuccess?.();
      } else {
        const { membership, user } = useUserStore.getState();
        await createEmployeeMutate({
          ...finalSubmitData,
          enterprise_id: membership?.enterprise_id || "",
          user_id: user?.id || "",
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Employee form error:", error);
      const errorDescription = editMode ? t("Employees.error.update") : t("Employees.error.create");
      toast.error(t("General.error_operation"), {
        description: errorDescription,
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).employeeForm = form;
  }

  const departmentOptions =
    departments?.map((department) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const jobOptions =
    jobs?.map((job) => ({
      label: job.title,
      value: job.id,
      occupied_positions: job.occupied_positions,
      total_positions: job.total_positions,
      department: job.department,
    })) || [];

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.first_name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.first_name.placeholder")}
                        disabled={isEmployeeSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.last_name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.last_name.placeholder")}
                        disabled={isEmployeeSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.email.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Employees.form.email.placeholder")}
                        disabled={isEmployeeSaving}
                        type="email"
                        dir="ltr"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.phone.label")}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        disabled={isEmployeeSaving}
                        {...field}
                        value={field.value ?? ""}
                        ariaInvalid={form.formState.errors.phone !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.job.label")} *</FormLabel>
                    <FormControl>
                      <ComboboxAdd
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={jobOptions}
                        defaultValue={field.value ?? undefined}
                        onChange={field.onChange}
                        isLoading={jobsLoading}
                        disabled={isEmployeeSaving}
                        texts={{
                          placeholder: t("Employees.form.job.placeholder"),
                          searchPlaceholder: t("Pages.Jobs.search"),
                          noItems: t("Pages.Jobs.no_jobs_found"),
                        }}
                        addText={t("Pages.Jobs.add")}
                        onAddClick={() => setIsJobDialogOpen(true)}
                        renderOption={(option) => (
                          <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-gray-500">{option.department}</span>
                            </div>
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger>
                                <span className="text-xs text-gray-500">
                                  {option.occupied_positions} / {option.total_positions}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("Jobs.form.occupied_positions.label") +
                                  " / " +
                                  t("Jobs.form.total_positions.label")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Employees.form.hire_date.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        placeholder={t("Employees.form.hire_date.placeholder")}
                        date={field.value}
                        onSelect={field.onChange}
                        disabled={isEmployeeSaving}
                        ariaInvalid={form.formState.errors.hire_date !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.nationality.label")} *</FormLabel>
                    <FormControl>
                      <CountryInput
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={isEmployeeSaving}
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        labelKey={locale === "ar" ? "arabic_label" : "label"}
                        texts={{
                          placeholder: t("Employees.form.nationality.placeholder"),
                          searchPlaceholder: t("Forms.country.search_placeholder"),
                          noItems: t("Forms.country.no_items"),
                        }}
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
                    <FormLabel>{t("Employees.form.status.label")} *</FormLabel>
                    <Select
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEmployeeSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Employees.form.status.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">{t("Employees.form.status.active")}</SelectItem>
                        <SelectItem value="inactive">
                          {t("Employees.form.status.inactive")}
                        </SelectItem>
                        <SelectItem value="on_leave">
                          {t("Employees.form.status.on_leave")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormSectionHeader
            title={t("Employees.salary_section_title")}
            onCreate={() => append({ type: "", amount: 0 })}
            onCreateText={t("Employees.form.salary.add_component")}
            onCreateDisabled={isEmployeeSaving}
            isError={false}
            inDialog={editMode || nestedForm}
          />

          <div className="form-container">
            <FormLabel>{t("Employees.form.salary.label")}</FormLabel>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`salary.${index}.type`}
                  render={({ field: typeField }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">
                        {t("Employees.form.salary.type_label")}
                      </FormLabel>
                      <Select
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        onValueChange={typeField.onChange}
                        defaultValue={typeField.value}
                        disabled={isEmployeeSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("Employees.form.salary.type_placeholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SALARY_COMPONENT_TYPES.map((typeOpt) => (
                            <SelectItem key={typeOpt.value} value={typeOpt.value}>
                              {t(`Employees.salary_types.${typeOpt.value}`, {
                                defaultValue: typeOpt.label,
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`salary.${index}.amount`}
                  render={({ field: amountField }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">
                        {t("Employees.form.salary.amount_label")}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          placeholder={t("Employees.form.salary.amount_placeholder")}
                          disabled={isEmployeeSaving}
                          {...amountField}
                          showCommas={true}
                          value={
                            amountField.value ? parseFloat(String(amountField.value)) : undefined
                          }
                          onChange={(value) => amountField.onChange(value?.toString() || "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-9"
                  onClick={() => remove(index)}
                  disabled={isEmployeeSaving}
                  aria-label={t("General.remove")}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="mt-4 text-end font-medium">
              {t("Employees.form.salary.total")}: {MoneyFormatter(totalSalary)}
            </div>
          </div>

          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Employees.form.notes.label")}
          />
        </form>
      </Form>

      <FormDialog
        open={isJobDialogOpen}
        onOpenChange={setIsJobDialogOpen}
        title={t("Pages.Jobs.add")}
        formId="job-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isJobSaving}
      >
        <JobForm
          formHtmlId="job-form"
          onSuccess={() => {
            setIsJobDialogOpen(false);
          }}
        />
      </FormDialog>
      <FormDialog
        open={isDepartmentDialogOpen}
        onOpenChange={setIsDepartmentDialogOpen}
        title={t("Pages.Departments.add")}
        formId="department-form"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
        loadingSave={isDepartmentSaving}
      >
        <DepartmentForm
          formHtmlId="department-form"
          onSuccess={() => {
            setIsDepartmentDialogOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
