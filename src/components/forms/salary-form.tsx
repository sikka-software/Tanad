import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import type { Salary, SalaryCreateData } from "@/types/salary.type";
import { createSalary, fetchSalaryById, updateSalary } from "@/services/salaryService";
import { Button } from "@/components/ui/button";
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
// Assuming a DatePicker component exists, if not, use Input type="date"
// import { DatePicker } from "@/components/ui/date-picker";
// If using React JSON editor for deductions
// import { JsonEditor } from '@/components/ui/json-editor'; // Example path

// Zod schema using z.coerce.number()
const createSalarySchema = (t: (key: string) => string) =>
  z.object({
    employee_name: z.string().min(1, t("Salaries.form.employee_name.required")),
    pay_period_start: z.string().min(1, t("Salaries.form.pay_period_start.required")),
    pay_period_end: z.string().min(1, t("Salaries.form.pay_period_end.required")),
    payment_date: z.string().min(1, t("Salaries.form.payment_date.required")),
    gross_amount: z.coerce // Coerce input value to number
      .number()
      .positive(t("Salaries.form.gross_amount.positive"))
      .or(z.literal(0)), // Allow 0
    net_amount: z.coerce
      .number()
      .positive(t("Salaries.form.net_amount.positive"))
      .or(z.literal(0)), // Allow 0
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
        { message: t("Salaries.form.deductions.invalid_json") }
      ),
    notes: z.string().optional(),
  });

// This type will have numbers for amounts due to the .transform()
export type SalaryFormValues = z.infer<ReturnType<typeof createSalarySchema>>;

interface SalaryFormProps {
  formId?: string;
  salaryId?: string;
  onSuccess?: (salary: Salary) => void;
  loading?: boolean;
  userId: string | null;
}

export function SalaryForm({
  formId,
  salaryId,
  onSuccess,
  loading: externalLoading = false,
  userId,
}: SalaryFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

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
      fetchSalaryById(salaryId)
        .then((salary) => {
          // Reset with numbers for amounts
          form.reset({
            employee_name: salary.employee_name,
            pay_period_start: salary.pay_period_start?.split('T')[0] || "",
            pay_period_end: salary.pay_period_end?.split('T')[0] || "",
            payment_date: salary.payment_date?.split('T')[0] || "",
            gross_amount: salary.gross_amount ?? 0, // Reset with number
            net_amount: salary.net_amount ?? 0, // Reset with number
            deductions:
              salary.deductions ? JSON.stringify(salary.deductions, null, 2) : "",
            notes: salary.notes || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch salary:", error);
          toast.error(t("error.title"), {
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
    if (!userId) {
      toast.error(t("error.title"), {
        description: t("error.not_authenticated"),
      });
      setInternalLoading(false);
      return;
    }

    try {
      // Use data directly (amounts are numbers)
      const salaryData = {
        ...data,
        deductions: data.deductions ? JSON.parse(data.deductions) : null,
        notes: data.notes?.trim() || null,
        user_id: userId,
      };

      let result: Salary;
      if (salaryId) {
        const { user_id, ...updateData } = salaryData;
        result = await updateSalary(salaryId, updateData);
        toast.success(t("success.title"), {
          description: t("Salaries.messages.success_updated"),
        });
      } else {
        result = await createSalary(salaryData);
        toast.success(t("success.title"), {
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
      toast.error(t("error.title"), {
        description,
      });
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Employee Name */}
        <FormField
          control={form.control}
          name="employee_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Salaries.form.employee_name.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Salaries.form.employee_name.placeholder")}
                  {...field}
                  disabled={loading}
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
                  <Input type="date" {...field} disabled={loading} />
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
                  <Input type="date" {...field} disabled={loading} />
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
                <Input type="date" {...field} disabled={loading} />
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

        {!formId && (
          <Button type="submit" disabled={loading}>
            {loading
              ? t("common.saving")
              : salaryId
                ? t("common.update_button")
                : t("common.create_button")}
          </Button>
        )}
      </form>
    </Form>
  );
} 