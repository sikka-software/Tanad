import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { DocumentForm } from "@/document/document.form";
import useDocumentStore from "@/document/document.store";

export default function AddDocumentPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useDocumentStore((state) => state.setIsLoading);
  const isLoading = useDocumentStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Documents.add")} />
      <PageTitle
        formButtons
        formId="document-form"
        loading={isLoading}
        onCancel={() => router.push("/documents")}
        texts={{
          title: t("Pages.Documents.add"),
          submit_form: t("Pages.Documents.add"),
          cancel: t("General.cancel"),
        }}
      />

      <DocumentForm
        formHtmlId="document-form"
        onSuccess={() => {
          router.push("/documents").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddDocumentPage.messages = ["Metadata", "Pages", "Documents", "Notes", "General", "PaymentCycles"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const messages = pick(
      (await import(`../../../locales/${locale}.json`)).default,
      AddDocumentPage.messages,
    );
    return { props: { messages } };
  } catch (error) {
    console.error("Error loading messages:", error);
    return { props: { messages: {} } };
  }
};
