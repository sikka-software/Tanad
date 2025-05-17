import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import FormDialog from "@/ui/form-dialog";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import useBankAccountStore from "@/bank_account/bank_account.store";

import { Button } from "../components/ui/button";
import PageTitle from "../components/ui/page-title";
import { BankAccountForm } from "../modules/bank_account/bank_account.form";
import { useBankAccounts, useDeleteBankAccount } from "../modules/bank_account/bank_account.hooks";
import { BankAccountsTable } from "../modules/bank_account/bank_account.table";
import { BankAccount, BankAccountUpdateData } from "../modules/bank_account/bank_account.type";

export default function BankAccountsPage() {
  const t = useTranslations();

  const moduleHooks = createModuleStoreHooks(useBankAccountStore, "bank_accounts");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableItem, setActionableItem] = useState<BankAccountUpdateData | null>(null);

  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();

  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();

  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();

  const { data: bankAccounts, isLoading: loadingFetchBankAccounts } = useBankAccounts();
  const { mutateAsync: deleteBankAccounts, isPending: isDeleting } = useDeleteBankAccount();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteBankAccounts, {
    loading: "BankAccounts.loading.delete",
    success: "BankAccounts.success.delete",
    error: "BankAccounts.error.delete",
    onSuccess: () => setIsDeleteDialogOpen(false),
  });

  return (
    <div>
      <CustomPageMeta title={t("BankAccounts.title")} description={t("BankAccounts.description")} />
      <DataPageLayout count={bankAccounts?.length} itemsText={t("Pages.BankAccounts.title")}>
        <PageTitle
          texts={{ title: t("Pages.BankAccounts.title") }}
          customButton={
            <Button
              onClick={() => {
                setIsFormDialogOpen(true);
                setActionableItem(null);
              }}
            >
              {t("Pages.BankAccounts.add")}
            </Button>
          }
        />

        <div className="p-4">
          <BankAccountsTable
            data={bankAccounts as BankAccount[]}
            isLoading={loadingFetchBankAccounts}
            onEdit={(id) => {
              setIsFormDialogOpen(true);
              setActionableItem(id);
            }}
            onDelete={(account) => {
              setIsDeleteDialogOpen(true);
              setActionableItem(account);
            }}
          />
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableItem ? t("Pages.BankAccounts.edit") : t("Pages.BankAccounts.add")}
          formId="bank-account-form"
          loadingSave={loadingSave}
        >
          <BankAccountForm
            formHtmlId={"bank-account-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableItem(null);
              setLoadingSave(false);
            }}
            onError={() => setLoadingSave(false)}
            defaultValues={actionableItem}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(actionableItem?.id || "")}
          title={t("BankAccounts.confirm_delete")}
          description={t("BankAccounts.delete_description", { count: 1 })}
        />
      </DataPageLayout>
    </div>
  );
}

BankAccountsPage.messages = ["Metadata", "Pages", "BankAccounts", "Notes", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../locales/${locale}.json`)).default,
        BankAccountsPage.messages,
      ),
    },
  };
};
