import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/ui/textarea";

import { generateDummyEmployee } from "@/lib/dummy-factory";

import { EmployeeForm } from "@/employee/employee.form";
import { useEmployees } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";

import { useCreateSalary, useUpdateSalary } from "@/salary/salary.hooks";
import useSalaryStore from "@/salary/salary.store";

import useUserStore from "@/stores/use-user-store";

import { DEDUCTION_TYPES } from "./salary.options";

const deductionSchema = z.object({
  type: z.string().min(1, "Type is required"),
  amount: z.coerce.number().positive("Amount must be positive").or(z.literal(0)),
});

const createSalarySchema = (t: (key: string) => string) =>
  z.object({
    employee_name: z.string().min(1, t("Salaries.form.employee_name.required")),
    pay_period_start: z.string().min(1, t("Salaries.form.pay_period_start.required")),
    pay_period_end: z.string().min(1, t("Salaries.form.pay_period_end.required")),
    payment_date: z.string().min(1, t("Salaries.form.payment_date.required")),
    gross_amount: z.coerce
      .number()
      .positive(t("Salaries.form.gross_amount.positive"))
      .or(z.literal(0)),
    net_amount: z.coerce.number().positive(t("Salaries.form.net_amount.positive")).or(z.literal(0)),
    deductions: z.array(deductionSchema).optional(),
    notes: z.string().optional(),
  });

// This type will have numbers for amounts due to the .transform()
export type SalaryFormValues = z.infer<ReturnType<typeof createSalarySchema>>;

interface SalaryFormProps {
  id?: string;
  loading?: boolean;
  onSuccess?: () => void;
  defaultValues?: SalaryFormValues | null;
  editMode?: boolean;
}

export function SalaryForm({ id, onSuccess, defaultValues, editMode }: SalaryFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useUserStore();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const setIsEmployeeSaving = useEmployeeStore((state) => state.setIsLoading);
  const isEmployeeSaving = useEmployeeStore((state) => state.isLoading);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const salarySchema = createSalarySchema(t);
  const setLoading = useSalaryStore((state) => state.setIsLoading);
  const loading = useSalaryStore((state) => state.isLoading);
  const { mutate: createSalary } = useCreateSalary();
  const { mutate: updateSalary } = useUpdateSalary();

  // Use SalaryFormValues directly with useForm
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employee_name: "",
      pay_period_start: "",
      pay_period_end: "",
      payment_date: "",
      gross_amount: 0, // Default as number
      net_amount: 0, // Default as number
      deductions: defaultValues?.deductions || [],
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
    value: `${emp.first_name} ${emp.last_name}`,
  }));

  const handleSubmit = async (data: SalaryFormValues) => {
    setLoading(true);
    try {
      // Revert to stringifying; pass undefined if empty to match expected type signature
      const deductionsPayload =
        data.deductions && data.deductions.length > 0 ? JSON.stringify(data.deductions) : undefined;

      if (editMode) {
        await updateSalary({
          id: id!,
          data: {
            ...data,
            deductions: deductionsPayload ? JSON.parse(deductionsPayload) : undefined,
            notes: data.notes?.trim() || undefined,
            user_id: user?.id,
          },
        });
      } else {
        await createSalary({
          ...data,
          deductions: deductionsPayload ? JSON.parse(deductionsPayload) : undefined,
          notes: data.notes?.trim() || undefined,
          user_id: user?.id,
        });

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
        <form id={id} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="employee_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Salaries.form.employee_name.label")} *</FormLabel>
                <FormControl>
                  <ComboboxAdd
                    direction={locale === "ar" ? "rtl" : "ltr"}
                    data={employeeOptions}
                    isLoading={employeesLoading}
                    defaultValue={field.value}
                    onChange={(value) => field.onChange(value || null)}
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
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          );
                          field.onChange(localDate.toISOString().split("T")[0]);
                        } else {
                          field.onChange("");
                        }
                      }}
                      placeholder={t("Salaries.form.pay_period_start.placeholder")}
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
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          );
                          field.onChange(localDate.toISOString().split("T")[0]);
                        } else {
                          field.onChange("");
                        }
                      }}
                      placeholder={t("Salaries.form.pay_period_end.placeholder")}
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
                          date.getTime() - date.getTimezoneOffset() * 60000,
                        );
                        field.onChange(localDate.toISOString().split("T")[0]);
                      } else {
                        field.onChange("");
                      }
                    }}
                    placeholder={t("Salaries.form.payment_date.placeholder")}
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
                      <FormItem className="w-full flex-grow max-w-1/2">
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
                      <FormItem className="w-full flex-grow max-w-1/2">
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
                    className="min-w-10 h-10"
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

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Salaries.form.notes.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Salaries.form.notes.placeholder")}
                    {...field}
                    value={field.value ?? ""}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          id="employee-form"
          onSuccess={() => {
            setIsEmployeeSaving(false);
            setIsEmployeeDialogOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
