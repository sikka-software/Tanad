import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import DataPageLayout from "@/components/layouts/data-page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";
import { JobListing } from "@/types/job-listing.type";

export default function JobListingsPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<JobListing[]>([]); // TODO: Replace with API call
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  const handleCreateListing = () => {
    router.push("/jobs/listings/create");
  };

  const renderListing = (listing: JobListing) => (
    <Card key={listing.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{listing.title}</h3>
            <p className="text-sm text-gray-500">{listing.jobs?.length || 0} jobs</p>
          </div>
          <Badge variant={listing.isActive ? "default" : "secondary"}>
            {listing.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {listing.description && <p className="text-sm text-gray-600">{listing.description}</p>}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Created: {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataPageLayout>
      <PageSearchAndFilter
        createHref="/jobs/listings/add"
        createLabel={t("create_listing")}
        onSearch={setSearchQuery}
        searchPlaceholder={t("search_listings")}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredListings.map(renderListing)}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
