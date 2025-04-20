import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import useUserStore from "@/stores/use-user-store";
import { generateId } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { useCreateExpense } from "@/modules/expense/expense.hooks";
import { Expense } from "@/modules/expense/expense.type";

export default function AddExpensePage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { mutate: createExpense, isPending } = useCreateExpense();

  const [expenseNumber, setExpenseNumber] = useState("");
  const [issue_date, setissue_date] = useState<Date>();
  const [due_date, setdue_date] = useState<Date>();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<Expense["status"]>("pending");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error(t("Auth.error.not_authenticated"));
      return;
    }

    if (!issue_date || !due_date) {
      toast.error(t("Expenses.error.dates_required"));
      return;
    }

    try {
      await createExpense(
        {
          expenseNumber,
          issue_date: issue_date.toISOString().split("T")[0],
          due_date: due_date.toISOString().split("T")[0],
          amount: parseFloat(amount),
          category,
          notes,
          client_id: clientId,
          status,
          user_id: user.id,
        },
        {
          onSuccess: () => {
            toast.success(t("Expenses.success.created"));
            router.push("/expenses");
          },
          onError: (error: any) => {
            console.error("Failed to create expense:", error);
            toast.error(t("Expenses.error.create"));
          },
        }
      );
    } catch (error) {
      console.error("Failed to create expense:", error);
      toast.error(t("Expenses.error.create"));
    }
  };

  const generateDummyData = () => {
    setExpenseNumber(generateId());
    setissue_date(new Date());
    setdue_date(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setAmount("1000");
    setCategory("Office Supplies");
    setNotes("Monthly office supplies expense");
    setClientId(generateId());
    setStatus("pending");
  };

  return (
    <div>
      <CustomPageMeta title={t("Expenses.add_new")} description={t("Expenses.add_description")} />
      <DataPageLayout>
        <div className="mx-auto max-w-2xl">
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormItem>
                <FormLabel>{t("Expenses.expense_number")}</FormLabel>
                <FormControl>
                  <Input
                    value={expenseNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpenseNumber(e.target.value)}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.issue_date")}</FormLabel>
                <FormControl>
                  <DatePicker
                    date={issue_date}
                    onSelect={setissue_date}
                    placeholder={t("Expenses.select_issue_date")}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.due_date")}</FormLabel>
                <FormControl>
                  <DatePicker
                    date={due_date}
                    onSelect={setdue_date}
                    placeholder={t("Expenses.select_due_date")}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.amount")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.category")}</FormLabel>
                <FormControl>
                  <Input
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.client_id")}</FormLabel>
                <FormControl>
                  <Input
                    value={clientId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>{t("Expenses.status")}</FormLabel>
                <Select value={status} onValueChange={(value: string) => setStatus(value as Expense["status"])}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Expenses.select_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("Expenses.status_pending")}</SelectItem>
                    <SelectItem value="paid">{t("Expenses.status_paid")}</SelectItem>
                    <SelectItem value="overdue">{t("Expenses.status_overdue")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={generateDummyData}>
                  {t("Common.generate_dummy_data")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {t("Common.create")}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </DataPageLayout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
