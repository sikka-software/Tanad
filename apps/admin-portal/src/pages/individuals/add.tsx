import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyIndividual } from "@/lib/dummy-factory";

import IndividualForm from "@/individual/individual.form";
import useIndividualStore from "@/individual/individual.store";

export default function AddIndividualPage() {
  const router = useRouter();
  const t = useTranslations();
  const setIsLoading = useIndividualStore((state) => state.setIsLoading);
  const isLoading = useIndividualStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Individuals.add")} />
      <PageTitle
        formButtons
        formId="individual-form"
        loading={isLoading}
        onCancel={() => router.push("/individuals")}
        dummyButton={generateDummyIndividual}
        texts={{
          title: t("Pages.Individuals.add"),
          submit_form: t("Pages.Individuals.add"),
          cancel: t("General.cancel"),
        }}
      />

      <IndividualForm
        formHtmlId="individual-form"
        onSuccess={() => {
          router.push("/individuals").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddIndividualPage.messages = ["Metadata", "Pages", "Individuals", "Forms", "Notes", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddIndividualPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
