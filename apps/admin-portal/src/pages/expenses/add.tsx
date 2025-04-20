import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ExpenseForm } from "@/modules/expense/expense.form";
import useExpenseStore from "@/modules/expense/expense.store";

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
      description: t("Expenses.success.created"),
    });
    router.push("/expenses");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Expenses.add_new")} />
      <PageTitle
        formButtons
        formId="expense-form"
        loading={isLoading}
        onCancel={() => router.push("/expenses")}
        texts={{
          title: t("Expenses.add_new"),
          submit_form: t("Expenses.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <div className="mx-auto max-w-2xl p-4">
        <ExpenseForm id="expense-form" onSuccess={onAddSuccess} />
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
