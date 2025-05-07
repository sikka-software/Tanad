import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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

import WebsiteCard from "@/modules/website/website.card";
import { WebsiteForm } from "@/modules/website/website.form";
import {
  useWebsites,
  useBulkDeleteWebsites,
  useDuplicateWebsite,
} from "@/modules/website/website.hooks";
import { FILTERABLE_FIELDS, SORTABLE_COLUMNS } from "@/modules/website/website.options";
import useWebsiteStore from "@/modules/website/website.store";
import WebsitesTable from "@/modules/website/website.table";
import { Website, WebsiteUpdateData } from "@/modules/website/website.type";
import useUserStore from "@/stores/use-user-store";

export default function WebsitesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadWebsites = useUserStore((state) => state.hasPermission("websites.read"));
  const canCreateWebsites = useUserStore((state) => state.hasPermission("websites.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableWebsite, setActionableWebsite] = useState<Website | null>(null);
  const [displayData, setDisplayData] = useState<Website[]>([]);

  const loadingSaveWebsite = useWebsiteStore((state) => state.isLoading);
  const setLoadingSaveWebsite = useWebsiteStore((state) => state.setIsLoading);
  const viewMode = useWebsiteStore((state) => state.viewMode);
  const isDeleteDialogOpen = useWebsiteStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useWebsiteStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useWebsiteStore((state) => state.selectedRows);
  const setSelectedRows = useWebsiteStore((state) => state.setSelectedRows);
  const clearSelection = useWebsiteStore((state) => state.clearSelection);
  const sortRules = useWebsiteStore((state) => state.sortRules);
  const sortCaseSensitive = useWebsiteStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useWebsiteStore((state) => state.sortNullsFirst);
  const searchQuery = useWebsiteStore((state) => state.searchQuery);
  const filterConditions = useWebsiteStore((state) => state.filterConditions);
  const filterCaseSensitive = useWebsiteStore((state) => state.filterCaseSensitive);
  const getFilteredWebsites = useWebsiteStore((state) => state.getFilteredData);
  const getSortedWebsites = useWebsiteStore((state) => state.getSortedData);
  const setViewMode = useWebsiteStore((state) => state.setViewMode);

  const { data: websites, isLoading: loadingFetchWebsites, error } = useWebsites();
  const { mutate: duplicateWebsite } = useDuplicateWebsite();
  const { mutateAsync: deleteWebsites, isPending: isDeleting } = useBulkDeleteWebsites();
  const { createDeleteHandler } = useDeleteHandler();

  useEffect(() => {
    if (websites) {
      setDisplayData(websites);
    } else {
      setDisplayData([]);
    }
  }, [websites]);

  const { handleAction: onActionClicked } = useDataTableActions<Website>({
    data: displayData,
    setSelectedRows,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableWebsite,
    duplicateMutation: duplicateWebsite,
    moduleName: "Websites",
  });

  const handleConfirmDelete = createDeleteHandler(deleteWebsites, {
    loading: "Websites.loading.delete",
    success: "Websites.success.delete",
    error: "Websites.error.delete",
    onSuccess: () => {
      setDisplayData((current) => current.filter((row) => !selectedRows.includes(row.id)));
      clearSelection();
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredWebsites = useMemo(() => {
    return getFilteredWebsites(displayData);
  }, [displayData, getFilteredWebsites, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedWebsites = useMemo(() => {
    return getSortedWebsites(filteredWebsites);
  }, [filteredWebsites, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadWebsites) {
    return <NoPermission />;
  }
  return (
    <div>
      <CustomPageMeta title={t("Websites.title")} description={t("Websites.description")} />
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
            store={useWebsiteStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Websites.title")}
            onAddClick={canCreateWebsites ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Websites.create_new")}
            searchPlaceholder={t("Websites.search_websites")}
            count={displayData?.length}
            hideOptions={displayData?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <WebsitesTable
              data={sortedWebsites}
              isLoading={loadingFetchWebsites}
              error={error instanceof Error ? error : null}
              onActionClicked={onActionClicked}
            />
          ) : viewMode === "cards" ? (
            <div className="p-4">
              <DataModelList
                data={sortedWebsites}
                isLoading={loadingFetchWebsites}
                error={error as Error | null}
                emptyMessage={t("Websites.no_websites_found")}
                renderItem={(website) => <WebsiteCard key={website.id} website={website} />}
                gridCols="3"
              />
            </div>
          ) : null}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableWebsite?.id ? t("Websites.edit_title") : t("Websites.add_new")}
          formId="website-form"
          loadingSave={loadingSaveWebsite}
        >
          <WebsiteForm
            formHtmlId={"website-form"}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableWebsite(null);
              setLoadingSaveWebsite(false);
            }}
            defaultValues={actionableWebsite}
            editMode={!!actionableWebsite?.id}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          // handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          handleConfirmDelete={() => {
            console.log("pretend");
          }}
          title={t("Websites.confirm_delete", { count: selectedRows.length })}
          description={t("Websites.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
        />
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
