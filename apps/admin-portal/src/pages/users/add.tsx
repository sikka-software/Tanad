import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { UserForm } from "@/modules/user/user.form";
import { useCreateUser } from "@/modules/user/user.hooks";
import type { UserCreateData } from "@/modules/user/user.type";

export default function AddUserPage() {
  const t = useTranslations();
  const router = useRouter();
  // const createUser = useCreateUser(); // Temporarily comment out

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).userForm as ReturnType<typeof useForm> | undefined;
    if (form) {
      form.setValue("email", dummyData.email);
      form.setValue("first_name", dummyData.first_name);
      form.setValue("last_name", dummyData.last_name);
      form.setValue("password", "password123");
      form.setValue("role", "viewer");
    }
  };

  const onAddSuccess = () => {
    router.push("/users");
  };

  const handleFormSubmit = async (data: UserCreateData) => {
    // await createUser.mutateAsync(data);
  };

  return (
    <div>
      <CustomPageMeta title={t("Users.add_new")} />
      <PageTitle
        formButtons
        formId="user-form"
        loading={false}
        onCancel={() => router.push("/users")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Users.add_new"),
          submit_form: t("Users.add_new"),
          cancel: t("General.cancel"),
        }}
      />
      <div className="mx-auto max-w-2xl p-4">
        <UserForm
          id="user-form"
          onSuccess={onAddSuccess}
          onSubmitRequest={async (data) => { console.log("Dummy Submit:", data); await Promise.resolve(); }}
          isSubmitting={false}
        />
      </div>
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
