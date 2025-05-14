import { zodResolver } from "@hookform/resolvers/zod";
import { createSelectSchema } from "drizzle-zod";
import { Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import CountryInput from "@/ui/country-input";
import { CurrencyInput, MoneyFormatter } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import DigitsInput from "@/ui/digits-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import PhoneInput from "@/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import { createClient } from "@/utils/supabase/component";

import FormSectionHeader from "@/components/forms/form-section-header";
import NotesSection from "@/components/forms/notes-section";
import { DateInput } from "@/components/ui/date-input";

import { addressSchema } from "@/lib/schemas/address.schema";
import { metadataSchema } from "@/lib/schemas/metadata.schema";
import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import JobForm from "@/job/job.form";
import { useJobs } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";

import DepartmentForm from "@/department/department.form";
import { useDepartments } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";

import { useCreateEmployee } from "@/employee/employee.hooks";
import { useUpdateEmployee } from "@/employee/employee.hooks";
import { SALARY_COMPONENT_TYPES } from "@/employee/employee.options";
import useEmployeeStore from "@/employee/employee.store";
import {
  EmployeeStatus,
  EmployeeStatusProps,
  type EmployeeCreateData,
  type EmployeeUpdateData,
} from "@/employee/employee.types";

import { employees } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

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
    const EmployeeSelectSchema = createSelectSchema(employees, {
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
      status: z.enum(EmployeeStatus),
      nationality: z.string().optional(),
      birth_date: z.date().optional(),
      national_id: z.string().optional(),
      eqama_id: z.string().optional(),
      gender: z.string().optional(),
      marital_status: z.string().optional(),
      education_level: z.string().optional(),
      employee_number: z.string().optional(),
      onboarding_status: z.string().optional(),
      offboarding_status: z.string().optional(),
      termination_date: z.date().optional(),
      emergency_contact: z
        .object({
          name: z.string().optional(),
          phone: z.string().optional(),
          relationship: z.string().optional(),
        })
        .optional(),
      notes: z.any().optional().nullable(),
      ...addressSchema,
      ...metadataSchema,
    });

    return EmployeeSelectSchema;
  };

  const form = useForm<z.input<ReturnType<typeof createEmployeeFormSchema>>>({
    resolver: zodResolver(createEmployeeFormSchema()),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      created_at: defaultValues?.created_at || undefined,
      updated_at: defaultValues?.updated_at || undefined,
      user_id: defaultValues?.user_id || undefined,
      enterprise_id: defaultValues?.enterprise_id || undefined,
      id: defaultValues?.id || undefined,
      status: defaultValues?.status || "active",
      hire_date: defaultValues?.hire_date ? new Date(defaultValues.hire_date) : undefined,
      job_id: defaultValues?.job_id || "",
      phone: defaultValues?.phone || "",
      salary:
        (defaultValues?.salary as { type: string; amount: number }[] | undefined) || undefined,
      notes: getNotesValue(defaultValues) || "",
      nationality: defaultValues?.nationality || "",
      birth_date: defaultValues?.birth_date ? new Date(defaultValues.birth_date) : undefined,
      national_id: defaultValues?.national_id || "",
      eqama_id: defaultValues?.eqama_id || "",
      gender: defaultValues?.gender || "male",
      short_address: defaultValues?.short_address || "",
      additional_number: defaultValues?.additional_number || "",
      street_name: defaultValues?.street_name || "",
      building_number: defaultValues?.building_number || "",
      city: defaultValues?.city || "",
      region: defaultValues?.region || "",
      country: defaultValues?.country || "",
      zip_code: defaultValues?.zip_code || "",
      marital_status: defaultValues?.marital_status || "single",
      education_level: defaultValues?.education_level || "",
      employee_number: defaultValues?.employee_number || "",
      onboarding_status: defaultValues?.onboarding_status || "",
      offboarding_status: defaultValues?.offboarding_status || "",
      emergency_contact:
        typeof defaultValues?.emergency_contact === "object" &&
        defaultValues?.emergency_contact !== null &&
        !Array.isArray(defaultValues?.emergency_contact)
          ? defaultValues.emergency_contact
          : undefined,
    },
  });

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
    try {
      if (editMode) {
        await updateEmployeeMutate({
          id: actualEmployeeId!,
          data: {
            ...data,
            termination_date: data.termination_date
              ? data.termination_date.toISOString().split("T")[0]
              : undefined,
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || undefined,
            hire_date: data.hire_date ? data.hire_date.toISOString().split("T")[0] : undefined,
            birth_date: data.birth_date ? data.birth_date.toISOString().split("T")[0] : undefined,
            notes: data.notes,
            salary: (data.salary || []).map((comp) => ({
              ...comp,
              amount: Number(comp.amount) || 0,
            })),
          },
        });
        onSuccess?.();
      } else {
        const { membership, user } = useUserStore.getState();
        await createEmployeeMutate({
          ...data,
          termination_date: data.termination_date
            ? data.termination_date.toISOString().split("T")[0]
            : undefined,
          birth_date: data.birth_date ? data.birth_date.toISOString().split("T")[0] : undefined,
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
        <form
          id={formHtmlId}
          onSubmit={(e) => {
            e.preventDefault();
            console.log("TODO");
            console.log("form erros ", form.formState.errors);
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <div className="form-container">
            <div className="form-fields-cols-2">
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
                        ariaInvalid={form.formState.errors.job_id !== undefined}
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
                    <FormLabel>{t("Employees.form.nationality.label")}</FormLabel>
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
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Employees.form.birth_date.label")}</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("Employees.form.birth_date.placeholder")}
                        date={field.value}
                        onSelect={field.onChange}
                        disabled={isEmployeeSaving}
                        ariaInvalid={form.formState.errors.birth_date !== undefined}
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
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Employees.form.status.placeholder")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {EmployeeStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`Employees.form.status.${status}`)}
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.gender.label")}</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Employees.form.gender.placeholder")} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {["male", "female"].map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`Employees.form.gender.${status}`)}
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
                name="onboarding_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.onboarding_status.label")}</FormLabel>
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                      }}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger onClear={() => field.onChange("")} value={field.value}>
                          <SelectValue
                            placeholder={t("Employees.form.onboarding_status.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {["pending", "completed"].map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`Employees.form.onboarding_status.${status}`)}
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
                name="offboarding_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.offboarding_status.label")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (val === field.value) {
                          field.onChange("");
                        } else {
                          field.onChange(val);
                        }
                      }}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <FormControl>
                        <SelectTrigger onClear={() => field.onChange("")} value={field.value}>
                          <SelectValue
                            placeholder={t("Employees.form.offboarding_status.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {["pending", "completed"].map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`Employees.form.offboarding_status.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="form-fields-cols-1">
              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.national_id.label")}</FormLabel>
                    <FormControl>
                      <DigitsInput maxLength={10} disabled={isEmployeeSaving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eqama_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Employees.form.eqama_id.label")}</FormLabel>
                    <FormControl>
                      <DigitsInput maxLength={10} disabled={isEmployeeSaving} {...field} />
                    </FormControl>
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
