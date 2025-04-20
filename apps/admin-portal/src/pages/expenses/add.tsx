import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ExpenseForm, type ExpenseFormValues } from "@/modules/expense/expense.form";
import { useCreateExpense } from "@/modules/expense/expense.hooks";
import useUserStore from "@/stores/use-user-store";

export default function AddExpensePage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutate: createExpense, isPending } = useCreateExpense();
  const { user } = useUserStore();

  const handleSubmit = async (data: ExpenseFormValues) => {
    setLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setLoading(false);
      return;
    }
    try {
      await createExpense({
        expense_number: data.expense_number.trim(),
        issue_date: data.issue_date,
        due_date: data.due_date,
        amount: data.amount,
        category: data.category.trim(),
        client_id: data.client_id?.trim(),
        status: data.status || "pending",
        notes: data.notes?.trim(),
        user_id: user?.id,
      });

      router.push("/expenses");
      toast.success(t("General.successful_operation"), {
        description: t("Expenses.success.created"),
      });
      setLoading(false);
    } catch (error) {
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Expenses.error.creating"),
      });
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).expenseForm;
    if (form) {
      form.setValue("expense_number", dummyData.stringNumber);
      form.setValue("issue_date", dummyData.randomDate);
      form.setValue("due_date", dummyData.randomDate);
      form.setValue("amount", dummyData.randomNumber);
      form.setValue("category", dummyData.expense_category);
      form.setValue("notes", dummyData.randomString);
      form.setValue("status", dummyData.pick(["pending", "paid", "overdue"]));
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Expenses.add_new")} />
      <PageTitle
        title={t("Expenses.add_new")}
        formButtons
        formId="expense-form"
        loading={loading}
        onCancel={() => router.push("/expenses")}
        texts={{
          submit_form: t("Expenses.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <ExpenseForm id="expense-form" onSubmit={handleSubmit} loading={isPending} />
      </div>
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
