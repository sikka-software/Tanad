import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import QuoteCard from "@/modules/quote/quote.card";
import { useQuotes, useBulkDeleteQuotes } from "@/modules/quote/quote.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/modules/quote/quote.options";
import useQuotesStore from "@/modules/quote/quote.store";
import QuotesTable from "@/modules/quote/quote.table";

export default function QuotesPage() {
  const t = useTranslations();

  const viewMode = useQuotesStore((state) => state.viewMode);
  const isDeleteDialogOpen = useQuotesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useQuotesStore((state) => state.setIsDeleteDialogOpen);
  const selectedRows = useQuotesStore((state) => state.selectedRows);
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
  const { mutate: deleteQuotes, isPending: isDeleting } = useBulkDeleteQuotes();

  const filteredQuotes = useMemo(() => {
    return getFilteredQuotes(quotes || []);
  }, [quotes, getFilteredQuotes, searchQuery, filterConditions, filterCaseSensitive]);

  const sortedQuotes = useMemo(() => {
    return getSortedQuotes(filteredQuotes);
  }, [filteredQuotes, sortRules, sortCaseSensitive, sortNullsFirst]);

  const handleConfirmDelete = async () => {
    try {
      await deleteQuotes(selectedRows, {
        onSuccess: () => {
          clearSelection();
          setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to delete quotes:", error);
          toast.error(t("Quotes.error.bulk_delete"));
          setIsDeleteDialogOpen(false);
        },
      });
    } catch (error) {
      console.error("Failed to delete quotes:", error);
      setIsDeleteDialogOpen(false);
    }
  };

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
            createHref="/quotes/add"
            createLabel={t("Quotes.add_new")}
            searchPlaceholder={t("Quotes.search_quotes")}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <QuotesTable data={sortedQuotes} isLoading={isLoading} error={error as Error | null} />
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
          handleConfirmDelete={handleConfirmDelete}
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
