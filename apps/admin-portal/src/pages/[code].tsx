import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import NoPuklaFound from "@/components/app/NoPuklaFound";
import { PuklaView } from "@/components/app/PuklaView";
import CustomPageMeta from "@/components/landing/CustomPageMeta";

import { createClient as createClientComponent } from "@/utils/supabase/component";
import { createClient as createClientStaticProps } from "@/utils/supabase/static-props";

export default function RedirectPage({ pukla }: { pukla: any }) {
  const supabase = createClientComponent();
  const router = useRouter();

  const logClick = async () => {
    try {
      const response = await fetch("/api/user-info");
      const { userAgent, ip, country, city, isMobile } = await response.json();

      const { error } = await supabase.from("clicks_log").insert([
        {
          pukla_id: pukla.id,
          clicked_at: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ip,
          country: country,
          city: city,
          is_mobile: isMobile,
        },
      ]);

      if (error) {
        console.error("Error logging click:", error);
      }
    } catch (error) {
      console.error("Error logging click:", error);
    }
  };

  useEffect(() => {
    // Only log the click if we have a valid pukla and we're not in fallback state
    if (pukla && !router.isFallback) {
      logClick();
    }
  }, [pukla, router.isFallback]);

  // Add loading state
  if (router.isFallback) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!pukla) {
    return <NoPuklaFound />;
  }

  return (
    <>
      <CustomPageMeta title={pukla.title} description={pukla.bio} />
      <PuklaView pukla={pukla} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const code = params?.code as string;
  const supabase = createClientStaticProps();
  // Fetch the pukla data for the given slug
  const { data: pukla, error } = await supabase
    .from("puklas")
    .select("*")
    .eq("slug", code.toLowerCase())
    .single();

  if (error || !pukla) {
    return {
      props: {
        pukla: null, // Return pukla as null if not found
        messages: (await import(`../../locales/${locale}.json`)).default,
      },
      revalidate: 60,
    };
  }

  return {
    props: {
      pukla,
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
    revalidate: 60,
  };
};
