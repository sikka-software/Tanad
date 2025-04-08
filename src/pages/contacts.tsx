import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Building2, Mail, Phone, MapPin, NotebookText, Tag } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClients } from "@/hooks/useClients";
import { useVendors } from "@/hooks/useVendors";
import { Client } from "@/types/client.type";
import { Vendor } from "@/types/vendor.type";

export default function ContactsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"clients" | "vendors">("clients");

  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients();
  const { data: vendors, isLoading: vendorsLoading, error: vendorsError } = useVendors();

  const renderClient = (client: Client) => (
    <Card key={client.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{client.name}</h3>
            <p className="text-sm text-gray-500">{client.company}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
            {t("Contacts.client_label")}
          </span>
        </div>
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
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderVendor = (vendor: Vendor) => (
    <Card key={vendor.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{vendor.name}</h3>
            {vendor.company && <p className="text-sm text-gray-500">{vendor.company}</p>}
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
            {t("Contacts.vendor_label")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${vendor.email}`} className="hover:text-primary">
              {vendor.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <a href={`tel:${vendor.phone}`} className="hover:text-primary">
              {vendor.phone}
            </a>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{vendor.address}</p>
              <p>{`${vendor.city}, ${vendor.state} ${vendor.zip_code}`}</p>
            </div>
          </div>
          {vendor.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
              <NotebookText className="mt-1 h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{vendor.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageTitle
        title={t("Contacts.title")}
        customButton={
          <div className="flex gap-3">
            <Link href="/clients/add" className={buttonVariants({ variant: "outline" })}>
              {t("Contacts.add_client")}
            </Link>
            <Link href="/vendors/add" className={buttonVariants({ variant: "default" })}>
              {t("Contacts.add_vendor")}
            </Link>
          </div>
        }
      />

      <div className="p-4">
        <Tabs
          defaultValue="clients"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "clients" | "vendors")}
          className="mb-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="clients">{t("Contacts.clients_tab")}</TabsTrigger>
            <TabsTrigger value="vendors">{t("Contacts.vendors_tab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <DataModelList
              data={clients as Client[]}
              isLoading={clientsLoading}
              error={clientsError instanceof Error ? clientsError : null}
              emptyMessage={t("Clients.no_clients_found")}
              renderItem={renderClient}
              gridCols="3"
            />
          </TabsContent>

          <TabsContent value="vendors">
            <DataModelList
              data={vendors as Vendor[]}
              isLoading={vendorsLoading}
              error={vendorsError instanceof Error ? vendorsError : null}
              emptyMessage={t("Vendors.no_vendors_found")}
              renderItem={renderVendor}
              gridCols="3"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
