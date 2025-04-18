import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import {
  JobListingForm,
  type JobListingFormValues,
} from "@/components/app/job-listing/job-listing.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";

import useUserStore from "@/stores/use-user-store";
import { useJobListings } from "@/hooks/models/useJobListings";

export default function AddJobListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { createJobListing } = useJobListings();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: JobListingFormValues) => {
    if (!user?.id) {
      toast.error(t("JobListings.messages.auth_required"));
      return;
    }

    setLoading(true);
    try {
      await createJobListing.mutateAsync({
        ...data,
        user_id: user.id,
      });

      toast.success(t("General.successful_operation"), {
        description: t("JobListings.messages.listing_created"),
      });
      router.push("/jobs/listings");
    } catch (error: any) {
      console.error("Error creating job listing:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("JobListings.messages.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("JobListings.add_new_listing")}
        formButtons
        formId="job-listing-form"
        loading={loading}
        onCancel={() => router.push("/jobs/listings")}
        texts={{
          submit_form: t("JobListings.add_new_listing"),
          cancel: t("General.cancel"),
        }}
      />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("JobListings.listing_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <JobListingForm id="job-listing-form" onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
