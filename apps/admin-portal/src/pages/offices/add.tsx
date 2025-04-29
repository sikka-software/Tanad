import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { OfficeForm } from "@/modules/office/office.form";
import useOfficeStore from "@/modules/office/office.store";

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
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zip_code", dummyData.zip_code);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Offices.add_new")} />
      <PageTitle
        formButtons
        formId="office-form"
        loading={isLoading}
        onCancel={() => router.push("/offices")}
        texts={{
          title: t("Offices.add_new"),
          submit_form: t("Offices.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <div className="mx-auto max-w-2xl p-4">
        <OfficeForm
          id="office-form"
          onSuccess={() =>
            router.push("/offices").then(() => {
              setIsLoading(false);
            })
          }
        />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
