import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/component";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import useUserStore from "@/stores/use-user-store";

// Type for ZATCA settings
interface ZatcaSettingsType {
  zatca_enabled?: boolean;
  zatca_seller_name?: string;
  zatca_vat_number?: string;
}

export function ZatcaSettings() {
  const t = useTranslations();
  const locale = useLocale();
  const supabase = createClient();
  const { profile, fetchUserAndProfile } = useUserStore();

  // ZATCA settings state
  const [zatcaEnabled, setZatcaEnabled] = useState<boolean>(false);
  const [sellerName, setSellerName] = useState<string>("");
  const [vatNumber, setVatNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch existing settings from profile
  useEffect(() => {
    if (profile) {
      // Get ZATCA settings from user_settings JSONB field
      const userSettings = (profile.user_settings as Record<string, any>) || {};
      setZatcaEnabled(userSettings.zatca_enabled || false);
      setSellerName(userSettings.zatca_seller_name || "");
      setVatNumber(userSettings.zatca_vat_number || "");
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    if (!profile) return;

    setIsLoading(true);

    try {
      // Get current user_settings
      const currentSettings = (profile.user_settings as Record<string, any>) || {};

      // Update the ZATCA settings
      const updatedSettings = {
        ...currentSettings,
        zatca_enabled: zatcaEnabled,
        zatca_seller_name: sellerName,
        zatca_vat_number: vatNumber,
      };

      // Update profile with new settings
      const { error } = await supabase
        .from("profiles")
        .update({
          user_settings: updatedSettings,
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Refresh user data
      await fetchUserAndProfile();

      toast.success(
        t("Settings.zatca_settings_saved", {
          fallback: "ZATCA settings saved successfully",
        }),
      );
    } catch (error) {
      console.error("Error saving ZATCA settings:", error);
      toast.error(
        t("Settings.zatca_settings_error", {
          fallback: "Failed to save ZATCA settings",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Settings.zatca_settings", { fallback: "ZATCA Compliance" })}</CardTitle>
        <CardDescription>
          {t("Settings.zatca_description", {
            fallback: "Configure settings for ZATCA (Zakat, Tax and Customs Authority) compliance",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="zatca-enabled" className="flex flex-col space-y-1">
            <span>{t("Settings.enable_zatca", { fallback: "Enable ZATCA Compliance" })}</span>
            <span className="text-muted-foreground text-sm font-normal">
              {t("Settings.zatca_enable_description", {
                fallback: "Generate QR codes and ensure invoices are ZATCA compliant",
              })}
            </span>
          </Label>
          <Switch id="zatca-enabled" checked={zatcaEnabled} onCheckedChange={setZatcaEnabled} />
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="seller-name">
              {t("Settings.zatca_seller_name", { fallback: "Seller Name" })}
            </Label>
            <Input
              id="seller-name"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder={t("Settings.zatca_seller_name_placeholder", {
                fallback: "Enter your company name as registered with ZATCA",
              })}
              disabled={!zatcaEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-number">
              {t("Settings.zatca_vat_number", { fallback: "VAT Registration Number" })}
            </Label>
            <Input
              id="vat-number"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="123456789012345"
              disabled={!zatcaEnabled}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading
            ? t("General.saving", { fallback: "Saving..." })
            : t("General.save_changes", { fallback: "Save Changes" })}
        </Button>
      </CardFooter>
    </Card>
  );
}
