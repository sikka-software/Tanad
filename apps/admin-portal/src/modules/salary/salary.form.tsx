import { zodResolver } from "@hookform/resolvers/zod";
import NotesSection from "@root/src/components/forms/notes-section";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/ui/button";
import { ComboboxAdd } from "@/ui/combobox-add";
import { CurrencyInput } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { generateDummyEmployee } from "@/lib/dummy-factory";

import { ModuleFormProps } from "@/types/common.type";

import { EmployeeForm } from "@/employee/employee.form";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import { Employee } from "@/employee/employee.types";

import { useCreateSalary, useUpdateSalary } from "@/salary/salary.hooks";
import useSalaryStore from "@/salary/salary.store";

import { DEDUCTION_TYPES } from "./salary.options";
import { SalaryCreateData, SalaryUpdateData } from "./salary.type";

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

const createSalarySchema: (t: (key: string) => string) => z.ZodObject<any> = (t) =>
  z.object({
    employee_id: z.string().min(1, t("Salaries.form.employee_name.required")),
    pay_period_start: z.string().min(1, t("Salaries.form.pay_period_start.required")),
    pay_period_end: z.string().min(1, t("Salaries.form.pay_period_end.required")),
    payment_date: z.string().min(1, t("Salaries.form.payment_date.required")),
    gross_amount: z.coerce
      .number()
      .positive(t("Salaries.form.gross_amount.positive"))
      .or(z.literal(0)),
    net_amount: z.coerce.number().positive(t("Salaries.form.net_amount.positive")).or(z.literal(0)),
    deductions: z
      .array(createDeductionSchema(t))
      .transform((arr) => arr.filter((item) => item.type.trim() !== "" || item.amount !== 0))
      .default([]),
    notes: z.string().optional().nullable(),
  });

// This type will have numbers for amounts due to the .transform()
export type SalaryFormValues = z.infer<ReturnType<typeof createSalarySchema>>;

export function SalaryForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<SalaryUpdateData | SalaryCreateData>) {
  const t = useTranslations();
  const locale = useLocale();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const salarySchema = createSalarySchema(t);
  const setLoading = useSalaryStore((state) => state.setIsLoading);
  const loading = useSalaryStore((state) => state.isLoading);
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
    resolver: zodResolver(salarySchema),
    mode: "onChange",
    defaultValues: {
      employee_id: "",
      pay_period_start: "",
      pay_period_end: "",
      payment_date: "",
      net_amount: 0, // Default as number
      deductions: parseDeductions(defaultValues?.deductions),
      notes: defaultValues?.notes || "",
    },
  });

  // Use useFieldArray for deductions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  // Format employees for ComboboxAdd
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const handleSubmit: (data: SalaryFormValues) => Promise<void> = async (data) => {
    setLoading(true);
    try {
      // Revert to stringifying; pass undefined if empty to match expected type signature
      const deductionsPayload =
        data.deductions && data.deductions.length > 0 ? JSON.stringify(data.deductions) : undefined;

      // TODO: Replace these with actual values from context/store as needed
      const enterprise_id = defaultValues?.enterprise_id || "";
      const user_id = defaultValues?.user_id || "";
      const amount = data.net_amount;
      const start_date = data.pay_period_start;
      const end_date = data.pay_period_end;
      const created_at = defaultValues?.created_at || undefined;
      const currency = defaultValues?.currency || undefined;
      const payment_date = data.payment_date;
      const notes = data.notes?.trim() || undefined;

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

  if (typeof window !== "undefined") {
    (window as any).salaryForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={formHtmlId || "salary-form"} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Salaries.form.employee_name.label")} *</FormLabel>
                  <FormControl>
                    <ComboboxAdd
                      direction={locale === "ar" ? "rtl" : "ltr"}
                      data={employeeOptions}
                      isLoading={employeesLoading}
                      defaultValue={field.value}
                      onChange={(value) => {
                        field.onChange(value || null);

                        const selectedEmployee = employees.find(
                          (emp: Employee) => `${emp.first_name} ${emp.last_name}` === value,
                        );

                        if (selectedEmployee && selectedEmployee.salary) {
                          const totalSalary = (
                            selectedEmployee.salary as { amount: number }[]
                          ).reduce(
                            (sum: number, component: { amount: number }) =>
                              sum + (component.amount || 0),
                            0,
                          );
                          form.setValue("gross_amount", totalSalary);
                        } else {
                          form.setValue("gross_amount", 0);
                        }
                      }}
                      texts={{
                        placeholder: t("Salaries.form.employee_name.placeholder"),
                        searchPlaceholder: t("Employees.search_employees"),
                        noItems: t("Salaries.form.employee_name.no_employees"),
                      }}
                      addText={t("Employees.add_new")}
                      onAddClick={() => setIsEmployeeDialogOpen(true)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pay Period Dates */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pay_period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Salaries.form.pay_period_start.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Ensure we're working with the local date
                            const localDate = new Date(
                              (date as Date).getTime() - (date as Date).getTimezoneOffset() * 60000,
                            );
                            field.onChange(localDate.toISOString().split("T")[0]);
                          } else {
                            field.onChange("");
                          }
                        }}
                        placeholder={t("Salaries.form.pay_period_start.placeholder")}
                        ariaInvalid={form.formState.errors.pay_period_start !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pay_period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Salaries.form.pay_period_end.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Ensure we're working with the local date
                            const localDate = new Date(
                              (date as Date).getTime() - (date as Date).getTimezoneOffset() * 60000,
                            );
                            field.onChange(localDate.toISOString().split("T")[0]);
                          } else {
                            field.onChange("");
                          }
                        }}
                        placeholder={t("Salaries.form.pay_period_end.placeholder")}
                        ariaInvalid={form.formState.errors.pay_period_end !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Date */}
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Salaries.form.payment_date.label")} *</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Ensure we're working with the local date
                          const localDate = new Date(
                            (date as Date).getTime() - (date as Date).getTimezoneOffset() * 60000,
                          );
                          field.onChange(localDate.toISOString().split("T")[0]);
                        } else {
                          field.onChange("");
                        }
                      }}
                      placeholder={t("Salaries.form.payment_date.placeholder")}
                      ariaInvalid={form.formState.errors.payment_date !== undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amounts */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gross_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Salaries.form.gross_amount.label")} *</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        showCommas={true}
                        value={field.value ? parseFloat(String(field.value)) : undefined}
                        onChange={(value) => field.onChange(value?.toString() || "")}
                        placeholder={t("Salaries.form.gross_amount.placeholder")}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="net_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Salaries.form.net_amount.label")} *</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        showCommas={true}
                        value={field.value ? parseFloat(String(field.value)) : undefined}
                        onChange={(value) => field.onChange(value?.toString() || "")}
                        placeholder={t("Salaries.form.net_amount.placeholder")}
                        disabled={loading}
                      />
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
                                amountField.value
                                  ? parseFloat(String(amountField.value))
                                  : undefined
                              }
                              onChange={(value) => amountField.onChange(value?.toString() || "")}
                              placeholder={t("Salaries.form.deduction_amount.placeholder")}
                              disabled={loading}
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
                            disabled={loading}
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
                      disabled={loading}
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
                  disabled={loading}
                >
                  {t("Salaries.form.deductions.add")}
                </Button>
              </div>
            </div>
          </div>
          <NotesSection control={form.control} title={t("Salaries.form.notes.label")} />
        </form>
      </Form>

      <FormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        title={t("Employees.add_new")}
        formId="employee-form"
        loadingSave={isEmployeeSaving}
        dummyData={() => process.env.NODE_ENV === "development" && generateDummyEmployee()}
      >
        <EmployeeForm
          formHtmlId="employee-form"
          onSuccess={() => {
            setIsEmployeeSaving(false);
            setIsEmployeeDialogOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
