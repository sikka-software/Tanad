import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import VendorCard from "@/components/app/vendor/vendor.card";
import VendorsTable from "@/components/app/vendor/vendor.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { useVendors } from "@/hooks/useVendors";

// Assuming a useVendors hook exists or will be created
export default function VendorsPage() {
  const t = useTranslations();
  const { data: vendors, isLoading, error } = useVendors();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredVendors = vendors?.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <CustomPageMeta title={t("Vendors.title")} description={t("Vendors.description")} />

      <DataPageLayout>
        <PageSearchAndFilter
          title={t("Vendors.title")}
          createHref="/vendors/add"
          createLabel={t("Vendors.add_new")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Vendors.search_vendors")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div>
          {viewMode === "table" ? (
            <VendorsTable
              data={filteredVendors || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredVendors || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Vendors.no_vendors")}
                renderItem={(vendor) => <VendorCard key={vendor.id} vendor={vendor} />}
                gridCols="3"
              />
            </div>
          )}
        </div>
      </DataPageLayout>
    </div>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
