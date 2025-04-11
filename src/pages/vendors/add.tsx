import { useState, useEffect } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { useQueryClient } from "@tanstack/react-query";

import { VendorForm } from "@/components/forms/vendor-form";
// Import VendorForm
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
// Need supabase to get user ID
import { vendorKeys } from "@/hooks/useVendors";
import { supabase } from "@/lib/supabase";

export default function AddVendorPage() {
  const router = useRouter();
  const t = useTranslations("Vendors"); // Use Vendors namespace
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const queryClient = useQueryClient();

  // Fetch user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        // Redirect to login if not authenticated
        console.error("User not authenticated:", error);
        router.push("/auth/login"); // Adjust login path if different
      }
      setLoadingUser(false);
    };

    getUserId();
  }, [router]);

  // Callback for successful form submission
  const handleSuccess = (vendor: any) => {
    // Update the vendors cache to include the new vendor
    const previousVendors = queryClient.getQueryData(vendorKeys.lists()) || [];
    queryClient.setQueryData(vendorKeys.lists(), [
      ...(Array.isArray(previousVendors) ? previousVendors : []),
      vendor,
    ]);

    // Navigate to vendors list
    router.push("/vendors");
  };

  return (
    <div>
      <PageTitle
        title={t("add_new")} // Vendors.add_new
        // Use customButton for back navigation and potentially submit trigger
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/vendors")}>
              {t("General.cancel")} {/* Use a common cancel translation */}
            </Button>
          </div>
        }
      />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("vendor_details")}</CardTitle> {/* Vendors.vendor_details */}
          </CardHeader>
          <CardContent>
            {loadingUser ? (
              <p>{t("common.loading")}</p> // Show loading state while fetching user
            ) : userId ? (
              <VendorForm
                userId={userId}
                onSuccess={handleSuccess} // Pass success handler if needed
                // The form manages its own loading state internally
              />
            ) : (
              // Handle case where userId failed to load but didn't redirect (shouldn't happen with current logic)
              <p>{t("error.failed_to_load_user")}</p> /* Vendors.error.failed_to_load_user */
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const effectiveLocale = locale ?? "en";
  return {
    props: {
      messages: (await import(`../../../locales/${effectiveLocale}.json`)).default,
    },
  };
};
