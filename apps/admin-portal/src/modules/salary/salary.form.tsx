import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ComboboxAdd } from "@/ui/combobox-add";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { FormDialog } from "@/ui/form-dialog";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { EmployeeForm, type EmployeeFormValues } from "@/modules/employee/employee.form";

import { generateDummyEmployee } from "@/lib/dummy-factory";

import type { Salary } from "@/modules/salary/salary.type";

import { employeeKeys, useEmployees } from "@/modules/employee.hooks";
import useUserStore from "@/stores/use-user-store";

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
  onSubmit: (data: SalaryFormValues) => void;
}

export function SalaryForm({ id, onSubmit, loading }: SalaryFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const { user } = useUserStore();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isEmployeeSaving, setIsEmployeeSaving] = useState(false);
  const { locale } = useRouter();
  const queryClient = useQueryClient();
  const salarySchema = createSalarySchema(t);

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

  const handleEmployeeSubmit = async (data: EmployeeFormValues) => {
    setIsEmployeeSaving(true);
    try {
      if (!user?.id) {
        throw new Error(t("error.not_authenticated"));
      }

      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null,
          position: data.position.trim(),
          department_id: data.department || null,
          hire_date: data.hire_date,
          salary: data.salary ? parseFloat(data.salary) : null,
          status: data.status,
          notes: data.notes?.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Employees.messages.error"));
      }

      // Get the new employee data
      const newEmployee = await response.json();

      // Update the employees cache to include the new employee
      const previousEmployees = queryClient.getQueryData(employeeKeys.lists()) || [];
      queryClient.setQueryData(employeeKeys.lists(), [
        ...(Array.isArray(previousEmployees) ? previousEmployees : []),
        newEmployee,
      ]);

      // Set the new employee as the selected employee
      const fullName = `${newEmployee.first_name} ${newEmployee.last_name}`;
      form.setValue("employee_name", fullName);

      // Close the dialog
      setIsEmployeeDialogOpen(false);

      // Show success message
      toast.success(t("General.successful_operation"), {
        description: t("Employees.success.created"),
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Employees.error.create"),
      });
    } finally {
      setIsEmployeeSaving(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).salaryForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("Salaries.form.gross_amount.placeholder")}
                      {...field}
                      disabled={loading}
                      onChange={(e) => field.onChange(e.target.value)} // Pass string value
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
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("Salaries.form.net_amount.placeholder")}
                      {...field}
                      disabled={loading}
                      onChange={(e) => field.onChange(e.target.value)} // Pass string value
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
        <EmployeeForm id="employee-form" onSubmit={handleEmployeeSubmit} />
      </FormDialog>
    </>
  );
}
