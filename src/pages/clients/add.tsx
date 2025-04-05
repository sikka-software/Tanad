import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowLeft } from "lucide-react";

import { ClientForm } from "@/components/forms/client-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function AddClientPage() {
  const router = useRouter();
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
    <div className="container mx-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/clients" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add New Client</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
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
