import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { OfficeForm } from "@/office/office.form";
import useOfficeStore from "@/office/office.store";

export default function AddOfficePage() {
  const t = useTranslations();
  const router = useRouter();
  const isLoading = useOfficeStore((state) => state.isLoading);
  const setIsLoading = useOfficeStore((state) => state.setIsLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).officeForm;
    if (form) {
      form.setValue("name", "Office " + dummyData.randomNumber);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("building_number", String(dummyData.address));
      form.setValue("street_name", dummyData.city);
      form.setValue("city", dummyData.state);
      form.setValue("zip_code", String(dummyData.zip_code));
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Offices.add_new")} />
      <PageTitle
        formButtons
        formId="office-form"
        loading={isLoading}
        onCancel={() => router.push("/offices")}
        texts={{
          title: t("Pages.Offices.add_new"),
          submit_form: t("Pages.Offices.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <OfficeForm
        formHtmlId="office-form"
        onSuccess={() =>
          router.push("/offices").then(() => {
            setIsLoading(false);
          })
        }
      />
    </div>
  );
}

AddOfficePage.messages = ["Offices", "Pages", "General", "Forms"];

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
