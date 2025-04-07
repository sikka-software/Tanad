import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

import { Client } from "@/api/clients";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";

export default function ClientsPage() {
  const t = useTranslations("Clients");
  const { data: clients, isLoading, error } = useClients();

  const renderClient = (client: Client) => (
    <Card key={client.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{client.name}</h3>
        <p className="text-sm text-gray-500">{client.company}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${client.email}`} className="hover:text-primary">
              {client.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <a href={`tel:${client.phone}`} className="hover:text-primary">
              {client.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>{client.company}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-1 h-4 w-4" />
            <div>
              <p>{client.address}</p>
              <p>{`${client.city}, ${client.state} ${client.zip_code}`}</p>
            </div>
          </div>
          {client.notes && (
            <p className="mt-2 border-t pt-2 text-sm text-gray-500">{client.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto space-y-4">
      <PageTitle
        title={t("title")}
        createButtonLink="/clients/add"
        createButtonText={t("create_client")}
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={clients}
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
