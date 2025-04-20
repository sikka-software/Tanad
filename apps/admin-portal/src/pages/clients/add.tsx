import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { ClientForm, type ClientFormValues } from "@/modules/client/client.form";
import { clientKeys } from "@/modules/client/client.hooks";
import { createClient } from "@/modules/client/client.service";
import { Client, ClientCreateData } from "@/modules/client/client.type";
import useUserStore from "@/stores/use-user-store";

export default function AddClientPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).clientForm;
    if (form) {
      form.setValue("name", dummyData.full_name);
      form.setValue("email", dummyData.email);
      form.setValue("phone", dummyData.phone);
      form.setValue("address", dummyData.address);
      form.setValue("city", dummyData.city);
      form.setValue("state", dummyData.state);
      form.setValue("zip_code", dummyData.zip_code);
    }
  };

  return (
    <div>
      <CustomPageMeta title={t("Clients.add_new")} />
      <PageTitle
        formButtons
        formId="client-form"
        loading={loading}
        onCancel={() => router.push("/clients")}
        texts={{
          title: t("Clients.add_new"),
          submit_form: t("Clients.add_new"),
          cancel: t("General.cancel"),
        }}
        dummyButton={handleDummyData}
      />

      <div className="mx-auto max-w-2xl p-4">
        <ClientForm id="client-form" loading={loading} />
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
