import { useState, useEffect } from "react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { VendorForm } from "@/components/forms/vendor-form"; // Import VendorForm
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase"; // Need supabase to get user ID

export default function AddVendorPage() {
  const router = useRouter();
  const t = useTranslations("Vendors"); // Use Vendors namespace
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  // Callback for successful form submission (handled within VendorForm)
  const handleSuccess = () => {
    // router.push("/vendors"); // VendorForm already handles navigation on success by default
    // Optionally, you could add specific logic here if needed after creation
  };

  return (
    <div>
      <PageTitle
        title={t("add_new")} // Vendors.add_new
        // Use customButton for back navigation and potentially submit trigger
        customButton={
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/vendors")}>
              {t("common.cancel")} {/* Use a common cancel translation */}
            </Button>
            {/* Submit button is rendered inside VendorForm, so no need here */}
            {/* Alternatively, trigger form submission from here:
            <Button type="submit" form="vendor-form" disabled={loadingUser || !userId}>
               {t("common.create_button")} 
            </Button> 
            (Requires passing formId="vendor-form" to VendorForm) */}
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
  const effectiveLocale = locale ?? 'en';
  return {
    props: {
      messages: (
        await import(`../../../locales/${effectiveLocale}.json`)
      ).default,
    },
  };
}; 