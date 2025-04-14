import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useUserStore from "@/hooks/use-user-store";
import { useEmployees } from "@/hooks/useEmployees";
import type { Salary } from "@/types/salary.type";

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
  salaryId?: string;
  onSuccess?: (salary: Salary) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  userId?: string | null;
}

export function SalaryForm({
  id,
  salaryId,
  onSuccess,
  loading: externalLoading = false,
  setLoading,
  userId,
}: SalaryFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;
  const { user } = useUserStore();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

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

  // Fetch salary data for editing
  useEffect(() => {
    if (salaryId) {
      setInternalLoading(true);
      fetch(`/api/salaries/${salaryId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch salary");
          return res.json();
        })
        .then((salary: Salary) => {
          // Reset with numbers for amounts
          form.reset({
            employee_name: salary.employee_name,
            pay_period_start: salary.pay_period_start?.split("T")[0] || "",
            pay_period_end: salary.pay_period_end?.split("T")[0] || "",
            payment_date: salary.payment_date?.split("T")[0] || "",
            gross_amount: salary.gross_amount ?? 0, // Reset with number
            net_amount: salary.net_amount ?? 0, // Reset with number
            deductions: salary.deductions ? JSON.stringify(salary.deductions, null, 2) : "",
            notes: salary.notes || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch salary:", error);
          toast.error(t("Salaries.error.title"), {
            description: t("Salaries.messages.error_fetch"),
          });
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [salaryId, form, t]);

  // Data is SalaryFormValues (numbers for amounts)
  const onSubmit: SubmitHandler<SalaryFormValues> = async (data) => {
    setInternalLoading(true);
    setLoading?.(true);
    if (!user?.id) {
      toast.error(t("Salaries.error.title"), {
        description: t("Salaries.messages.error_not_authenticated"),
      });
      setInternalLoading(false);
      setLoading?.(false);
      return;
    }

    try {
      // Use data directly (amounts are numbers)
      const salaryData = {
        ...data,
        deductions: data.deductions ? JSON.parse(data.deductions) : null,
        notes: data.notes?.trim() || null,
        userId: user.id,
      };

      let result: Salary;
      if (salaryId) {
        const response = await fetch(`/api/salaries/${salaryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salaryData),
        });
        if (!response.ok) throw new Error("Failed to update salary");
        result = await response.json();
        toast.success(t("Salaries.success.title"), {
          description: t("Salaries.messages.success_updated"),
        });
      } else {
        const response = await fetch("/api/salaries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salaryData),
        });
        if (!response.ok) throw new Error("Failed to create salary");
        result = await response.json();
        toast.success(t("Salaries.success.title"), {
          description: t("Salaries.messages.success_created"),
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push("/salaries");
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
    } finally {
      setInternalLoading(false);
      setLoading?.(false);
    }
  };

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Salaries.form.employee_name.label")} *</FormLabel>
              <FormControl>
                <Combobox
                  data={employees.map((emp) => ({
                    label: `${emp.firstName} ${emp.lastName}`,
                    value: `${emp.firstName} ${emp.lastName}`,
                  }))}
                  labelKey="label"
                  valueKey="value"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  isLoading={employeesLoading}
                  texts={{
                    placeholder: t("Salaries.form.employee_name.placeholder"),
                  }}
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
                      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
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
  );
}
