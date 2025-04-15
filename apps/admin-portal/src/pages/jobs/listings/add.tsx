import { useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JobListingForm, type JobListingFormValues } from "@/components/forms/job-listing-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function AddJobListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: JobListingFormValues) => {
    setLoading(true);
    try {
      const { data: newListing, error } = await supabase
        .from("job_listings")
        .insert([
          {
            title: data.title.trim(),
            description: data.description?.trim() || null,
            jobs: data.jobs,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the job listings cache to include the new listing
      const previousListings = queryClient.getQueryData(["job_listings"]) || [];
      queryClient.setQueryData(
        ["job_listings"],
        [...(Array.isArray(previousListings) ? previousListings : []), newListing],
      );

      toast.success(t("Jobs.messages.listing_created"));
      router.push("/jobs/listings");
    } catch (error: any) {
      console.error("Error creating job listing:", error);
      toast.error(error.message || t("Jobs.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Jobs.add_new_listing")}
        formButtons
        formId="job-listing-form"
        loading={loading}
        onCancel={() => router.push("/jobs/listings")}
        texts={{
          submit_form: t("Jobs.add_new_listing"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Jobs.listing_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <JobListingForm id="job-listing-form" onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
