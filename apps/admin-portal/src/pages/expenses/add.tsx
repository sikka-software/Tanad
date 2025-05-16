import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyExpense } from "@/lib/dummy-factory";

import { ExpenseForm } from "@/expense/expense.form";
import useExpenseStore from "@/expense/expense.store";

export default function AddExpensePage() {
  const t = useTranslations();
  const router = useRouter();
  const isLoading = useExpenseStore((state) => state.isLoading);
  const setIsLoading = useExpenseStore((state) => state.setIsLoading);

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
        dummyButton={generateDummyExpense}
      />

      <ExpenseForm
        formHtmlId="expense-form"
        onSuccess={() => {
          router.push("/expenses").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddExpensePage.messages = ["Metadata", "Notes", "Pages", "Expenses", "Forms", "General"];

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
