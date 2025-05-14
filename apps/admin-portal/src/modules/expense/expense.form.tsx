import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { createSelectSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { CurrencyInput } from "@/ui/currency-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/components/forms/notes-section";
import CodeInput from "@/components/ui/code-input";
import { DateInput } from "@/components/ui/date-input";

import { metadataSchema } from "@/lib/schemas/metadata.schema";
import { getNotesValue } from "@/lib/utils";
import { validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { expenses } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

import { useCreateExpense, useUpdateExpense, useExpenses } from "./expense.hooks";
import useExpenseStore from "./expense.store";
import {
  ExpenseCreateData,
  ExpenseStatus,
  ExpenseStatusProps,
  ExpenseUpdateData,
} from "./expense.type";

export const createExpenseSchema = (t: (key: string) => string) => {
  const ExpenseSelectSchema = createSelectSchema(expenses, {
    description: z.string().optional(),
    amount: z.coerce.number().min(0, t("Expenses.form.amount.required")),
    incurred_at: z.any().optional(),
    created_by: z.string().optional(),
    category: z.string().min(1, t("Expenses.form.category.required")),
    due_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Expenses.form.due_date.invalid")),
    issue_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Expenses.form.issue_date.invalid")),
    notes: z.any().optional().nullable(),
    expense_number: z.string().min(1, t("Expenses.form.expense_number.required")),
    status: z.enum(ExpenseStatus).default("draft"),
    ...metadataSchema,
  });

  return ExpenseSelectSchema;
};

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

      status: (defaultValues?.status || "draft") as ExpenseStatusProps,
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
            due_date:
              data.due_date && typeof data.due_date.toString === "function"
                ? data.due_date.toString()
                : undefined,
            issue_date:
              data.issue_date && typeof data.issue_date.toString === "function"
                ? data.issue_date.toString()
                : undefined,
          },
        });
      } else {
        await createExpense(
          {
            expense_number: data.expense_number.trim(),
            issue_date:
              data.issue_date && typeof data.issue_date.toString === "function"
                ? data.issue_date.toString()
                : undefined,
            due_date:
              data.due_date && typeof data.due_date.toString === "function"
                ? data.due_date.toString()
                : undefined,
            amount: data.amount,
            enterprise_id: enterprise?.id || "",
            category: data.category.trim(),
            // ...(data.client_id?.trim() ? { client_id: data.client_id.trim() } : {}),
            status: data.status || "draft",
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
    }
  };

  if (typeof window !== "undefined") {
    (window as any).expenseForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="form-container">
          <div className="form-fields-cols-2">
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
                    <DateInput
                      placeholder={t("Expenses.form.issue_date.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={isLoading}
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
                    <DateInput
                      placeholder={t("Expenses.form.due_date.placeholder")}
                      value={
                        typeof field.value === "string"
                          ? parseDate(field.value)
                          : (field.value ?? null)
                      }
                      onChange={field.onChange}
                      onSelect={(e) => field.onChange(e)}
                      disabled={isLoading}
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
                      {ExpenseStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`Expenses.form.status.${status}`)}
                        </SelectItem>
                      ))}
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
