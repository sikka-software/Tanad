import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CodeInput from "@/ui/inputs/code-input";
import { CurrencyInput } from "@/ui/inputs/currency-input";
import { DateInput } from "@/ui/inputs/date-input";
import { Input } from "@/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/components/forms/notes-section";

import { formatToYYYYMMDD } from "@/utils/date-utils";
import { getNotesValue } from "@/lib/utils";
import { validateYearRange } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import { useCreateExpense, useUpdateExpense, useExpenses } from "@/expense/expense.hooks";
import useExpenseStore from "@/expense/expense.store";
import { ExpenseCreateData, ExpenseStatus, ExpenseUpdateData } from "@/expense/expense.type";

import { expenses } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

export const createExpenseSchema = (t: (key: string) => string) => {
  const ExpenseSelectSchema = createInsertSchema(expenses, {
    expense_number: z
      .string({ message: t("Expenses.form.expense_number.required") })
      .min(1, t("Expenses.form.expense_number.required")),
    amount: z.coerce
      .number({ message: t("Expenses.form.amount.required") })
      .min(0, t("Expenses.form.amount.required")),
    category: z
      .string({ message: t("Expenses.form.category.required") })
      .min(1, t("Expenses.form.category.required")),
    due_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Expenses.form.due_date.invalid")),
    issue_date: z
      .any()
      .optional()
      .superRefine(validateYearRange(t, 1800, 2200, "Expenses.form.issue_date.invalid")),
    status: z.enum(ExpenseStatus).default("draft"),
    notes: z.any().optional().nullable(),
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

  const isLoadingSave = useExpenseStore((state) => state.isLoading);
  const setIsLoadingSave = useExpenseStore((state) => state.setIsLoading);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema(t)),
    defaultValues: {
      ...defaultValues,
      issue_date: formatToYYYYMMDD(defaultValues?.issue_date),
      due_date: formatToYYYYMMDD(defaultValues?.due_date),
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsLoadingSave(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }

    const payload = {
      ...data,
      due_date: formatToYYYYMMDD(data.due_date),
      issue_date: formatToYYYYMMDD(data.issue_date),
    };

    try {
      if (editMode && defaultValues?.id) {
        await updateExpense({ id: defaultValues.id, data: payload });
      } else {
        await createExpense(payload, {
          onSuccess: () => onSuccess?.(),
          onError: () => setIsLoadingSave(false),
        });
      }
    } catch (error) {
      setIsLoadingSave(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).expenseForm = form;
  }

  return (
    <Form {...form}>
      <form
        id={formHtmlId || "expense-form"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("form errors ", form.formState.errors);
          form.handleSubmit(handleSubmit)(e);
        }}
      >
        <input hidden type="text" value={user?.id} {...form.register("user_id")} />
        <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />

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
                        field.onChange(`EX-${paddedNumber}`);
                      }}
                      onRandom={() => {
                        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                        let randomCode = "";
                        for (let i = 0; i < 5; i++) {
                          randomCode += randomChars.charAt(
                            Math.floor(Math.random() * randomChars.length),
                          );
                        }
                        field.onChange(`EX-${randomCode}`);
                      }}
                      inputProps={{
                        placeholder: t("Expenses.form.expense_number.placeholder"),
                        disabled: isLoadingSave,
                        ...field,
                      }}
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
                      disabled={isLoadingSave}
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
                      disabled={isLoadingSave}
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
                  <FormLabel>{t("Expenses.form.due_date.label")}</FormLabel>
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
                      disabled={isLoadingSave}
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
                      disabled={isLoadingSave}
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
                    disabled={isLoadingSave}
                    {...field}
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
