import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import QuoteCard from "@/components/app/quote/quote.card";
import QuotesTable from "@/components/app/quote/quote.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Quote } from "@/types/quote.type";

import { useQuotes } from "@/hooks/useQuotes";

export default function QuotesPage() {
  const t = useTranslations("Quotes");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { data: quotes, isLoading, error } = useQuotes();

  const filteredQuotes = Array.isArray(quotes)
    ? quotes.filter(
        (quote: Quote) =>
          quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.clients?.company?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          quote.clients?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          quote.clients?.email?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/quotes/add"
        createLabel={t("create_quote")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_quotes")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div>
        {viewMode === "table" ? (
          <QuotesTable data={filteredQuotes} isLoading={isLoading} error={error as Error | null} />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredQuotes}
              isLoading={isLoading}
              error={error as Error | null}
              emptyMessage={t("no_quotes")}
              addFirstItemMessage={t("add_first_quote")}
              renderItem={(quote: Quote) => <QuoteCard key={quote.id} quote={quote} />}
              gridCols="2"
            />
          </div>
        )}
      </div>
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
