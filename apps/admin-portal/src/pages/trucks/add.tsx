import useTruckStore from "@root/src/modules/truck/truck.store";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { TruckForm } from "@/modules/truck/truck.form";

export default function AddTruckPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useTruckStore((state) => state.setIsLoading);
  const isLoading = useTruckStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).truckForm;
    if (form) {
      form.setValue("name", dummyData.first_name);
      form.setValue("make", dummyData.last_name);
      form.setValue("model", dummyData.email);
      form.setValue("year", dummyData.randomNumber);
      form.setValue("color", dummyData.randomString);
      form.setValue("vin", dummyData.randomNumber);
      form.setValue("code", dummyData.randomNumber);
      form.setValue("license_country", dummyData.randomNumber);
      form.setValue("license_plate", dummyData.randomNumber);
      form.setValue("notes", dummyData.state);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Trucks.add")} />
      <PageTitle
        formButtons
        formId="truck-form"
        loading={isLoading}
        onCancel={() => router.push("/trucks")}
        texts={{
          title: t("Pages.Trucks.add"),
          submit_form: t("Pages.Trucks.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <TruckForm
        formHtmlId="truck-form"
        onSuccess={() => {
          router.push("/trucks");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddTruckPage.messages = ["Pages", "Trucks", "Notes", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddTruckPage.messages,
      ),
    },
  };
};
