import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "sonner";

import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { UserForm } from "@/modules/user/user.form";
import { useUserStore } from "@/modules/user/user.store";

export default function AddUserPage() {
  const t = useTranslations();
  const router = useRouter();

  const setIsLoading = useUserStore((state) => state.setIsLoading);
  const isLoading = useUserStore((state) => state.isLoading);

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).userForm;
    if (form) {
      form.setValue("email", dummyData.email);
      form.setValue("role", "user");
    }
  };

  const onAddSuccess = () => {
    toast.success(t("General.successful_operation"), {
      description: t("Users.success.created"),
    });
    router.push("/users");
    setIsLoading(false);
  };

  return (
    <div>
      <CustomPageMeta title={t("Users.add_new")} />
      <PageTitle
        formButtons
        formId="user-form"
        loading={isLoading}
        onCancel={() => router.push("/users")}
        dummyButton={handleDummyData}
        texts={{
          title: t("Users.add_new"),
          submit_form: t("Users.add_new"),
          cancel: t("General.cancel"),
        }}
      />
      <div className="mx-auto max-w-2xl p-4">
        <UserForm id="user-form" onSuccess={onAddSuccess} />
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
