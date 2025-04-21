import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { CurrencyInput } from "@/components/ui/currency-input";

import { generateDummyEmployee } from "@/lib/dummy-factory";

import { EmployeeForm } from "@/modules/employee/employee.form";
import { useEmployees } from "@/modules/employee/employee.hooks";
import useUserStore from "@/stores/use-user-store";

import useEmployeeStore from "../employee/employee.store";
import { useCreateSalary, useUpdateSalary } from "./salary.hooks";
import useSalaryStore from "./salary.store";

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
    deductions: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          try {
            JSON.parse(val);
            return true;
          } catch (e) {
            return false;
          }
        },
        { message: t("Salaries.form.deductions.invalid_json") },
      ),
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
      deductions: "",
      notes: "",
    },
  });

  // Format employees for ComboboxAdd
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: `${emp.first_name} ${emp.last_name}`,
  }));

  const handleSubmit = async (data: SalaryFormValues) => {
    setLoading(true);
    try {
      if (editMode) {
        await updateSalary({
          id: id!,
          data: {
            ...data,
            deductions: data.deductions ? JSON.parse(data.deductions) : null,
            notes: data.notes?.trim() || undefined,
            user_id: user?.id,
          },
        });
      } else {
        await createSalary({
          ...data,
          deductions: data.deductions ? JSON.parse(data.deductions) : null,
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

          {/* Deductions (JSON Textarea) */}
          <FormField
            control={form.control}
            name="deductions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Salaries.form.deductions.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Salaries.form.deductions.placeholder")}
                    {...field}
                    value={field.value ?? ""}
                    rows={5}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
