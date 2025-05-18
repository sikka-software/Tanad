import { pick } from "lodash";
import { Plus, User } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { buttonVariants } from "@/ui/button";
import DataModelList from "@/ui/data-model-list";
import PageTitle from "@/ui/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { useCompanies } from "@/company/company.hooks";
import { Company } from "@/company/company.type";

import ClientCard from "@/client/client.card";
import { useClients } from "@/client/client.hooks";
import { Client } from "@/client/client.type";

import VendorCard from "@/vendor/vendor.card";
import { useVendors } from "@/vendor/vendor.hooks";
import { Vendor } from "@/vendor/vendor.type";

export default function ContactsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"clients" | "vendors">("clients");

  const { data: companies } = useCompanies();
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients();
  const { data: vendors, isLoading: vendorsLoading, error: vendorsError } = useVendors();

  return (
    <div>
      <CustomPageMeta title={t("Contacts.title")} description={t("Contacts.description")} />
      <PageTitle
        texts={{
          title: t("Contacts.title"),
          submit_form: t("Contacts.add_client"),
          cancel: t("General.cancel"),
        }}
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
              empty={{
                title: t("Clients.create_first.title"),
                description: t("Clients.create_first.description"),
                add: t("Pages.Clients.add"),
                icons: [User, Plus, User],
                onClick: () => router.push(router.pathname + "/add"),
              }}
              renderItem={(client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  company={companies?.find((company) => company.id === client.company) as Company}
                  onActionClicked={() => console.log("TODO")}
                />
              )}
              gridCols="3"
            />
          </TabsContent>

          <TabsContent value="vendors">
            <DataModelList
              data={vendors as Vendor[]}
              isLoading={vendorsLoading}
              error={vendorsError instanceof Error ? vendorsError : null}
              empty={{
                title: t("Vendors.create_first.title"),
                description: t("Vendors.create_first.description"),
                add: t("Pages.Vendors.add"),
                icons: [User, Plus, User],
                onClick: () => router.push(router.pathname + "/add"),
              }}
              renderItem={(vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onActionClicked={() => console.log("TODO")}
                />
              )}
              gridCols="3"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

ContactsPage.messages = ["Metadata", "Pages", "General", "Contacts"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, ContactsPage.messages),
    },
  };
};
