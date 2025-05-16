import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyOffice } from "@/lib/dummy-factory";

import { OfficeForm } from "@/office/office.form";
import useOfficeStore from "@/office/office.store";

export default function AddOfficePage() {
  const t = useTranslations();
  const router = useRouter();
  const isLoading = useOfficeStore((state) => state.isLoading);
  const setIsLoading = useOfficeStore((state) => state.setIsLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Offices.add")} />
      <PageTitle
        formButtons
        formId="office-form"
        loading={isLoading}
        onCancel={() => router.push("/offices")}
        texts={{
          title: t("Pages.Offices.add"),
          submit_form: t("Pages.Offices.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyOffice}
      />

      <OfficeForm
        formHtmlId="office-form"
        onSuccess={() => {
          router.push("/offices").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddOfficePage.messages = [
  "Metadata",
  "Offices",
  "Employees",
  "Jobs",
  "Departments",
  "Pages",
  "Notes",
  "General",
  "Forms",
  "CommonStatus",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddOfficePage.messages,
      ),
    },
  };
};
