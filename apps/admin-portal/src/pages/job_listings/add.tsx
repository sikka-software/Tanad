import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";

import { JobListingForm, type JobListingFormValues } from "@/job-listing/job-listing.form";
import { useCreateJobListing } from "@/job-listing/job-listing.hooks";
import useJobListingsStore from "@/job-listing/job-listing.store";

import useUserStore from "@/stores/use-user-store";

export default function AddJobListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const setIsLoading = useJobListingsStore((state) => state.setIsLoading);
  const loading = useJobListingsStore((state) => state.isLoading);

  return (
    <div>
      <PageTitle
        formButtons
        formId="job-listing-form"
        loading={loading}
        onCancel={() => router.push("/job_listings")}
        texts={{
          title: t("JobListings.add_new"),
          submit_form: t("JobListings.add_new"),
          cancel: t("General.cancel"),
        }}
      />

      <JobListingForm
        formHtmlId="job-listing-form"
        onSuccess={() => {
          router.push("/job_listings");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
