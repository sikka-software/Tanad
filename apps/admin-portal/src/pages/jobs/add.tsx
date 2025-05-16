import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyJob } from "@/lib/dummy-factory";

import JobForm from "@/job/job.form";
import useJobStore from "@/job/job.store";

export default function AddJobPage() {
  const t = useTranslations();
  const router = useRouter();

  const isLoading = useJobStore((state) => state.isLoading);
  const setIsLoading = useJobStore((state) => state.setIsLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Jobs.add")} />
      <PageTitle
        formButtons
        formId="job-form"
        loading={isLoading}
        onCancel={() => router.push("/jobs")}
        texts={{
          title: t("Pages.Jobs.add"),
          submit_form: t("Pages.Jobs.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyJob}
      />

      <JobForm
        formHtmlId="job-form"
        onSuccess={() => {
          router.push("/jobs").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddJobPage.messages = ["Metadata",
  "Notes",
  "Pages",
  "Jobs",
  "Branches",
  "Warehouses",
  "Forms",
  "OnlineStores",
  "Offices",
  "Departments",
  "General",
];
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddJobPage.messages,
      ),
    },
  };
};
