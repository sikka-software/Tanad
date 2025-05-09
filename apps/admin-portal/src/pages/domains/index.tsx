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

import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/domain/domain.options";
import useUserStore from "@/stores/use-user-store";

export default function DomainsPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadDomains = useUserStore((state) => state.hasPermission("domains.read"));
  const canCreateDomains = useUserStore((state) => state.hasPermission("domains.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableDomain, setActionableDomain] = useState<DomainUpdateData | null>(null);

  const loadingSaveDomain = useDomainStore((state) => state.isLoading);
  const setLoadingSaveDomain = useDomainStore((state) => state.setIsLoading);
  const viewMode = useDomainStore((state) => state.viewMode);
  const isDeleteDialogOpen = useDomainStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useDomainStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useDomainStore((state) => state.selectedRows);
  const setSelectedRows = useDomainStore((state) => state.setSelectedRows);
  const clearSelection = useDomainStore((state) => state.clearSelection);
  const sortRules = useDomainStore((state) => state.sortRules);
  const sortCaseSensitive = useDomainStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useDomainStore((state) => state.sortNullsFirst);
  const searchQuery = useDomainStore((state) => state.searchQuery);
  const filterConditions = useDomainStore((state) => state.filterConditions);
  const filterCaseSensitive = useDomainStore((state) => state.filterCaseSensitive);
  const getFilteredDomains = useDomainStore((state) => state.getFilteredData);
  const getSortedDomains = useDomainStore((state) => state.getSortedData);

  const { data: domains, isLoading: loadingFetchDomains, error } = useDomains();
  const { mutate: duplicateDomain } = useDuplicateDomain();
  const { mutateAsync: deleteDomains, isPending: isDeleting } = useBulkDeleteDomains();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: domains,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableDomain,
    duplicateMutation: duplicateDomain,
    moduleName: "Domains",
  });

  const handleConfirmDelete = createDeleteHandler(deleteDomains, {
    loading: "Domains.loading.delete",
    success: "Domains.success.delete",
    error: "Domains.error.delete",
    onSuccess: () => {
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredDomains = useMemo(() => {
    return getFilteredDomains(domains || []);
  }, [domains, getFilteredDomains, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedDomains = useMemo(() => {
    return getSortedDomains(filteredDomains);
  }, [filteredDomains, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadDomains) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("Domains.title")} description={t("Domains.description")} />
      <DataPageLayout>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        ) : (
          <PageSearchAndFilter
            store={useDomainStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Domains.title")}
            onAddClick={canCreateDomains ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Domains.add")}
            searchPlaceholder={t("Pages.Domains.search")}
            count={domains?.length}
            hideOptions={domains?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <DomainsTable
              data={sortedDomains}
              isLoading={loadingFetchDomains}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedDomains}
                isLoading={loadingFetchDomains}
                error={error as Error | null}
                emptyMessage={t("Domains.no_domains_found")}
                renderItem={(domain) => <DomainCard key={domain.id} domain={domain} />}
                gridCols="3"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableDomain ? t("Pages.Domains.edit") : t("Pages.Domains.add")}
          formId="domain-form"
          loadingSave={loadingSaveDomain}
        >
          <DomainForm
            formHtmlId={"domain-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableDomain(null);
              setLoadingSaveDomain(false);
            }}
            defaultValues={actionableDomain}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Domains.confirm_delete")}
          description={t("Domains.delete_description", { count: selectedRows.length })}
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
