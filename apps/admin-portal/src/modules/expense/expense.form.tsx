import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

export const createExpenseSchema = (t: (key: string) => string) =>
  z.object({
    expense_number: z.string().min(1, t("Expenses.form.expense_number.required")),
    issue_date: z.date({ required_error: t("Expenses.form.issue_date.required") }),
    due_date: z.date({ required_error: t("Expenses.form.due_date.required") }),
    status: z.enum(["pending", "paid", "overdue"]).default("pending"),
    amount: z.number().min(0, t("Expenses.form.amount.required")),
    category: z.string().min(1, t("Expenses.form.category.required")),
    notes: z.string().optional().or(z.literal("")),
    client_id: z.string().optional(),
  });

export type ExpenseFormValues = z.input<ReturnType<typeof createExpenseSchema>>;

export interface ExpenseFormProps {
  id?: string;
  onSubmit: (data: ExpenseFormValues) => void;
  loading?: boolean;
}

export function ExpenseForm({ id, onSubmit, loading }: ExpenseFormProps) {
  const t = useTranslations();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema(t)),
    defaultValues: {
      expense_number: "",
      issue_date: undefined,
      due_date: undefined,
      status: "pending",
      amount: 0,
      category: "",
      notes: "",
      client_id: "",
    },
  });

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).expenseForm = form;
  }

  return (
    <Form {...form}>
      <form id={id || "expense-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="expense_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Expenses.form.expense_number.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Expenses.form.expense_number.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Expenses.form.category.label")} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Expenses.form.category.placeholder")}
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Expenses.form.issue_date.label")} *</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Expenses.form.due_date.label")} *</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Expenses.form.amount.label")} *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("Expenses.form.amount.placeholder")}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={loading}
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
                <FormLabel>{t("Expenses.form.status.label")} *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Expenses.form.status.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">
                      {t("Expenses.form.status.options.pending")}
                    </SelectItem>
                    <SelectItem value="paid">{t("Expenses.form.status.options.paid")}</SelectItem>
                    <SelectItem value="overdue">
                      {t("Expenses.form.status.options.overdue")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Expenses.form.client_id.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Expenses.form.client_id.placeholder")}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Expenses.form.notes.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Expenses.form.notes.placeholder")}
                  {...field}
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
