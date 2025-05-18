import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyCar } from "@/lib/dummy-factory";

import { CarForm } from "@/car/car.form";
import useCarStore from "@/car/car.store";

export default function AddCarPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useCarStore((state) => state.setIsLoading);
  const isLoading = useCarStore((state) => state.isLoading);

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
        dummyButton={generateDummyCar}
      />

      <CarForm
        formHtmlId="car-form"
        onSuccess={() => {
          router.push("/cars").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddCarPage.messages = [
  "Metadata",
  "Pages",
  "Cars",
  "Vehicles",
  "Notes",
  "Forms",
  "General",
  "PaymentCycles",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddCarPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
