import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { createInsertSchema } from "drizzle-zod";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import CountryInput from "@/ui/inputs/country-input";
import { DateInput } from "@/ui/inputs/date-input";
import DigitsInput from "@/ui/inputs/digits-input";
import { Input } from "@/ui/inputs/input";
import PhoneInput from "@/ui/inputs/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { createClient } from "@/utils/supabase/component";

import NotesSection from "@/components/forms/notes-section";
import SalaryFormSection from "@/components/forms/salary-form-section";

import { addressSchema } from "@/lib/schemas/address.schema";
import { metadataSchema } from "@/lib/schemas/metadata.schema";
import { getNotesValue } from "@/lib/utils";
import { validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { useCreateEmployee } from "@/employee/employee.hooks";
import { useUpdateEmployee } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import {
  EmployeeStatus,
  type EmployeeCreateData,
  type EmployeeUpdateData,
} from "@/employee/employee.types";

import DepartmentForm from "@/department/department.form";
import useDepartmentStore from "@/department/department.store";

import JobCombobox from "@/job/job.combobox";
import { useJobs } from "@/job/job.hooks";
import useJobStore from "@/job/job.store";

import { employees } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

export const createEmployeeFormSchema = (t: (key: string) => string) => {
  const EmployeeSelectSchema = createInsertSchema(employees, {
    first_name: z
      .string({ required_error: t("Employees.form.first_name.required") })
      .min(1, t("Employees.form.first_name.required")),
    last_name: z
      .string({ required_error: t("Employees.form.last_name.required") })
      .min(1, t("Employees.form.last_name.required")),
    email: z
      .string({ required_error: t("Employees.form.email.required") })
      .email(t("Employees.form.email.invalid")),
    phone: z.string().optional(),
    job_id: z.string().min(1, t("Employees.form.job.required")),

    salary: z.array(
      z.object({
        type: z.string().min(1, t("Employees.form.salary.type_required")),
        amount: z
          .string({ required_error: t("Employees.form.salary.amount_required") })
          .refine((value) => value.trim() !== "", {
            message: t("Employees.form.salary.amount_required"),
          })
          .transform((value) => parseFloat(value))
          .refine((value) => !isNaN(value), {
            message: t("Employees.form.salary.amount_invalid_type"),
          })
          .refine((value) => value >= 0, {
            message: t("Employees.form.salary.amount_min_value"),
          }),
      }),
    ),
    status: z.enum(EmployeeStatus),
    nationality: z.string().optional(),
    hire_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Employees.form.hire_date.invalid")),
    birth_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Employees.form.birth_date.invalid")),
    termination_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Employees.form.termination_date.invalid")),
    national_id: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9]+$/.test(val), {
        message: t("Employees.form.national_id.invalid"),
      })
      .refine((val) => !val || val.length === 10, {
        message: t("Employees.form.national_id.exact_length"),
      }),
    eqama_id: z.string().optional(),
    gender: z.string().optional(),
    marital_status: z.string().optional(),
    education_level: z.string().optional(),
    employee_number: z.string().optional(),
    onboarding_status: z.string().optional(),
    offboarding_status: z.string().optional(),
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

export function EmployeeForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<EmployeeUpdateData | EmployeeCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const isDepartmentSaving = useDepartmentStore((state) => state.isLoading);
  const setIsDepartmentSaving = useDepartmentStore((state) => state.setIsLoading);

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const { data: jobs, isLoading: isFetchingJobs } = useJobs();
  const isJobSaving = useJobStore((state) => state.isLoading);

  const { mutateAsync: updateEmployeeMutate } = useUpdateEmployee();
  const { mutateAsync: createEmployeeMutate } = useCreateEmployee();

  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);

  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const actualEmployeeId = editMode ? defaultValues?.id : undefined;
  const initialEmail = editMode ? defaultValues?.email : undefined;

  const creatingNewStandalone = !editMode && !nestedForm;

  const formSchema = createEmployeeFormSchema(t);
  type EmployeeFormInput = z.input<typeof formSchema>;
  type EmployeeFormOutput = z.output<typeof formSchema>;

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(formSchema, undefined, { raw: true }),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
      status: defaultValues?.status || "active",
      job_id: defaultValues?.job_id || "",
      phone: defaultValues?.phone || "",
      salary: creatingNewStandalone
        ? defaultValues?.salary && (defaultValues.salary as any[]).length > 0
          ? (defaultValues.salary as { type: string; amount: number | string }[]).map((s) => ({
              ...s,
              amount: String(s.amount),
            }))
          : [{ type: "base", amount: "0" }]
        : (defaultValues?.salary as { type: string; amount: number | string }[] | undefined)?.map(
            (s) => ({ ...s, amount: String(s.amount) }),
          ) || undefined,
      notes: getNotesValue(defaultValues) || "",
      nationality: defaultValues?.nationality || "",
      hire_date: defaultValues?.hire_date ? parseDate(defaultValues.hire_date) : undefined,
      birth_date: defaultValues?.birth_date ? parseDate(defaultValues.birth_date) : undefined,
      termination_date: defaultValues?.termination_date
        ? parseDate(defaultValues.termination_date)
        : undefined,
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

  const [email, setEmail] = useState(defaultValues?.email || "");
  const [debouncedEmail] = useDebounce(email, 500);

  useEffect(() => {
    if (!debouncedEmail) {
      setIsEmailLoading(false);
      return;
    }
    if (actualEmployeeId && debouncedEmail === initialEmail) {
      setIsEmailLoading(false);
      return;
    }
    let cancelled = false;
    setIsEmailLoading(true);
    const supabase = createClient();
    supabase
      .from("employees")
      .select("id", { count: "exact" })
      .eq("email", debouncedEmail)
      .then(({ error, count }) => {
        console.log("count", count);
        if (!cancelled) {
          if (count && count > 0) {
            form.setError("email", {
              message: t("Employees.form.email.duplicate"),
            });
          }
          setIsEmailLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedEmail, actualEmployeeId, initialEmail, user?.id]);

  const handleSubmit = async (data: EmployeeFormInput) => {
    setIsEmployeeSaving(true);
    let submissionData: EmployeeFormOutput;
    try {
      submissionData = formSchema.parse(data);
    } catch (validationError) {
      console.error("Zod parsing error after RHF validation:", validationError);
      toast.error(t("General.error_invalid_data"));
      setIsEmployeeSaving(false);
      return;
    }

    const isActuallyDirty = Object.keys(form.formState.dirtyFields).length > 0;
    if (editMode && !isActuallyDirty) {
      onSuccess?.();
      return;
    }
    try {
      if (editMode) {
        await updateEmployeeMutate({
          id: actualEmployeeId!,
          data: {
            ...submissionData,
            first_name: submissionData.first_name.trim(),
            last_name: submissionData.last_name.trim(),
            email: submissionData.email.trim(),
            phone: submissionData.phone?.trim() || undefined,
            termination_date:
              submissionData.termination_date &&
              typeof submissionData.termination_date.toString === "function"
                ? submissionData.termination_date.toString()
                : undefined,
            hire_date: submissionData.hire_date.toString(),
            birth_date:
              submissionData.birth_date && typeof submissionData.birth_date.toString === "function"
                ? submissionData.birth_date.toString()
                : undefined,
            notes: submissionData.notes,
            salary: (submissionData.salary || []).map((comp) => ({
              ...comp,
              amount: comp.amount,
            })),
          },
        });
        onSuccess?.();
      } else {
        const { membership, user } = useUserStore.getState();
        await createEmployeeMutate({
          ...submissionData,
          user_id: user?.id || "",
          enterprise_id: membership?.enterprise_id || "",
          termination_date:
            submissionData.termination_date &&
            typeof submissionData.termination_date.toString === "function"
              ? submissionData.termination_date.toString()
              : undefined,
          birth_date:
            submissionData.birth_date && typeof submissionData.birth_date.toString === "function"
              ? submissionData.birth_date.toString()
              : undefined,
          hire_date:
            submissionData.hire_date && typeof submissionData.hire_date.toString === "function"
              ? submissionData.hire_date.toString()
              : undefined,
          first_name: submissionData.first_name.trim(),
          last_name: submissionData.last_name.trim(),
          email: submissionData.email.trim(),
          phone: submissionData.phone?.trim() || undefined,
          notes: submissionData.notes,
          salary: (submissionData.salary || []).map((comp) => ({
            ...comp,
            amount: comp.amount,
          })),
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

  return (
    <>
      <Form {...form}>
        <form
          id={formHtmlId || "employee-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("form data is ", form.getValues());
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
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
                      <div className="relative">
                        <Input
                          placeholder={t("Employees.form.email.placeholder")}
                          disabled={isEmployeeSaving}
                          type="email"
                          dir="ltr"
                          {...field}
                          value={email}
                          onChange={(e) => {
                            field.onChange(e);
                            setEmail(e.target.value);
                          }}
                          aria-invalid={!!form.formState.errors.email}
                        />
                        {isEmailLoading && (
                          <div className="absolute top-0 right-3 bottom-0 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
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
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isEmployeeSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <JobCombobox
                formName="job_id"
                label={t("Employees.form.job.label")}
                control={form.control}
                jobs={jobs || []}
                loadingCombobox={isFetchingJobs}
                isSaving={isJobSaving}
                isDialogOpen={isJobDialogOpen}
                setIsDialogOpen={setIsJobDialogOpen}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("Employees.form.hire_date.label")} *</FormLabel>
                    <FormControl>
                      <DateInput
                        placeholder={t("Employees.form.hire_date.placeholder")}
                        value={field.value ?? null}
                        onChange={field.onChange}
                        onSelect={(e) => field.onChange(e)}
                        disabled={isEmployeeSaving}
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
                        value={field.value ?? null}
                        onChange={field.onChange}
                        onSelect={(e) => field.onChange(e)}
                        disabled={isEmployeeSaving}
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
                      onValueChange={(val) => field.onChange(val)}
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

          <SalaryFormSection
            control={form.control}
            fields={fields}
            append={append}
            remove={remove}
            isSaving={isEmployeeSaving}
            inDialog={editMode || nestedForm}
          />

          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Employees.form.notes.label")}
          />
        </form>
      </Form>

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
            setIsDepartmentSaving(false);
          }}
        />
      </FormDialog>
    </>
  );
}
