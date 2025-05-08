import useCarStore from "@root/src/modules/car/car.store";
import { GetStaticProps } from "next";
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
      <CustomPageMeta title={t("Cars.add_new")} />
      <PageTitle
        formButtons
        formId="car-form"
        loading={isLoading}
        onCancel={() => router.push("/cars")}
        texts={{
          title: t("Cars.add_new"),
          submit_form: t("Cars.add_new"),
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../locales/${locale}.json`)).default,
    },
  };
};
