import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import JobForm from "@/job/job.form";
import useJobStore from "@/job/job.store";

export default function AddJobPage() {
  const t = useTranslations();
  const router = useRouter();

  const isLoading = useJobStore((state) => state.isLoading);
  const setIsLoading = useJobStore((state) => state.setIsLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).jobForm;
    if (form) {
      form.setValue("title", dummyData.job_title);
      form.setValue("description", dummyData.job_description);
      form.setValue("requirements", dummyData.requirements);
      form.setValue("location", dummyData.job_location);
      form.setValue("department", dummyData.job_department);
      form.setValue(
        "type",
        dummyData.randomPicker(["full_time", "part_time", "contract", "internship", "temporary"]),
      );
      form.setValue("salary", dummyData.job_salary);
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      // form.setValue("start_date", dummyData.job_start_date);
      // form.setValue("end_date", dummyData.job_end_date);
    }
  };

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
        dummyButton={handleDummyData}
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

AddJobPage.messages = [
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
