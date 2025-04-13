import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import {
  Mail,
  Phone,
  MapPin,
  NotebookText, // Added NotebookText for notes
} from "lucide-react";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataModelList from "@/components/ui/data-model-list";
import PageTitle from "@/components/ui/page-title";
import { useVendors } from "@/hooks/useVendors";
import type { Vendor } from "@/types/vendor.type";

// Assuming a useVendors hook exists or will be created
export default function VendorsPage() {
  const t = useTranslations(); // Use Vendors namespace
  const { data: vendors, isLoading, error } = useVendors(); // Use the hook

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
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${vendor.email}`} className="hover:text-primary">
              {vendor.email}
            </a>
          </div>
          {/* Phone */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <a href={`tel:${vendor.phone}`} className="hover:text-primary">
              {vendor.phone}
            </a>
          </div>
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p>{vendor.address}</p>
              <p>{`${vendor.city}, ${vendor.state} ${vendor.zipCode}`}</p>
            </div>
          </div>
          {/* Notes */}
          {vendor.notes && (
            <div className="flex items-start gap-2 border-t pt-3 text-sm text-gray-500">
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
      <PageTitle
        title={t("Vendors.title")} // Ensure translation key exists
        createButtonLink="/vendors/add" // Link to add vendor page
        createButtonText={t("Vendors.add_new")} // Ensure translation key exists
        createButtonDisabled={isLoading}
      />
      <div className="p-4">
        <DataModelList
          data={vendors}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          emptyMessage={t("Vendors.no_vendors")} // Ensure translation key exists
          renderItem={renderVendor}
          gridCols="3" // Adjust grid columns as needed
          // Assuming DataModelList has props for edit/delete actions if needed
          // editAction={(item) => router.push(`/vendors/${item.id}/edit`)}
          // deleteAction={(item) => handleDelete(item.id)} // Requires a delete handler
        />
      </div>
    </DataPageLayout>
  );
}

// Add getStaticProps for translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // Ensure locale is defined, provide a default if necessary
  const effectiveLocale = locale ?? "en"; // Default to 'en' if locale is undefined
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
