import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ExpenseForm } from "@/expense/expense.form";
import useExpenseStore from "@/expense/expense.store";

export default function AddExpensePage() {
  const t = useTranslations();
  const router = useRouter();
  const isLoading = useExpenseStore((state) => state.isLoading);
  const setIsLoading = useExpenseStore((state) => state.setIsLoading);

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

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Expenses.success.create"),
    });
    router.push("/expenses");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Expenses.add")} />
      <PageTitle
        formButtons
        formId="expense-form"
        loading={isLoading}
        onCancel={() => router.push("/expenses")}
        texts={{
          title: t("Pages.Expenses.add"),
          submit_form: t("Pages.Expenses.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <ExpenseForm formHtmlId="expense-form" onSuccess={onAddSuccess} />
    </div>
  );
}

AddExpensePage.messages = ["Notes", "Pages", "Expenses", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddExpensePage.messages,
      ),
    },
  };
};
