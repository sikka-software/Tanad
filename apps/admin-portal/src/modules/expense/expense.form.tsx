import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { CurrencyInput } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import CodeInput from "@/components/ui/code-input";

import useUserStore from "@/stores/use-user-store";

import { useCreateExpense, useUpdateExpense, useExpenses } from "./expense.hooks";
import useExpenseStore from "./expense.store";
import { ExpenseUpdateData } from "./expense.type";

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
  onSuccess?: () => void;
  defaultValues?: ExpenseUpdateData | null;
  editMode?: boolean;
}

export function ExpenseForm({ id, onSuccess, defaultValues, editMode = false }: ExpenseFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const user = useUserStore((state) => state.user);
  const { mutate: createExpense } = useCreateExpense();
  const { mutate: updateExpense } = useUpdateExpense();
  const { data: expenses } = useExpenses();

  const isLoading = useExpenseStore((state) => state.isLoading);
  const setIsLoading = useExpenseStore((state) => state.setIsLoading);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema(t)),
    defaultValues: {
      expense_number: defaultValues?.expense_number || "",
      issue_date: defaultValues?.issue_date || undefined,
      due_date: defaultValues?.due_date || undefined,
      status: defaultValues?.status || "pending",
      amount: defaultValues?.amount || 0,
      category: defaultValues?.category || "",
      notes: defaultValues?.notes || "",
      client_id: defaultValues?.client_id || "",
    },
  });

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    try {
      if (editMode) {
        await updateExpense({
          id: defaultValues?.id || "",
          data: data,
        });
      } else {
        await createExpense(
          {
            expense_number: data.expense_number.trim(),
            issue_date: data.issue_date,
            due_date: data.due_date,
            amount: data.amount,
            category: data.category.trim(),
            ...(data.client_id?.trim() ? { client_id: data.client_id.trim() } : {}),
            status: data.status || "pending",
            notes: data.notes?.trim(),
            user_id: user?.id,
          },
          {
            onSuccess: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("General.error_operation"), {
        description: t("Expenses.error.creating"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).expenseForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={id || "expense-form"}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="expense_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Expenses.form.expense_number.label")} *</FormLabel>
                <FormControl>
                  <CodeInput
                    onSerial={() => {
                      const nextNumber = (expenses?.length || 0) + 1;
                      const paddedNumber = String(nextNumber).padStart(4, "0");
                      form.setValue("expense_number", `EX-${paddedNumber}`);
                    }}
                    onRandom={() => {
                      const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                      let randomCode = "";
                      for (let i = 0; i < 5; i++) {
                        randomCode += randomChars.charAt(
                          Math.floor(Math.random() * randomChars.length),
                        );
                      }
                      form.setValue("expense_number", `EX-${randomCode}`);
                    }}
                  >
                    <Input
                      placeholder={t("Expenses.form.expense_number.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </CodeInput>
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
                    disabled={isLoading}
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
                    placeholder={t("Expenses.form.issue_date.placeholder")}
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
                    placeholder={t("Expenses.form.due_date.placeholder")}
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
                  <CurrencyInput
                    showCommas={true}
                    value={field.value ? parseFloat(String(field.value)) : undefined}
                    onChange={(value) => field.onChange(value?.toString() || "")}
                    placeholder={t("Expenses.form.amount.placeholder")}
                    disabled={isLoading}
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
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Expenses.form.status.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">{t("Expenses.form.status.pending")}</SelectItem>
                    <SelectItem value="paid">{t("Expenses.form.status.paid")}</SelectItem>
                    <SelectItem value="overdue">{t("Expenses.form.status.overdue")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Expenses.form.client_id.label")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Expenses.form.client_id.placeholder")}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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
                  disabled={isLoading}
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
