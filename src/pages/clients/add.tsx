import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { ClientForm, type ClientFormValues } from "@/components/forms/client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import { clientKeys } from "@/hooks/useClients";

export default function AddClientPage() {
  const router = useRouter();
  const t = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        router.push("/auth/login");
      }
    };

    getUserId();
  }, [router]);

  const handleSubmit = async (data: ClientFormValues) => {
    setLoading(true);
    try {
      // Check if user ID is available
      if (!userId) {
        throw new Error(t("Clients.error.not_authenticated"));
      }

      const { data: newClient, error } = await supabase.from("clients").insert([
        {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          company: data.company?.trim() || "",
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zip_code: data.zip_code.trim(),
          notes: data.notes?.trim() || null,
          user_id: userId,
        },
      ]).select().single();

      if (error) throw error;

      // Update the clients cache to include the new client
      const previousClients = queryClient.getQueryData(clientKeys.lists()) || [];
      queryClient.setQueryData(
        clientKeys.lists(),
        [...(Array.isArray(previousClients) ? previousClients : []), newClient]
      );

      toast.success(t("Clients.success.title"), {
        description: t("Clients.success.created"),
      });

      router.push("/clients");
    } catch (error) {
      toast.error(t("Clients.error.title"), {
        description: error instanceof Error ? error.message : t("Clients.error.create"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("Clients.add_new")}
        createButtonLink="/clients"
        createButtonText={t("Clients.back_to_list")}
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/clients")}>
              {t("Clients.form.cancel")}
            </Button>
            <Button type="submit" size="sm" form="client-form" disabled={loading}>
              {loading ? t("Clients.messages.creating") : t("Clients.messages.create")}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Clients.client_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm
              id="client-form"
              userId={userId}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </CardContent>
        </Card>
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
