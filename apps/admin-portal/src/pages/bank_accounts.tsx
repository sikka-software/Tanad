import { Button } from "@excalidraw/excalidraw/components/Button";
import DomainCard from "@root/src/modules/domain/domain.card";
import { DomainForm } from "@root/src/modules/domain/domain.form";
import {
  useDomains,
  useBulkDeleteDomains,
  useDuplicateDomain,
} from "@root/src/modules/domain/domain.hooks";
import useDomainStore from "@root/src/modules/domain/domain.store";
import DomainsTable from "@root/src/modules/domain/domain.table";
import { DomainUpdateData } from "@root/src/modules/domain/domain.type";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import { FormDialog } from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import useBankAccountStore from "@/modules/bank_account/bank_account.store";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/domain/domain.options";
import useUserStore from "@/stores/use-user-store";

import PageTitle from "../components/ui/page-title";
import { useBankAccounts, useDeleteBankAccount } from "../modules/bank_account/bank_account.hooks";
import { BankAccountsTable } from "../modules/bank_account/bank_account.table";

export default function BankAccountsPage() {
  const t = useTranslations();
  const router = useRouter();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const isDeleteDialogOpen = useBankAccountStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useBankAccountStore((state) => state.setIsDeleteDialogOpen);

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

        <div>
          <BankAccountsTable
            data={bankAccounts}
            isLoading={loadingFetchBankAccounts}
            error={error as Error | null}
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
            defaultValues={actionableBankAccount}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("BankAccounts.confirm_delete")}
          description={t("BankAccounts.delete_description", { count: selectedRows.length })}
        />
      </DataPageLayout>
    </div>
  );
}

DomainsPage.messages = ["Pages", "Domains", "Notes", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        DomainsPage.messages,
      ),
    },
  };
};
