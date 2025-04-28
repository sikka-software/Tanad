import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import DataPageLayout from "@/components/layouts/data-page-layout";

import { RoleForm } from "@/modules/role/role.form";

export default function AddRolePage() {
  const t = useTranslations();

  return (
    <div>
      <CustomPageMeta title={t("Roles.add_new")} description={t("Roles.add_description")} />
      <DataPageLayout>
        <div className="container mx-auto p-4">
          <RoleForm />
        </div>
      </DataPageLayout>
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
