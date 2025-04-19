import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import QuoteCard from "@/modules/quote/quote.card";
import QuotesTable from "@/modules/quote/quote.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { Quote } from "@/modules/quote/quote.type";

import { useQuotes, useBulkDeleteQuotes } from "@/hooks/models/useQuotes";
import { useQuotesStore } from "@/modules/quote/quote.store";

export default function QuotesPage() {
  const t = useTranslations();

  const isDeleteDialogOpen = useQuotesStore((state) => state.isDeleteDialogOpen);
  const setIsDeleteDialogOpen = useQuotesStore((state) => state.setIsDeleteDialogOpen);
  const searchQuery = useQuotesStore((state) => state.searchQuery);
  const setSearchQuery = useQuotesStore((state) => state.setSearchQuery);
  const viewMode = useQuotesStore((state) => state.viewMode);
  const setViewMode = useQuotesStore((state) => state.setViewMode);
  const selectedRows = useQuotesStore((state) => state.selectedRows);
  const setSelectedRows = useQuotesStore((state) => state.setSelectedRows);
  const clearSelection = useQuotesStore((state) => state.clearSelection);
  const sortRules = useQuotesStore((state) => state.sortRules);
  const setSortRules = useQuotesStore((state) => state.setSortRules);
  const sortCaseSensitive = useQuotesStore((state) => state.sortCaseSensitive);
  const setSortCaseSensitive = useQuotesStore((state) => state.setSortCaseSensitive);
  const sortNullsFirst = useQuotesStore((state) => state.sortNullsFirst);
  const setSortNullsFirst = useQuotesStore((state) => state.setSortNullsFirst);
  const filterConditions = useQuotesStore((state) => state.filterConditions);
  const setFilterConditions = useQuotesStore((state) => state.setFilterConditions);
  const filterCaseSensitive = useQuotesStore((state) => state.filterCaseSensitive);
  const setFilterCaseSensitive = useQuotesStore((state) => state.setFilterCaseSensitive);

  const { data: quotes, isLoading, error } = useQuotes();

  // Get selection state and actions from the store
  const { mutate: deleteQuotes, isPending: isDeleting } = useBulkDeleteQuotes();

  const filteredQuotes = Array.isArray(quotes)
    ? quotes.filter(
        (quote: Quote) =>
          quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.clients?.company?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          quote.clients?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          quote.clients?.email?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleRowSelectionChange = (rows: Quote[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
      setSelectedRows(newSelectedIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setIsDeleteDialogOpen(true);
  };

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
            title={t("Quotes.title")}
            createHref="/quotes/add"
            createLabel={t("Quotes.add_new")}
            onSearch={setSearchQuery}
            searchPlaceholder={t("Quotes.search_quotes")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        <div>
          {viewMode === "table" ? (
            <QuotesTable
              data={filteredQuotes}
              isLoading={isLoading}
              error={error as Error | null}
              onSelectedRowsChange={handleRowSelectionChange}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredQuotes}
                isLoading={isLoading}
                error={error as Error | null}
                emptyMessage={t("Quotes.no_quotes")}
                addFirstItemMessage={t("Quotes.add_first_quote")}
                renderItem={(quote: Quote) => <QuoteCard key={quote.id} quote={quote} />}
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
