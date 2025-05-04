import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import NoPermission from "@/ui/no-permission";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import { useDataTableActions } from "@/hooks/use-data-table-actions";
import { useDeleteHandler } from "@/hooks/use-delete-handler";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import QuoteCard from "@/quote/quote.card";
import { useQuotes, useBulkDeleteQuotes, useDuplicateQuote } from "@/quote/quote.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/quote/quote.options";
import useQuotesStore from "@/quote/quote.store";
import QuotesTable from "@/quote/quote.table";

import { Quote } from "@/modules/quote/quote.type";
import useUserStore from "@/stores/use-user-store";

export default function QuotesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadQuotes = useUserStore((state) => state.hasPermission("quotes.read"));
  const canCreateQuotes = useUserStore((state) => state.hasPermission("quotes.create"));

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionableQuote, setActionableQuote] = useState<Quote | null>(null);

  const viewMode = useQuotesStore((state) => state.viewMode);
  const isDeleteDialogOpen = useQuotesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useQuotesStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useQuotesStore((state) => state.selectedRows);
  const setSelectedRows = useQuotesStore((state) => state.setSelectedRows);
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
      setIsDeleteDialogOpen(false);
    },
  });

  const filteredQuotes = useMemo(() => {
    return getFilteredQuotes(quotes || []);
  }, [quotes, getFilteredQuotes, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedQuotes = useMemo(() => {
    return getSortedQuotes(filteredQuotes);
  }, [filteredQuotes, sortRules, sortCaseSensitive, sortNullsFirst]);

  if (!canReadQuotes) {
    return <NoPermission />;
  }

  return (
    <div>
      <CustomPageMeta title={t("Quotes.title")} description={t("Quotes.description")} />
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
            store={useQuotesStore}
            sortableColumns={SORTABLE_COLUMNS}
            filterableFields={FILTERABLE_FIELDS}
            title={t("Quotes.title")}
            onAddClick={canCreateQuotes ? () => router.push(router.pathname + "/add") : undefined}
            createLabel={t("Quotes.add_new")}
            searchPlaceholder={t("Quotes.search_quotes")}
            count={quotes?.length}
            hideOptions={quotes?.length === 0}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <QuotesTable
              data={sortedQuotes}
              isLoading={isLoading}
              error={error as Error | null}
              onActionClicked={onActionClicked}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={sortedQuotes}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Quotes.no_quotes")}
                addFirstItemMessage={t("Quotes.add_first_quote")}
                renderItem={(quote) => <QuoteCard key={quote.id} quote={quote} />}
                gridCols="2"
              />
            </div>
          )}
        </div>

        <ConfirmDelete
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isDeleting={isDeleting}
          handleConfirmDelete={() => handleConfirmDelete(selectedRows)}
          title={t("Quotes.confirm_delete_title")}
          description={t("Quotes.confirm_delete", { count: selectedRows.length })}
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
