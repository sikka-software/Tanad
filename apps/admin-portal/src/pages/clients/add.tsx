import { useQueryClient } from "@tanstack/react-query";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import PageTitle from "@/ui/page-title";

import { ClientForm, type ClientFormValues } from "@/modules/client/client.form";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { generateDummyData } from "@/lib/dummy-generator";

import { createClient } from "@/services/clientService";

import { Client, ClientCreateData } from "@/types/client.type";

import { clientKeys } from "@/hooks/models/useClients";
import useUserStore from "@/stores/use-user-store";

export default function AddClientPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const handleSubmit = async (data: ClientFormValues) => {
    setLoading(true);
    try {
      const clientData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company || null,
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip_code: data.zip_code.trim(),
        notes: data.notes?.trim() || null,
      };

      let result: Client;

      const clientCreateData = {
        ...clientData,
        user_id: user?.id,
      };

      result = await createClient(clientCreateData as ClientCreateData);

      toast.success(t("General.successful_operation"), {
        description: t("Clients.success.created"),
      });

      const previousClients = queryClient.getQueryData(clientKeys.lists()) || [];
      queryClient.setQueryData(clientKeys.lists(), [
        ...(Array.isArray(previousClients) ? previousClients : []),
        result,
      ]);

      router.push("/clients");
    } catch (error) {
      console.error("Failed to save client:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Clients.error.create"),
      });
      setLoading(false);
    }
  };

  const handleDummyData = () => {
    const dummyData = generateDummyData();
    const form = (window as any).clientForm;
    if (form) {
      form.setValue("name", dummyData.name);
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
        title={t("Clients.add_new")}
        formButtons
        formId="client-form"
        loading={loading}
        onCancel={() => router.push("/clients")}
        texts={{
          submit_form: t("Clients.add_new"),
          cancel: t("General.cancel"),
        }}
        customButton={
          process.env.NODE_ENV === "development" && (
            <Button variant="outline" size="sm" onClick={handleDummyData}>
              Dummy Data
            </Button>
          )
        }
      />

      <div className="mx-auto max-w-2xl p-4">
        <ClientForm id="client-form" user_id={user?.id} onSubmit={handleSubmit} loading={loading} />
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
