import { Building2, Mail, Phone, MapPin, NotebookText, Tag } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import ClientCard from "@/components/app/client/client.card";
import VendorCard from "@/components/app/vendor/vendor.card";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Client } from "@/types/client.type";
import { Vendor } from "@/types/vendor.type";

import { useClients } from "@/hooks/useClients";
import { useVendors } from "@/hooks/useVendors";

export default function ContactsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"clients" | "vendors">("clients");

  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients();
  const { data: vendors, isLoading: vendorsLoading, error: vendorsError } = useVendors();

  return (
    <div>
      <CustomPageMeta title={t("Contacts.title")} description={t("Contacts.description")} />
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
              renderItem={(client) => <ClientCard client={client} />}
              gridCols="3"
            />
          </TabsContent>

          <TabsContent value="vendors">
            <DataModelList
              data={vendors as Vendor[]}
              isLoading={vendorsLoading}
              error={vendorsError instanceof Error ? vendorsError : null}
              emptyMessage={t("Vendors.no_vendors")}
              renderItem={(vendor) => <VendorCard vendor={vendor} />}
              gridCols="3"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
