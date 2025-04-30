import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { toast } from "sonner";

import ConfirmDelete from "@/ui/confirm-delete";
import DataModelList from "@/ui/data-model-list";
import PageSearchAndFilter from "@/ui/page-search-and-filter";
import SelectionMode from "@/ui/selection-mode";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import NoPermission from "@/components/ui/no-permission";

import { useDeleteHandler } from "@/hooks/use-delete-handler";
import QuoteCard from "@/modules/quote/quote.card";
import { useQuotes, useBulkDeleteQuotes } from "@/modules/quote/quote.hooks";
import { SORTABLE_COLUMNS, FILTERABLE_FIELDS } from "@/modules/quote/quote.options";
import useQuotesStore from "@/modules/quote/quote.store";
import QuotesTable from "@/modules/quote/quote.table";
import useUserStore from "@/stores/use-user-store";

export default function QuotesPage() {
  const t = useTranslations();
  const router = useRouter();

  const canReadQuotes = useUserStore((state) => state.hasPermission("quotes.read"));
  const canCreateQuotes = useUserStore((state) => state.hasPermission("quotes.create"));

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
  const { mutateAsync: deleteQuotes, isPending: isDeleting } = useBulkDeleteQuotes();
  const { createDeleteHandler } = useDeleteHandler();

  const handleConfirmDelete = createDeleteHandler(deleteQuotes, {
    loading: "Quotes.loading.deleting",
    success: "Quotes.success.deleted",
    error: "Quotes.error.deleting",
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
