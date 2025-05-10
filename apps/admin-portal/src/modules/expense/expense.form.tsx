import { zodResolver } from "@hookform/resolvers/zod";
import NotesSection from "@root/src/components/forms/notes-section";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { CurrencyInput } from "@/ui/currency-input";
import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import CodeInput from "@/components/ui/code-input";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateExpense, useUpdateExpense, useExpenses } from "./expense.hooks";
import useExpenseStore from "./expense.store";
import { ExpenseCreateData, ExpenseUpdateData } from "./expense.type";

export const createExpenseSchema = (t: (key: string) => string) =>
  z.object({
    expense_number: z.string().min(1, t("Expenses.form.expense_number.required")),
    issue_date: z.date({ required_error: t("Expenses.form.issue_date.required") }),
    due_date: z.date({ required_error: t("Expenses.form.due_date.required") }),
    status: z.enum(["pending", "paid", "overdue"]).default("pending"),
    amount: z.number().min(0, t("Expenses.form.amount.required")),
    category: z.string().min(1, t("Expenses.form.category.required")),
    notes: z.any().optional().nullable(),
    client_id: z.string().optional(),
  });

export type ExpenseFormValues = z.input<ReturnType<typeof createExpenseSchema>>;

export function ExpenseForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<ExpenseUpdateData | ExpenseCreateData>) {
  const t = useTranslations();
  const locale = useLocale();
  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { mutate: createExpense } = useCreateExpense();
  const { mutate: updateExpense } = useUpdateExpense();
  const { data: expenses } = useExpenses();

  const isLoading = useExpenseStore((state) => state.isLoading);
  const setIsLoading = useExpenseStore((state) => state.setIsLoading);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema(t)),
    defaultValues: {
      expense_number: defaultValues?.expense_number || "",
      issue_date: defaultValues?.issue_date ? new Date(defaultValues.issue_date) : undefined,
      due_date: defaultValues?.due_date ? new Date(defaultValues.due_date) : undefined,
      status: (defaultValues?.status || "pending") as "pending" | "paid" | "overdue",
      amount: defaultValues?.amount || 0,
      category: defaultValues?.category || "",
      notes: getNotesValue(defaultValues),
      // client_id: defaultValues?.client_id || "",
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
          data: {
            ...data,
            due_date: data.due_date.toISOString(),
            issue_date: data.issue_date.toISOString(),
          },
        });
      } else {
        await createExpense(
          {
            expense_number: data.expense_number.trim(),
            issue_date: data.issue_date.toISOString(),
            due_date: data.due_date.toISOString(),
            amount: data.amount,
            enterprise_id: enterprise?.id || "",
            category: data.category.trim(),
            // ...(data.client_id?.trim() ? { client_id: data.client_id.trim() } : {}),
            status: data.status || "pending",
            notes: data.notes,
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
        description: t("Expenses.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).expenseForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="form-container">
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
                      ariaInvalid={form.formState.errors.issue_date !== undefined}
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
                      ariaInvalid={form.formState.errors.due_date !== undefined}
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
        </div>

        <NotesSection
          inDialog={editMode}
          control={form.control}
          title={t("Expenses.form.notes.label")}
        />
      </form>
    </Form>
  );
}
