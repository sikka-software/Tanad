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
  const createUser = useCreateUser();

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
    toast.success(t("General.successful_operation"), {
      description: t("Users.success.created"),
    });
    router.push("/users");
  };

  const handleFormSubmit = async (data: UserCreateData) => {
    try {
      await createUser.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(t("General.error_operation"), {
        description: t("Users.error.creating"),
      });
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Users.add_new")} />
      <PageTitle
        formButtons
        formId="user-form"
        loading={createUser.isPending}
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
          onSubmitRequest={handleFormSubmit}
          isSubmitting={createUser.isPending}
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
