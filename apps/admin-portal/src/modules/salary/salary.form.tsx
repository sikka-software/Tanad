import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { createInsertSchema } from "drizzle-zod";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { DateInput } from "@/ui/inputs/date-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/forms/notes-section";

import { validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import { Employee } from "@/employee/employee.types";

import { useCreateSalary, useUpdateSalary } from "@/salary/salary.hooks";
import { DEDUCTION_TYPES } from "@/salary/salary.options";
import useSalaryStore from "@/salary/salary.store";
import { SalaryCreateData, SalaryUpdateData } from "@/salary/salary.type";

import { salaries } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

import EmployeeCombobox from "../employee/employee.combobox";

const createDeductionSchema = (t: (key: string) => string) =>
  z
    .object({
      type: z.string(),
      amount: z.coerce.number().or(z.literal(0)),
    })
    .superRefine((val, ctx) => {
      // If both are empty, it's valid (row will be filtered out)
      if ((!val.type || val.type.trim() === "") && (!val.amount || val.amount === 0)) {
        return;
      }
      // If type is filled but amount is empty/zero
      if (val.type && (!val.amount || val.amount === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("Salaries.form.deduction_amount.positive"),
          path: ["amount"],
        });
      }
      // If amount is filled but type is empty
      if (val.amount && val.amount !== 0 && (!val.type || val.type.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("Salaries.form.deduction_type.required"),
          path: ["type"],
        });
      }
    });

const createSalarySchema = (t: (key: string) => string) => {
  const SalarySelectSchema = createInsertSchema(salaries, {
    employee_id: z.string().min(1, t("Salaries.form.employee_name.required")),
    start_date: z
      .any()
      .refine((val) => val, {
        message: t("Salaries.form.pay_period_start.required"),
      })
      .superRefine(validateYearRange(t, 1800, 2200, "Salaries.form.pay_period_start.invalid")),
    end_date: z
      .any()
      .refine((val) => val, {
        message: t("Salaries.form.pay_period_end.required"),
      })
      .superRefine(validateYearRange(t, 1800, 2200, "Salaries.form.pay_period_end.invalid")),
    payment_date: z
      .any()
      .refine((val) => val, {
        message: t("Salaries.form.payment_date.required"),
      })
      .superRefine(validateYearRange(t, 1800, 2200, "Salaries.form.payment_date.invalid")),
    payment_frequency: z.string().min(1, t("Salaries.form.payment_frequency.required")),

    amount: z.coerce
      .number({
        message: t("Salaries.form.amount.required"),
      })
      .positive(t("Salaries.form.amount.positive")),
    deductions: z
      .array(createDeductionSchema(t))
      .transform((arr) => arr.filter((item) => item.type.trim() !== "" || item.amount !== 0))
      .default([]),
    notes: z.any().optional().nullable(),
  });
  return SalarySelectSchema;
};

// This type will have numbers for amounts due to the .transform()
export type SalaryFormValues = z.input<ReturnType<typeof createSalarySchema>>;

export function SalaryForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<SalaryUpdateData | SalaryCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const setLoadingSave = useSalaryStore((state) => state.setIsLoading);
  const loadingSave = useSalaryStore((state) => state.isLoading);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const { mutate: createSalary } = useCreateSalary();
  const { mutate: updateSalary } = useUpdateSalary();

  // Helper to ensure deductions is always an array of objects
  function parseDeductions(val: unknown): { type: string; amount: number }[] {
    if (!val) return [];
    if (Array.isArray(val)) return val as { type: string; amount: number }[];
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  }

  // Use SalaryFormValues directly with useForm
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(createSalarySchema(t)),
    mode: "onChange",
    defaultValues: {
      employee_id: defaultValues?.employee_id || "",
      start_date: defaultValues?.start_date ? new Date(defaultValues.start_date) : undefined,
      end_date: defaultValues?.end_date ? new Date(defaultValues.end_date) : undefined,
      payment_date: defaultValues?.payment_date ? new Date(defaultValues.payment_date) : undefined,
      payment_frequency: defaultValues?.payment_frequency || "",
      amount: defaultValues?.amount !== undefined ? defaultValues.amount : undefined,
      deductions: parseDeductions(defaultValues?.deductions),
      notes: defaultValues?.notes || "",
    },
  });

  // Use useFieldArray for deductions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  const handleSubmit: (data: SalaryFormValues) => Promise<void> = async (data) => {
    setLoadingSave(true);
    try {
      // Revert to stringifying; pass undefined if empty to match expected type signature
      const deductionsPayload =
        data.deductions && data.deductions.length > 0 ? JSON.stringify(data.deductions) : undefined;

      // Format dates as yyyy-mm-dd strings if they are Date objects
      const formatDate = (val: any) => {
        if (!val) return undefined;
        if (val instanceof Date) return val.toISOString().split("T")[0];
        if (typeof val === "string") return val;
        if (val && typeof val.toString === "function") return val.toString();
        return val;
      };

      // TODO: Replace these with actual values from context/store as needed
      const enterprise_id = defaultValues?.enterprise_id || "";
      const user_id = defaultValues?.user_id || "";
      const amount = data.amount;
      const start_date = formatDate(data.start_date);
      const end_date = formatDate(data.end_date);
      const created_at = defaultValues?.created_at || undefined;
      const currency = defaultValues?.currency || undefined;
      const payment_date = formatDate(data.payment_date);
      const notes = data.notes || undefined;

      const payload = {
        amount,
        enterprise_id,
        user_id,
        employee_id: data.employee_id,
        start_date,
        end_date,
        created_at,
        currency,
        payment_date,
        deductions: deductionsPayload ? JSON.parse(deductionsPayload) : undefined,
        notes,
      };

      if (editMode) {
        await updateSalary({
          id: defaultValues?.id || "",
          data: payload,
        });
      } else {
        await createSalary(payload);

        toast.success(t("General.successful_operation"), {
          description: t("Salaries.messages.success_created"),
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to save salary:", error);
      const description =
        error instanceof SyntaxError
          ? t("Salaries.form.deductions.invalid_json")
          : error instanceof Error
            ? error.message
            : t("Salaries.messages.error_save");
      toast.error(t("Salaries.error.title"), {
        description,
      });
    }
  };

  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        label: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      })),
    [employees],
  );

  if (typeof window !== "undefined") {
    (window as any).salaryForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "salary-form"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(handleSubmit)(e);
        }}
      >
        <input hidden type="text" value={user?.id} {...form.register("user_id")} />
        <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
        <div className="form-container">
          <div className="form-fields-cols-2">
            <EmployeeCombobox
              formName="employee_id"
              label={t("Salaries.form.employee_name.label")}
              control={form.control}
              employees={employees || []}
              loadingCombobox={employeesLoading}
              isSaving={isEmployeeSaving}
              isDialogOpen={isEmployeeDialogOpen}
              setIsDialogOpen={setIsEmployeeDialogOpen}
              onEmployeeSelected={(field, value) => {
                field.onChange(value || null);

                const selectedEmployee = employees.find(
                  (emp: Employee) => `${emp.first_name} ${emp.last_name}` === value,
                );

                if (selectedEmployee && selectedEmployee.salary) {
                  const totalSalary = (selectedEmployee.salary as { amount: number }[]).reduce(
                    (sum: number, component: { amount: number }) => sum + (component.amount || 0),
                    0,
                  );
                  form.setValue("amount", totalSalary);
                } else {
                  form.setValue("amount", 0);
                }
              }}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Salaries.form.amount.label")} *</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      showCommas={true}
                      value={
                        typeof field.value === "number" && !isNaN(field.value)
                          ? field.value
                          : undefined
                      }
                      onChange={(v) =>
                        field.onChange(v === undefined || v === null ? undefined : v)
                      }
                      placeholder={t("Salaries.form.amount.placeholder")}
                      disabled={loadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pay Period Dates */}
          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Salaries.form.pay_period_start.label")} *</FormLabel>
                  <FormControl>
                    <DateInput
                      placeholder={t("Salaries.form.pay_period_start.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={loadingSave}
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
                  <FormLabel>{t("Salaries.form.pay_period_end.label")} *</FormLabel>
                  <FormControl>
                    <DateInput
                      placeholder={t("Salaries.form.pay_period_end.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={loadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Payment Date */}
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Salaries.form.payment_date.label")} *</FormLabel>
                  <FormControl>
                    <DateInput
                      placeholder={t("Salaries.form.payment_date.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={loadingSave}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Salaries.form.payment_frequency.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingSave}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("Salaries.form.payment_frequency.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t("Salaries.form.payment_frequency.monthly")}
                        </SelectItem>
                        <SelectItem value="weekly">
                          {t("Salaries.form.payment_frequency.weekly")}
                        </SelectItem>
                        <SelectItem value="daily">
                          {t("Salaries.form.payment_frequency.daily")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Deductions (Dynamic Array) */}
          <div>
            <FormLabel>{t("Salaries.form.deductions.label")}</FormLabel>
            <div className="mt-2 space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  {/* Deduction Amount */}
                  <FormField
                    control={form.control}
                    name={`deductions.${index}.amount`}
                    render={({ field: amountField }) => (
                      <FormItem className="w-full max-w-1/2 flex-grow">
                        <FormLabel className="sr-only">
                          {t("Salaries.form.deduction_amount.label")}
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            showCommas={true}
                            value={
                              amountField.value ? parseFloat(String(amountField.value)) : undefined
                            }
                            onChange={(value) => amountField.onChange(value?.toString() || "")}
                            placeholder={t("Salaries.form.deduction_amount.placeholder")}
                            disabled={loadingSave}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Deduction Type */}
                  <FormField
                    control={form.control}
                    name={`deductions.${index}.type`}
                    render={({ field: typeField }) => (
                      <FormItem className="w-full max-w-1/2 flex-grow">
                        <FormLabel className="sr-only">
                          {t("Salaries.form.deduction_type.label")}
                        </FormLabel>
                        <Select
                          dir={locale === "ar" ? "rtl" : "ltr"}
                          onValueChange={typeField.onChange}
                          defaultValue={typeField.value}
                          disabled={loadingSave}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("Salaries.form.deduction_type.placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEDUCTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {/* Use label as fallback if translation missing */}
                                {t(`Salaries.form.deduction_type_options.${type.value}`) ||
                                  type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 min-w-10"
                    onClick={() => remove(index)}
                    disabled={loadingSave}
                    aria-label={t("Salaries.form.remove_deduction")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type: "", amount: 0 })}
                disabled={loadingSave}
              >
                {t("Salaries.form.deductions.add")}
              </Button>
            </div>
          </div>
        </div>
        <NotesSection
          inDialog={editMode}
          control={form.control}
          title={t("Salaries.form.notes.label")}
        />
      </form>
    </Form>
  );
}
