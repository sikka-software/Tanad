import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import OfficeCard from "@/components/app/office/office.card";
import OfficesTable from "@/components/app/office/office.table";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { useOffices } from "@/hooks/useOffices";

export default function OfficesPage() {
  const t = useTranslations();
  const { data: offices, isLoading, error } = useOffices();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredOffices = offices?.filter(
    (office) =>
      office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("Offices.title")}
        createHref="/offices/add"
        createLabel={t("Offices.add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("Offices.search_offices")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div>
        {viewMode === "table" ? (
          <OfficesTable
            data={filteredOffices || []}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
          />
        ) : (
          <div className="p-4">
            <DataModelList
              data={filteredOffices || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              emptyMessage={t("Offices.no_offices_found")}
              renderItem={(office) => <OfficeCard office={office} />}
              gridCols="3"
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
