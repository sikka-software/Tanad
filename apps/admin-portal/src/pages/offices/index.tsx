import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Building2, Mail, Phone, MapPin } from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import OfficesTable from "@/components/tables/offices-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useOffices } from "@/hooks/useOffices";
import { Office } from "@/types/office.type";

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

  const renderOffice = (office: Office) => (
    <Card key={office.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{office.name}</h3>
        <p className="text-sm text-gray-500">{office.email || "Unknown Email"}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${office.email}`} className="hover:text-primary">
              {office.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${office.phone}`} className="hover:text-primary">
              {office.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{office.address}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{office.address}</p>
              <p>{`${office.city}, ${office.state} ${office.zip_code}`}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
              renderItem={renderOffice}
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
