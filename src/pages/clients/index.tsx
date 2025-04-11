import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Building2, Mail, Phone, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/types/client.type";

export default function ClientsPage() {
  const t = useTranslations("Clients");
  const { data: clients, isLoading, error } = useClients();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderClient = (client: Client) => (
    <Card key={client.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{client.name}</h3>
        <p className="text-sm text-gray-500">{client.company}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${client.email}`} className="hover:text-primary">
              {client.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <a href={`tel:${client.phone}`} className="hover:text-primary">
              {client.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{client.company}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{client.address}</p>
              <p>{`${client.city}, ${client.state} ${client.zip_code}`}</p>
            </div>
          </div>
          {client.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500 dark:text-gray-400">
              {client.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageSearchAndFilter
        title={t("title")}
        createHref="/clients/add"
        createLabel={t("add_new")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_clients")}
      />
      <div className="p-4">
        <DataModelList
          data={filteredClients || []}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          emptyMessage={t("no_clients_found")}
          renderItem={renderClient}
          gridCols="3"
        />
      </div>
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
