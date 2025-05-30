import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyVehicle } from "@/lib/dummy-factory";

import { VehicleForm } from "@/vehicle/vehicle.form";
import useVehicleStore from "@/vehicle/vehicle.store";

export default function AddVehiclePage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useVehicleStore((state) => state.setIsLoading);
  const isLoading = useVehicleStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Vehicles.add")} />
      <PageTitle
        formButtons
        formId="vehicle-form"
        loading={isLoading}
        onCancel={() => router.push("/vehicles")}
        texts={{
          title: t("Pages.Vehicles.add"),
          submit_form: t("Pages.Vehicles.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyVehicle}
      />

      <VehicleForm
        formHtmlId="vehicle-form"
        onSuccess={() => {
          router.push("/vehicles").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddVehiclePage.messages = [
  "Metadata",
  "Pages",
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
      AddVehiclePage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
