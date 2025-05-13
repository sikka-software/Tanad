import useCarStore from "@root/src/modules/car/car.store";
import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { CarForm } from "@/modules/car/car.form";

export default function AddCarPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useCarStore((state) => state.setIsLoading);
  const isLoading = useCarStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).carForm;
    if (form) {
      form.setValue("name", dummyData.first_name);
      form.setValue("make", dummyData.last_name);
      form.setValue("model", dummyData.email);
      form.setValue("year", dummyData.randomNumber(4));
      form.setValue("color", dummyData.randomString);
      form.setValue("vin", dummyData.randomNumber(17));
      form.setValue("code", dummyData.randomNumber(3));
      form.setValue("license_country", dummyData.randomString);
      form.setValue("license_plate", dummyData.randomString);
      form.setValue("notes", dummyData.state);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Pages.Cars.add")} />
      <PageTitle
        formButtons
        formId="car-form"
        loading={isLoading}
        onCancel={() => router.push("/cars")}
        texts={{
          title: t("Pages.Cars.add"),
          submit_form: t("Pages.Cars.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <CarForm
        formHtmlId="car-form"
        onSuccess={() => {
          router.push("/cars");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddCarPage.messages = ["Pages", "Cars", "Vehicles", "Notes", "Forms", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddCarPage.messages,
      ),
    },
  };
};
