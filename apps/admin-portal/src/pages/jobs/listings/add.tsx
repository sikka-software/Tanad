import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { JobListingForm, type JobListingFormValues } from "@/components/forms/job-listing-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { useJobListings } from "@/hooks/useJobListings";
import useUserStore from "@/hooks/use-user-store";

export default function AddJobListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { createJobListing } = useJobListings();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: JobListingFormValues) => {
    if (!user?.id) {
      toast.error(t("Jobs.messages.auth_required"));
      return;
    }

    setLoading(true);
    try {
      await createJobListing.mutateAsync({
        ...data,
        userId: user.id,
      });

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

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      messages: (await import(`../../../../locales/${locale}.json`)).default,
    },
  };
};
