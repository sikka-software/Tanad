import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { JobListingForm } from "@/job-listing/job-listing.form";
import useJobListingsStore from "@/job-listing/job-listing.store";

export default function AddJobListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const setIsLoading = useJobListingsStore((state) => state.setIsLoading);
  const loading = useJobListingsStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.JobListings.add")} />

      <PageTitle
        formButtons
        formId="job-listing-form"
        loading={loading}
        onCancel={() => router.push("/job_listings")}
        texts={{
          title: t("Pages.JobListings.add"),
          submit_form: t("Pages.JobListings.add"),
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

AddJobListingPage.messages = ["Notes", "Pages", "JobListings", "Settings", "Jobs", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddJobListingPage.messages,
      ),
    },
  };
};
