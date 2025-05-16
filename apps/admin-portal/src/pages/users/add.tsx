import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyUser } from "@/lib/dummy-factory";

import { UserForm } from "@/user/user.form";
import { useCreateUser } from "@/user/user.hooks";

export default function AddUserPage() {
  const t = useTranslations();
  const router = useRouter();
  const createUser = useCreateUser();

  return (
    <div>
      <CustomPageMeta title={t("Pages.Users.add")} />
      <PageTitle
        formButtons
        formId="user-form"
        loading={createUser.isPending}
        onCancel={() => router.push("/users")}
        texts={{
          title: t("Pages.Users.add"),
          submit_form: t("Pages.Users.add"),
          cancel: t("General.cancel"),
        }}
        dummyButton={generateDummyUser}
      />
      <UserForm
        formHtmlId="user-form"
        onSuccess={() =>
          router.push("/users").then(() => {
            createUser.reset();
          })
        }
      />
    </div>
  );
}

AddUserPage.messages = ["Metadata", "Notes", "Pages", "Users", "General"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(
        (await import(`../../../locales/${locale}.json`)).default,
        AddUserPage.messages,
      ),
    },
  };
};
