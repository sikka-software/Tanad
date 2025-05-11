import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import { FormDialog } from "@/ui/form-dialog";

import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import useBankAccountStore from "@/modules/bank_account/bank_account.store";

import { Button } from "../components/ui/button";
import PageTitle from "../components/ui/page-title";
import { BankAccountForm } from "../modules/bank_account/bank_account.form";
import { useBankAccounts, useDeleteBankAccount } from "../modules/bank_account/bank_account.hooks";
import { BankAccountsTable } from "../modules/bank_account/bank_account.table";
import { BankAccount } from "../modules/bank_account/bank_account.type";

export default function BankAccountsPage() {
  const t = useTranslations();
  const router = useRouter();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const isDeleteDialogOpen = useBankAccountStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useBankAccountStore((state) => state.setIsDeleteDialogOpen);
  const actionableBankAccount = useBankAccountStore((state) => state.actionableItem);
  const loadingSaveBankAccount = useBankAccountStore((state) => state.isLoading);
  const setIsLoadingSavingBankAccount = useBankAccountStore((state) => state.setIsLoading);

  const { data: bankAccounts, isLoading: loadingFetchBankAccounts, error } = useBankAccounts();
  const { mutateAsync: deleteBankAccounts, isPending: isDeleting } = useDeleteBankAccount();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteBankAccounts, {
    loading: "BankAccounts.loading.delete",
    success: "BankAccounts.success.delete",
    error: "BankAccounts.error.delete",
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
    },
  });

  return (
    <div>
      <CustomPageMeta title={t("BankAccounts.title")} description={t("BankAccounts.description")} />
      <DataPageLayout count={bankAccounts?.length} itemsText={t("Pages.BankAccounts.title")}>
        <PageTitle
          texts={{
            title: t("Pages.BankAccounts.title"),
          }}
          customButton={
            <Button onClick={() => setIsFormDialogOpen(true)}>{t("Pages.BankAccounts.add")}</Button>
          }
        />

        <div className="p-4">
          <BankAccountsTable
            data={bankAccounts as BankAccount[]}
            isLoading={loadingFetchBankAccounts}
          />
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={t("Pages.BankAccounts.add")}
          formId="bank-account-form"
          loadingSave={loadingSaveBankAccount}
        >
          <BankAccountForm
            formHtmlId={"bank-account-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
            }}
            onError={() => {
              setIsLoadingSavingBankAccount(false);
            }}
            defaultValues={actionableBankAccount}
            editMode={true}
          />
        </FormDialog>

        {/* <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
        //   handleConfirmDelete={() => handleConfirmDelete()}
          title={t("BankAccounts.confirm_delete")}
          description={t("BankAccounts.delete_description", { count: 1 })}
        /> */}
      </DataPageLayout>
    </div>
  );
}

BankAccountsPage.messages = ["Pages", "BankAccounts", "Notes", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../locales/${locale}.json`)).default,
        BankAccountsPage.messages,
      ),
    },
  };
};
