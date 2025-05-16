import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyBranch } from "@/lib/dummy-factory";

import { BranchForm } from "@/branch/branch.form";
import useBranchStore from "@/branch/branch.store";

export default function AddBranchPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useBranchStore((state) => state.setIsLoading);
  const isLoading = useBranchStore((state) => state.isLoading);

  return (
    <div>
      <CustomPageMeta title={t("Pages.Branches.add")} />
      <PageTitle
        formButtons
        formId="branch-form"
        loading={isLoading}
        onCancel={() => router.push("/branches")}
        texts={{
          title: t("Pages.Branches.add"),
          submit_form: t("Pages.Branches.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyBranch}
      />

      <BranchForm
        formHtmlId="branch-form"
        onSuccess={() => {
          router.push("/branches").then(() => {
            setIsLoading(false);
          });
        }}
      />
    </div>
  );
}

AddBranchPage.messages = ["Metadata", "Pages", "Branches", "Forms", "Notes", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddBranchPage.messages,
      ),
    },
  };
};
