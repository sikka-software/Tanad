import { pick } from "lodash";
import { FileClock, Plus, Quote } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import FormDialog from "@/ui/form-dialog";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { createModuleStoreHooks } from "@/utils/module-hooks";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import QuoteCard from "@/quote/quote.card";
import useQuoteColumns from "@/quote/quote.columns";
import { QuoteForm } from "@/quote/quote.form";
import { useQuotes, useBulkDeleteQuotes, useDuplicateQuote } from "@/quote/quote.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/quote/quote.options";
import useQuotesStore from "@/quote/quote.store";
import useQuoteStore from "@/quote/quote.store";
import QuotesTable from "@/quote/quote.table";
import { QuoteUpdateData } from "@/quote/quote.type";

export default function QuotesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useQuoteColumns();

  const moduleHooks = createModuleStoreHooks(useQuoteStore, "quotes");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableQuote, setActionableQuote] = useState<QuoteUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // Permissions
  const canRead = moduleHooks.useCanRead();
  const canCreate = moduleHooks.useCanCreate();
  // Loading
  const loadingSave = moduleHooks.useIsLoading();
  const setLoadingSave = moduleHooks.useSetIsLoading();
  // Delete Dialog
  const isDeleteDialogOpen = moduleHooks.useIsDeleteDialogOpen();
  const setIsDeleteDialogOpen = moduleHooks.useSetIsDeleteDialogOpen();
  // Selected Rows
  const selectedRows = moduleHooks.useSelectedRows();
  const setSelectedRows = moduleHooks.useSetSelectedRows();
  const clearSelection = moduleHooks.useClearSelection();
  // Column Visibility
  const columnVisibility = moduleHooks.useColumnVisibility();
  const setColumnVisibility = moduleHooks.useSetColumnVisibility();
  // Sorting
  const sortRules = moduleHooks.useSortRules();
  const sortCaseSensitive = moduleHooks.useSortCaseSensitive();
  const sortNullsFirst = moduleHooks.useSortNullsFirst();
  const setSortRules = moduleHooks.useSetSortRules();
  // Filtering
  const filterConditions = moduleHooks.useFilterConditions();
  const filterCaseSensitive = moduleHooks.useFilterCaseSensitive();
  const getFilteredData = moduleHooks.useGetFilteredData();
  const getSortedData = moduleHooks.useGetSortedData();
  // Misc
  const searchQuery = moduleHooks.useSearchQuery();
  const viewMode = moduleHooks.useViewMode();

  const { data: quotes, isLoading, error } = useQuotes();
  const { mutateAsync: deleteQuotes, isPending: isDeleting } = useBulkDeleteQuotes();
  const { mutate: duplicateQuote } = useDuplicateQuote();
  const { createDeleteHandler } = useDeleteHandler();

  const { handleAction: onActionClicked } = useDataTableActions({
    data: quotes,
    setSelectedRows,
    setPendingDeleteIds,
    setIsDeleteDialogOpen,
    setIsFormDialogOpen,
    setActionableItem: setActionableQuote,
    duplicateMutation: duplicateQuote,
    moduleName: "Quotes",
  });

  const handleConfirmDelete = createDeleteHandler(deleteQuotes, {
    loading: "Quotes.loading.delete",
    success: "Quotes.success.delete",
    error: "Quotes.error.delete",
    onSuccess: () => {
      clearSelection();
      setPendingDeleteIds([]);
      setIsDeleteDialogOpen(false);
    },
  });

  const storeData = useQuotesStore((state) => state.data) || [];
  const setData = useQuotesStore((state) => state.setData);

  // When offices data changes (from server), update the store
  useEffect(() => {
    if (quotes && setData) {
      setData(quotes);
    }
  }, [quotes, setData]);

  const filteredQuotes = useMemo(() => {
    return getFilteredData(storeData);
  }, [storeData, getFilteredData, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedQuotes = useMemo(() => {
    return getSortedData(filteredQuotes);
  }, [filteredQuotes, sortRules, sortCaseSensitive, sortNullsFirst]);

  const tanstackSorting = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules],
  );
  const handleTanstackSortingChange = (
    updater:
      | ((prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[])
      | { id: string; desc: boolean }[],
  ) => {
    let nextSorting = typeof updater === "function" ? updater(tanstackSorting) : updater;
    const newSortRules = nextSorting.map((s: { id: string; desc: boolean }) => ({
      field: s.id,
      direction: (s.desc ? "desc" : "asc") as "asc" | "desc",
    }));
    setSortRules(newSortRules);
  };

  if (!canRead) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Pages.Quotes.title")} description={t("Pages.Quotes.description")} />
      <DataPageLayout count={quotes?.length} itemsText={t("Pages.Quotes.title")}>
        {selectedRows.length > 0 ? (
          <SelectionMode
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            isDeleting={isDeleting}
            setIsDeleteDialogOpen={(open) => {
              if (open) setPendingDeleteIds(selectedRows);
              setIsDeleteDialogOpen(open);
            }}
          />
        ) : (
          <PageSearchAndFilter
            store={useQuotesStore}
            columns={viewMode === "table" ? columns : []}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Pages.Quotes.title")}
            onAddClick={canCreate ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Pages.Quotes.add")}
            searchPlaceholder={t("Pages.Quotes.search")}
            hideOptions={quotes?.length === 0}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(updater) => {
              setColumnVisibility((prev) =>
                typeof updater === "function" ? updater(prev) : updater,
              );
            }}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <QuotesTable
              data={sortedQuotes}
              isLoading={isLoading}
              error={error}
              onActionClicked={onActionClicked}
              sorting={tanstackSorting}
              onSortingChange={handleTanstackSortingChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedQuotes}
                isLoading={isLoading}
                error={error}
                empty={{
                  title: t("Quotes.create_first.title"),
                  description: t("Quotes.create_first.description"),
                  add: t("Pages.Quotes.add"),
                  icons: [FileClock, Plus, FileClock],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(quote) => (
                  <QuoteCard quote={quote} onActionClicked={onActionClicked} />
                )}
                gridCols="2"
              />
            </div>
          )}
        </div>

        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          title={actionableQuote ? t("Pages.Quotes.edit") : t("Pages.Quotes.add")}
          formId="quote-form"
          loadingSave={loadingSave}
        >
          <QuoteForm
            formHtmlId="quote-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableQuote(null);
              setLoadingSave(false);
            }}
            defaultValues={actionableQuote}
            editMode={true}
          />
        </FormDialog>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(pendingDeleteIds)}
          title={t("Quotes.confirm_delete", { count: selectedRows.length })}
          description={t("Quotes.delete_description", { count: selectedRows.length })}
          extraConfirm={selectedRows.length > 4}
          onCancel={() => selectedRows.length === 1 && viewMode === "cards" && setSelectedRows([])}
        />
      </DataPageLayout>
    </div>
  );
}

QuotesPage.messages = ["Metadata","Notes", "Pages", "Quotes", "General", "ProductsFormSection"];
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        QuotesPage.messages,
      ),
    },
  };
};
