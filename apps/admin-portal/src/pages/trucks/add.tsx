import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyTruck } from "@/lib/dummy-factory";

import { TruckForm } from "@/truck/truck.form";
import useTruckStore from "@/truck/truck.store";

export default function AddTruckPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useTruckStore((state) => state.setIsLoading);
  const isLoading = useTruckStore((state) => state.isLoading);

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
        dummyButton={generateDummyTruck}
      />

      <TruckForm
        formHtmlId="truck-form"
        onSuccess={() => {
          router.push("/trucks").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddTruckPage.messages = ["Metadata","Pages", "Trucks", "Vehicles", "Notes", "Forms", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddTruckPage.messages,
      ),
    },
  };
};
