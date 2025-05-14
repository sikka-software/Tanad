import { pick } from "lodash";
import { Quote } from "lucide-react";
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
import QuotesTable from "@/quote/quote.table";
import { QuoteUpdateData } from "@/quote/quote.type";

import useUserStore from "@/stores/use-user-store";

export default function QuotesPage() {
  const t = useTranslations();
  const router = useRouter();

  const columns = useQuoteColumns();

  const canReadQuotes = useUserStore((state) => state.hasPermission("quotes.read"));
  const canCreateQuotes = useUserStore((state) => state.hasPermission("quotes.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableQuote, setActionableQuote] = useState<QuoteUpdateData | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const loadingSaveQuote = useQuotesStore((state) => state.isLoading);
  const setLoadingSaveQuote = useQuotesStore((state) => state.setIsLoading);

  const isDeleteDialogOpen = useQuotesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useQuotesStore((state) => state.setIsDeleteDialogOpen);

  const selectedRows = useQuotesStore((state) => state.selectedRows);
  const setSelectedRows = useQuotesStore((state) => state.setSelectedRows);

  const columnVisibility = useQuotesStore((state) => state.columnVisibility);
  const setColumnVisibility = useQuotesStore((state) => state.setColumnVisibility);

  const viewMode = useQuotesStore((state) => state.viewMode);
  const clearSelection = useQuotesStore((state) => state.clearSelection);
  const sortRules = useQuotesStore((state) => state.sortRules);
  const sortCaseSensitive = useQuotesStore((state) => state.sortCaseSensitive);
  const sortNullsFirst = useQuotesStore((state) => state.sortNullsFirst);
  const searchQuery = useQuotesStore((state) => state.searchQuery);
  const filterConditions = useQuotesStore((state) => state.filterConditions);
  const filterCaseSensitive = useQuotesStore((state) => state.filterCaseSensitive);
  const getFilteredQuotes = useQuotesStore((state) => state.getFilteredData);
  const getSortedQuotes = useQuotesStore((state) => state.getSortedData);

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
    return getFilteredQuotes(storeData);
  }, [storeData, getFilteredQuotes, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedQuotes = useMemo(() => {
    return getSortedQuotes(filteredQuotes);
  }, [filteredQuotes, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadQuotes) {
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
            onAddClick={canCreateQuotes ? () => router.push(router.pathname + "/add") : undefined}
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
                  add: t("Quotes.create_first.add"),
                  icons: [Quote, Quote, Quote],
                  onClick: () => router.push(router.pathname + "/add"),
                }}
                renderItem={(quote) => <QuoteCard key={quote.id} quote={quote} />}
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
          loadingSave={loadingSaveQuote}
        >
          <QuoteForm
            formHtmlId="quote-form"
            onSuccess={() => {
              setIsFormDialogOpen(false);
              setActionableQuote(null);
              setLoadingSaveQuote(false);
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
        />
      </DataPageLayout>
    </div>
  );
}

QuotesPage.messages = ["Notes", "Pages", "Quotes", "General"];
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
