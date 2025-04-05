import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Building2, Mail, Phone, MapPin } from "lucide-react";

import { Client } from "@/api/clients";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";

export default function ClientsPage() {
  const t = useTranslations("Clients");
  const { data: clients = [], isLoading, error } = useClients();

  if (isLoading) {
    return (
      <div className="mx-auto space-y-4">
        <PageTitle
          title={t("title")}
          createButtonLink="/clients/add"
          createButtonText={t("create_client")}
          createButtonDisabled
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error instanceof Error ? error.message : "An error occurred while fetching clients"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <PageTitle
        title={t("title")}
        createButtonLink="/clients/add"
        createButtonText={t("create_client")}
      />

      <div className="p-4">
        {clients.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">{t("no_clients_found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client: Client) => (
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
            ))}
          </div>
        )}
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
