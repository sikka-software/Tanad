import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { RoleForm } from "@/role/role.form";

import useEnterpriseUserStore from "@/user/user.store";

export default function AddRolePage() {
  const t = useTranslations();
  const router = useRouter();

  const setIsLoading = useEnterpriseUserStore((state) => state.setIsLoading);
  const isLoading = useEnterpriseUserStore((state) => state.isLoading);

  const handleDummyData = () => {};

  return (
    <div>
      <CustomPageMeta title={t("Roles.add_new")} />
      <PageTitle
        formButtons
        formId="role-form"
        loading={isLoading}
        onCancel={() => router.push("/roles")}
        texts={{
          title: t("Roles.add_new"),
          submit_form: t("Roles.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <div className="mx-auto max-w-2xl p-4">
        <RoleForm
          formHtmlId="role-form"
          onSuccess={() =>
            router.push("/roles").then(() => {
              setIsLoading(false);
            })
          }
        />
      </div>
    </div>
  );
}

AddRolePage.messages = ["Pages", "Roles", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddRolePage.messages,
      ),
    },
  };
};
