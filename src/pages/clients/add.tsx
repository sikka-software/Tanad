import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { ClientForm } from "@/components/forms/client-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

export default function AddClientPage() {
  const router = useRouter();
  const t = useTranslations("Clients");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user ID when component mounts
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        // Redirect to login if no user is found
        router.push("/auth/login");
      }
    };

    getUserId();
  }, [router]);

  return (
    <div className="">
      <PageTitle
        title={t("add_client")}
        createButtonLink="/clients"
        createButtonText={t("back_to_list")}
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("client_details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm userId={userId} />
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
