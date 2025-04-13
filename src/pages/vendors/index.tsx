import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import {
  Mail,
  Phone,
  MapPin,
  NotebookText, // Added NotebookText for notes
} from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import VendorsTable from "@/components/tables/vendors-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useVendors } from "@/hooks/useVendors";
import type { Vendor } from "@/types/vendor.type";

// Assuming a useVendors hook exists or will be created
export default function VendorsPage() {
  const t = useTranslations("Vendors");
  const { data: vendors, isLoading, error } = useVendors();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredVendors = vendors?.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render function for a single vendor card
  const renderVendor = (vendor: Vendor) => (
    <Card key={vendor.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{vendor.name}</h3>
        {/* Display company if available */}
        {vendor.company && <p className="text-sm text-gray-500">{vendor.company}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${vendor.email}`} className="hover:text-primary">
              {vendor.email}
            </a>
          </div>
          {/* Phone */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${vendor.phone}`} className="hover:text-primary">
              {vendor.phone}
            </a>
          </div>
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{vendor.address}</p>
              <p>{`${vendor.city}, ${vendor.state} ${vendor.zipCode}`}</p>
            </div>
          </div>
          {/* Notes */}
          {vendor.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500 dark:text-gray-400">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{vendor.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      {/* Consider adding Edit/Delete actions here if DataModelList doesn't handle it */}
    </Card>
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/vendors/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_vendors")}
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
              emptyMessage={t("no_vendors")}
              renderItem={renderVendor}
              gridCols="3"
            />
          </div>
        )}
      </div>
    </DataPageLayout>
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
