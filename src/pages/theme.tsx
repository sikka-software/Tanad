import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";

import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/router";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import AnimationSettings from "@/components/app/AnimationSettings";
import AppearanceSettings from "@/components/app/AppearanceSettings";
import { CurrentPuklaInfo } from "@/components/app/CurrentPuklaInfo";
import { CustomizePuklaTheme } from "@/components/app/CustomizePuklaTheme";
// Components
import { PredefinedThemesSection } from "@/components/app/PredefinedThemes";
import SocialPlatformsSection from "@/components/app/SocialPlatformsSection";
import type { SocialPlatformsSectionRef } from "@/components/app/SocialPlatformsSection";
import UpgradeDialog from "@/components/app/UpgradeDialog";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// UI
import { Separator } from "@/components/ui/separator";
import useMainStore from "@/hooks/main.store";
// Hooks
import { usePuklaStore } from "@/hooks/use-pukla-store";
import useUserStore from "@/hooks/use-user-store";
import { predefinedThemes } from "@/lib/constants";
import { fetchPuklas } from "@/lib/operations";
import { supabase } from "@/lib/supabase";
// Lib
import { Pukla, PuklaThemeProps, PuklaSettings, AnimationType } from "@/lib/types";

const appearanceSchema = z.object({
  hideAvatar: z.boolean(),
  hideWatermark: z.boolean(),
  hideTitle: z.boolean(),
  hideBio: z.boolean(),
  avatarShape: z
    .enum(["circle", "square", "horizontal_rectangle", "vertical_rectangle"])
    .default("circle"),
});

export default function Theme() {
  const t = useTranslations();
  const lang = useLocale();
  const router = useRouter();
  const { user } = useUserStore();

  const { customTheme, setCustomTheme } = usePuklaStore();
  const [puklas, setPuklas] = useState<Pukla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedPukla, setSelectedPukla } = useMainStore();
  const [selectedTheme, setSelectedTheme] = useState<PuklaThemeProps | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  const appearanceForm = useForm<z.input<typeof appearanceSchema>>({
    defaultValues: {
      hideAvatar: selectedPukla?.settings?.hide_avatar || false,
      hideWatermark: selectedPukla?.settings?.hide_watermark || false,
      hideTitle: selectedPukla?.settings?.hide_title || false,
      hideBio: selectedPukla?.settings?.hide_bio || false,
      avatarShape: selectedPukla?.settings?.avatar_shape || "circle",
    },
  });

  const animationForm = useForm<{
    animation: string;
  }>({
    defaultValues: {
      animation: selectedPukla?.settings?.animation || "fade",
    },
  });

  const socialFormRef = useRef<SocialPlatformsSectionRef>(null);

  useEffect(() => {
    if (selectedPukla?.theme) {
      setCustomTheme(selectedPukla.theme);
    }
  }, [selectedPukla?.theme, setCustomTheme]);

  useEffect(() => {
    const getPuklas = async () => {
      try {
        if (!user?.id) return;
        const puklas = await fetchPuklas(user?.id, {
          toasts: {
            error: t("MyPuklas.error_fetching_puklas"),
            success: t("MyPuklas.success_fetching_puklas"),
          },
        });

        setPuklas(puklas);

        if (selectedPukla) {
          const updatedPukla = puklas.find((p) => p.id === selectedPukla.id);

          setSelectedPukla(updatedPukla || puklas[0]);
          setSelectedTheme(updatedPukla?.theme || predefinedThemes[0]);
          setCustomTheme(updatedPukla?.theme || predefinedThemes[0]);
        } else {
          setSelectedPukla(puklas[0]);
          setSelectedTheme(puklas[0]?.theme || predefinedThemes[0]);
          setCustomTheme(puklas[0]?.theme || predefinedThemes[0]);
        }
      } catch (error) {
        console.error("Error fetching puklas:", error);
        toast.error(t("MyPuklas.error_fetching_puklas"));
      } finally {
        setIsLoading(false);
      }
    };

    getPuklas();
  }, [user?.id]);

  // Update form values when selectedPukla changes
  useEffect(() => {
    if (selectedPukla?.settings) {
      appearanceForm.reset({
        hideAvatar: selectedPukla.settings.hide_avatar || false,
        hideWatermark: selectedPukla.settings.hide_watermark || false,
        hideTitle: selectedPukla.settings.hide_title || false,
        hideBio: selectedPukla.settings.hide_bio || false,
        avatarShape: selectedPukla.settings.avatar_shape || "circle",
      });
    }
  }, [selectedPukla, appearanceForm]);

  const handleUpdateTheme = async (theme: PuklaThemeProps) => {
    setIsUpdating(true);
    try {
      if (!selectedPukla?.id) return;

      const { data, error } = await supabase
        .from("puklas")
        .update({
          theme: theme,
        })
        .eq("id", selectedPukla.id)
        .select();

      if (error) throw error;

      // Update both local states
      setPuklas(puklas.map((p) => (p.id === selectedPukla.id ? { ...p, theme } : p)));
      setSelectedPukla({
        ...selectedPukla!,
        theme,
      } as Pukla);
      setSelectedTheme(theme);

      toast.success(t("Theme.success_update"));
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error(t("Theme.error_update"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAppearanceSettings = async (appearanceSettings: {
    hideAvatar: boolean;
    hideWatermark: boolean;
    hideTitle: boolean;
    hideBio: boolean;
    avatarShape: "circle" | "square" | "horizontal_rectangle" | "vertical_rectangle";
  }) => {
    if (!selectedPukla) {
      toast.error(t("Theme.no_pukla_selected"));
      return;
    }

    setIsUpdating(true);
    try {
      const updatedSettings = {
        ...(selectedPukla.settings || {}),
        hide_avatar: appearanceSettings.hideAvatar,
        hide_watermark: appearanceSettings.hideWatermark,
        hide_title: appearanceSettings.hideTitle,
        hide_bio: appearanceSettings.hideBio,
        avatar_shape: appearanceSettings.avatarShape,
      };

      const { data, error } = await supabase
        .from("puklas")
        .update({
          settings: updatedSettings,
        })
        .eq("id", selectedPukla.id)
        .select();

      if (error) throw error;

      // Update local state
      setPuklas(
        puklas.map((p) =>
          p.id === selectedPukla.id ? { ...p, settings: updatedSettings as PuklaSettings } : p,
        ),
      );
      setSelectedPukla({
        ...selectedPukla,
        settings: updatedSettings as PuklaSettings,
      });

      toast.success(t("Theme.success_update"));
    } catch (error) {
      console.error("Error updating appearance settings:", error);
      toast.error(t("Theme.error_update"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAnimationSettings = async (animationSettings: { animation: string }) => {
    if (!selectedPukla) {
      toast.error(t("Theme.no_pukla_selected"));
      return;
    }

    if (user?.subscribed_to === "pukla_free") {
      setOpenUpgradeDialog(true);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedSettings = {
        ...(selectedPukla.settings || {}),
        animation: animationSettings.animation as AnimationType,
      };

      const { error } = await supabase
        .from("puklas")
        .update({
          settings: updatedSettings,
        })
        .eq("id", selectedPukla.id);

      if (error) throw error;

      // Update local state
      setPuklas(
        puklas.map((p) => (p.id === selectedPukla.id ? { ...p, settings: updatedSettings } : p)),
      );
      setSelectedPukla({
        ...selectedPukla,
        settings: updatedSettings,
      });

      console.log("Saved animation setting:", animationSettings.animation);
      toast.success(t("Theme.success_update"));
    } catch (error) {
      console.error("Error updating animation settings:", error);
      toast.error(t("Theme.error_update"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSocialLinks = async (data: {
    socialLinks: { platform: string; url: string }[];
    socials_position: "top" | "bottom";
  }) => {
    if (!selectedPukla) {
      toast.error(t("Theme.no_pukla_selected"));
      return;
    }

    setIsUpdating(true);
    try {
      const updatedSettings = {
        ...(selectedPukla.settings || {}),
        social_links: data.socialLinks,
        socials_position: data.socials_position,
      };

      const { error } = await supabase
        .from("puklas")
        .update({
          settings: updatedSettings,
        })
        .eq("id", selectedPukla.id);

      if (error) throw error;

      // Update local state
      setPuklas(
        puklas.map((p) => (p.id === selectedPukla.id ? { ...p, settings: updatedSettings } : p)),
      );
      setSelectedPukla({
        ...selectedPukla,
        settings: updatedSettings,
      });

      toast.success(t("Theme.success_update"));
    } catch (error) {
      console.error("Error updating social links:", error);
      toast.error(t("Theme.error_update"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main
      className="flex w-full max-w-[100vw] flex-col justify-between gap-4 overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <CustomPageMeta title={t("SEO.theme.title")} description={t("SEO.theme.description")} />

      <CurrentPuklaInfo pukla={selectedPukla} allPuklas={puklas} loading={isLoading} />
      <div className="flex w-full flex-col overflow-hidden">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {/* Social Media Settings */}
          <AccordionItem
            value="social_media_settings"
            className="bg-background data-[state=open]:border-primary rounded-lg border px-4 py-1 transition-all"
          >
            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
              <span className="flex flex-col space-y-1 text-start">
                <span className="text-lg font-bold">{t("Theme.social_media_settings")}</span>
                <span className="text-sm font-normal">
                  {t("Theme.choose_social_media_settings")}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-2">
              <Separator className="my-2" />
              <div className="mb-4 flex flex-row items-start justify-between p-0">
                <Button
                  onClick={async () => {
                    try {
                      await socialFormRef.current?.submit();
                    } catch (error) {
                      // Form validation failed
                      console.error("Form validation failed:", error);
                    }
                  }}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("Theme.update_settings")
                  )}
                </Button>
              </div>
              <div>
                <SocialPlatformsSection
                  ref={socialFormRef}
                  initialLinks={selectedPukla?.settings?.social_links || []}
                  initialPosition={selectedPukla?.settings?.socials_position || "top"}
                  onUpdate={(data) => {
                    handleUpdateSocialLinks(data);
                  }}
                  isPending={isUpdating}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance Settings */}
          <AccordionItem
            value="appearance_settings"
            className="bg-background data-[state=open]:border-primary rounded-lg border px-4 py-1 transition-all"
          >
            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
              <span className="flex flex-col space-y-1 text-start">
                <span className="text-lg font-bold">{t("Theme.appearance_settings")}</span>
                <span className="text-sm font-normal">{t("Theme.choose_appearance_settings")}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-2">
              <Separator className="my-2" />
              <div className="mb-4 flex flex-row items-start justify-between p-0">
                <Button
                  onClick={() =>
                    appearanceForm.handleSubmit((data) =>
                      handleUpdateAppearanceSettings({
                        hideAvatar: data.hideAvatar,
                        hideWatermark: data.hideWatermark,
                        hideTitle: data.hideTitle,
                        hideBio: data.hideBio,
                        avatarShape: data.avatarShape || "circle",
                      }),
                    )()
                  }
                  disabled={isUpdating || !selectedTheme}
                  className="w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("Theme.update_theme")
                  )}
                </Button>
              </div>
              <div>
                <AppearanceSettings
                  form={appearanceForm}
                  onUpdate={handleUpdateAppearanceSettings}
                  initialValues={{
                    hideAvatar: selectedPukla?.settings?.hide_avatar || false,
                    hideWatermark: selectedPukla?.settings?.hide_watermark || false,
                    hideTitle: selectedPukla?.settings?.hide_title || false,
                    hideBio: selectedPukla?.settings?.hide_bio || false,
                    avatarShape: selectedPukla?.settings?.avatar_shape || "circle",
                  }}
                  isPending={isUpdating}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Animation Settings */}
          <AccordionItem
            value="animation_settings"
            className="bg-background data-[state=open]:border-primary rounded-lg border px-4 py-1 transition-all"
          >
            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
              <span className="flex flex-col space-y-1 text-start">
                <span className="text-lg font-bold">{t("Theme.animation_settings")}</span>
                <span className="text-sm font-normal">{t("Theme.choose_animation_settings")}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-2">
              <Separator className="my-2" />
              <div className="mb-4 flex flex-row items-start justify-between p-0">
                <Button
                  onClick={() =>
                    animationForm.handleSubmit((data) =>
                      handleUpdateAnimationSettings({
                        animation: data.animation,
                      }),
                    )()
                  }
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("Theme.update_theme")
                  )}
                </Button>
              </div>
              <div>
                <AnimationSettings
                  form={animationForm}
                  onUpdate={() => {}}
                  initialValues={{
                    animation: selectedPukla?.settings?.animation || "fade",
                  }}
                  isPending={isUpdating}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Predefined Themes */}
          <AccordionItem
            value="predefined_themes"
            className="bg-background data-[state=open]:border-primary rounded-lg border px-4 py-1 transition-all"
          >
            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
              <span className="flex flex-col space-y-1 text-start">
                <span className="text-lg font-bold">{t("Theme.predefined_themes")}</span>
                <span className="text-sm font-normal">{t("Theme.choose_theme")}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-2">
              <Separator className="my-2" />
              <div className="mb-4 flex flex-row items-start justify-between p-0">
                <Button
                  onClick={() => handleUpdateTheme(selectedTheme!)}
                  disabled={isUpdating || !selectedTheme}
                  className="w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("Theme.update_theme")
                  )}
                </Button>
              </div>
              <div className="max-h-[300px] min-w-0 overflow-y-auto">
                <PredefinedThemesSection
                  allThemes={predefinedThemes}
                  selectedTheme={selectedTheme}
                  onThemeSelect={setSelectedTheme}
                  onUpgradeClick={() => setOpenUpgradeDialog(true)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custom Theme */}
          <AccordionItem
            // disabled={user?.subscribed_to === "pukla_free"}
            value="custom_theme"
            className="bg-background data-[state=open]:border-primary rounded-lg border px-4 py-1 transition-all"
          >
            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
              <span className="flex flex-col space-y-1 text-start">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-lg font-bold">{t("Theme.custom_theme")}</span>
                  {user?.subscribed_to === "pukla_free" && (
                    <Badge variant="default">{t("Billing.pro_plan")}</Badge>
                  )}
                </div>
                <span className="text-sm font-normal">{t("Theme.customize_colors")}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-2">
              <Separator className="my-2" />
              <div className="mb-4 flex flex-row items-start justify-between p-0">
                <Button
                  onClick={() => {
                    if (user?.subscribed_to === "pukla_free") {
                      setOpenUpgradeDialog(true);
                      return;
                    }
                    handleUpdateTheme(customTheme);
                  }}
                  // disabled={isUpdating || user?.subscribed_to === "pukla_free"}
                  className="mt-4 w-full"
                >
                  {isUpdating ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    t("Theme.update_theme")
                  )}
                </Button>
              </div>
              <CustomizePuklaTheme handleUpdateTheme={handleUpdateTheme} isUpdating={isUpdating} />
            </AccordionContent>
          </AccordionItem>

          {/* Layouts */}
          {/* <AccordionItem
            disabled
            value="layouts"
            className="rounded-lg border bg-background px-4 py-1"
          >
            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
              <span className="flex text-start flex-col space-y-1">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-lg font-bold">
                    {t("Theme.layouts")}
                  </span>
                  <Badge variant="outline">{t("General.soon")}</Badge>
                </div>
                <span className="text-sm font-normal">
                  {t("Theme.choose_layout")}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2 text-muted-foreground">
              <LayoutsSection
                selectedLayout={selectedLayout}
                handleUpdateLayout={handleUpdateLayout}
                isUpdating={isUpdating}
              />
            </AccordionContent>
          </AccordionItem> */}
        </Accordion>
      </div>

      <UpgradeDialog
        open={openUpgradeDialog}
        onOpenChange={setOpenUpgradeDialog}
        onUpgrade={() => {
          router.push("/billing");
        }}
      />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
