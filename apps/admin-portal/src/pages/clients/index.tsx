import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ClientCard from "@/components/app/client/client.card";
import ClientsTable from "@/components/app/client/client.table";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { Client } from "@/types/client.type";

import { useClients } from "@/hooks/useClients";

export default function ClientsPage() {
  const t = useTranslations();
  const { data: clients, isLoading, error } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company_details?.name || "Unknown Company")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderClient = (client: Client) => <ClientCard client={client} />;

  return (
    <div>
      <CustomPageMeta title={t("Clients.title")} description={t("Clients.description")} />
      <DataPageLayout>
        <PageSearchAndFilter
          title={t("Clients.title")}
          createHref="/clients/add"
          createLabel={t("Clients.add_new")}
          onSearch={setSearchQuery}
          searchPlaceholder={t("Clients.search_clients")}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div>
          {viewMode === "table" ? (
            <ClientsTable
              data={filteredClients || []}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          ) : (
            <div className="p-4">
              <DataModelList
                data={filteredClients || []}
                isLoading={isLoading}
                error={error instanceof Error ? error : null}
                emptyMessage={t("Clients.no_clients_found")}
                renderItem={renderClient}
                gridCols="3"
              />
            </div>
          )}
        </div>
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
