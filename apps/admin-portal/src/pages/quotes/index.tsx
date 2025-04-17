import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

import QuoteCard from "@/components/app/quote/quote.card";
import QuotesTable from "@/components/app/quote/quote.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import { Button } from "@/components/ui/button";
import ConfirmDelete from "@/components/ui/confirm-delete";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Quote } from "@/types/quote.type";

import { useQuotes, useBulkDeleteQuotes } from "@/hooks/useQuotes";
import { useQuotesStore } from "@/stores/quotes.store";

export default function QuotesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: quotes, isLoading, error } = useQuotes();

  // Get selection state and actions from the store
  const { selectedRows, setSelectedRows, clearSelection } = useQuotesStore();
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

  const selectedQuotes = selectedRows
    .map((id) => quotes?.find((quote) => quote.id === id))
    .filter((quote): quote is Quote => quote !== undefined);

  const handleSelectedRowsChange = (rows: Quote[]) => {
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
    <DataPageLayout>
      {selectedRows.length > 0 ? (
        <div className="bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.length} {t("General.items_selected")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="flex items-center gap-2"
              disabled={isDeleting}
            >
              <X className="h-4 w-4" />
              {t("General.clear")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {t("General.delete")}
            </Button>
          </div>
        </div>
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
            onSelectedRowsChange={handleSelectedRowsChange}
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
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
