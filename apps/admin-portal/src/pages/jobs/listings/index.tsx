import { useState } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import JobListingCard from "@/components/app/job-listing/job-listing.card";
import DataPageLayout from "@/components/layouts/data-page-layout";
import PageSearchAndFilter from "@/components/ui/page-search-and-filter";

import { JobListing } from "@/types/job-listing.type";

import { useJobListings } from "@/hooks/useJobListings";

export default function JobListingsPage() {
  const t = useTranslations("Jobs");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { jobListings, isLoading } = useJobListings();

  const filteredListings = (jobListings || []).filter(
    (listing: JobListing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  const handleCreateListing = () => {
    router.push("/jobs/listings/add");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
        {filteredListings.map((listing: JobListing) => (
          <JobListingCard key={listing.id} jobListing={listing} />
        ))}
      </div>
    </DataPageLayout>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
