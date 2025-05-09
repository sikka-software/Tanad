import { pick } from "lodash";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { BranchForm } from "@/branch/branch.form";
import useBranchStore from "@/branch/branch.store";

export default function AddBranchPage() {
  const router = useRouter();
  const t = useTranslations();

  const setIsLoading = useBranchStore((state) => state.setIsLoading);
  const isLoading = useBranchStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).branchForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("code", "BR-" + Math.random().toString(36).substr(2, 6));
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zip_code", dummyData.zip_code);
      form.setValue("status", dummyData.randomPicker(["active", "inactive"]));
      form.setValue("notes", "Test branch notes");
    }
  };

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
        dummyButton={handleDummyData}
      />

      <BranchForm
        formHtmlId="branch-form"
        onSuccess={() => {
          router.push("/branches");
          setIsLoading(false);
        }}
      />
    </div>
  );
}

AddBranchPage.messages = ["Pages", "Branches", "Forms", "Notes", "General"];

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddBranchPage.messages,
      ),
    },
  };
};
