import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";

import { JobListingForm, type JobListingFormValues } from "@/job-listing/job-listing.form";
import { useCreateJobListing } from "@/job-listing/job-listing.hooks";

import useUserStore from "@/stores/use-user-store";

export default function AddJobListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { mutateAsync: createJobListing, isPending: isCreating } = useCreateJobListing();
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <PageTitle
        formButtons
        formId="job-listing-form"
        loading={loading}
        onCancel={() => router.push("/job_listings")}
        texts={{
          title: t("JobListings.add_new_listing"),
          submit_form: t("JobListings.add_new_listing"),
          cancel: t("General.cancel"),
        }}
      />

      <JobListingForm
        formHtmlId="job-listing-form"
        onSuccess={() => router.push("/job_listings")}
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
