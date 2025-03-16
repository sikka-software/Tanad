import { Loader2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { PuklaThemeProps } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { usePuklaStore } from "@/hooks/use-pukla-store";
import useMainStore from "@/hooks/main.store";
import useUserStore from "@/hooks/use-user-store";
// Components
import { CustomThemePreview } from "@/components/app/CustomThemePreview";
// UI
import { Button } from "@/components/ui/button";
import SliderWithInput from "@/components/ui/slider-with-input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ThemeColorPickersProps {
  handleUpdateTheme: (theme: PuklaThemeProps) => void;
  isUpdating: boolean;
  onUpgradeNeeded?: () => void;
}

export function CustomizePuklaTheme({
  onUpgradeNeeded,
}: ThemeColorPickersProps) {
  const t = useTranslations();
  const { currentPukla } = usePuklaStore();
  const { selectedPukla } = useMainStore();
  const { customTheme, setCustomTheme } = usePuklaStore();
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();

  // Initialize theme with current Pukla's theme values
  useEffect(() => {
    if (currentPukla?.theme) {
      // Initialize with all theme properties
      setCustomTheme({
        ...currentPukla.theme,
        background_color: currentPukla.theme.background_color || "#ffffff",
        text_color: currentPukla.theme.text_color || "#000000",
        button_color: currentPukla.theme.button_color || "#000000",
        button_text_color: currentPukla.theme.button_text_color || "#ffffff",
        border_color: currentPukla.theme.border_color || "#000000",
        border_radius: currentPukla.theme.border_radius || "8px",
        background_image: currentPukla.theme.background_image || "",
      });
    }
  }, [currentPukla?.theme, setCustomTheme]);

  const DEFAULT_BORDER_RADIUS = currentPukla?.theme?.border_radius
    ? parseInt(currentPukla.theme.border_radius)
    : 8;

  const handleBorderRadiusChange = (value: number[]) => {
    setCustomTheme({
      ...customTheme,
      border_radius: `${value[0]}px`,
    });
  };

  const handleAvatarBorderRadiusChange = (value: number[]) => {
    setCustomTheme({
      ...customTheme,
      avatar_border_radius: `${value[0]}px`,
    });
  };

  const handleBackgroundImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (user?.subscribed_to === "pukla_free") {
      onUpgradeNeeded?.();
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("Theme.image_too_large"));
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("Theme.invalid_file_type"));
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedPukla?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("pukla_backgrounds")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("pukla_backgrounds").getPublicUrl(filePath);

      setCustomTheme({
        ...customTheme,
        background_image: publicUrl,
      });

      toast.success(t("Theme.background_image_uploaded"));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("Theme.error_uploading_image"));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeBackgroundImage = () => {
    setCustomTheme({
      ...customTheme,
      background_image: "",
    });
  };

  return (
    <div className="flex flex-col justify-between md:flex-row gap-8">
      <div className="relative w-full">
        <div className="flex flex-col space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("Theme.background_color")}</Label>
              <Input
                type="color"
                className="w-full h-10 rounded-md cursor-pointer p-0"
                value={customTheme.background_color}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    background_color: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Theme.background_image")}</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={uploadingImage}
                  onClick={() =>
                    document.getElementById("background-image-upload")?.click()
                  }
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                  ) : (
                    <Upload className="w-4 h-4 me-2" />
                  )}
                  {t("Theme.upload_background")}
                </Button>
                {customTheme.background_image && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={removeBackgroundImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <input
                  type="file"
                  id="background-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                />
              </div>
            </div>
            {customTheme.background_image && (
              <>
                <div className="space-y-2">
                  <Label>{t("Theme.overlay_color")}</Label>
                  <Input
                    type="color"
                    className="w-full h-10 rounded-md cursor-pointer p-0"
                    value={customTheme.overlay_color || "#000000"}
                    onChange={(e) =>
                      setCustomTheme({
                        ...customTheme,
                        overlay_color: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("Theme.overlay_opacity")}</Label>
                  <SliderWithInput
                    value={[
                      customTheme.overlay_opacity
                        ? customTheme.overlay_opacity * 100
                        : 50,
                    ]}
                    onValueChange={(value) =>
                      setCustomTheme({
                        ...customTheme,
                        overlay_opacity: value[0] / 100,
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>{t("Theme.text_color")}</Label>
              <Input
                type="color"
                className="w-full h-10 rounded-md cursor-pointer p-0"
                value={customTheme.text_color}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    text_color: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Theme.button_color")}</Label>
              <Input
                type="color"
                className="w-full h-10 rounded-md cursor-pointer p-0"
                value={customTheme.button_color}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    button_color: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Theme.button_text_color")}</Label>
              <Input
                type="color"
                className="w-full h-10 rounded-md cursor-pointer p-0"
                value={customTheme.button_text_color}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    button_text_color: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Theme.border_color")}</Label>
              <Input
                type="color"
                className="w-full h-10 p-0 rounded-md cursor-pointer"
                value={customTheme.border_color}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    border_color: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-4">
            <SliderWithInput
              minValue={0}
              maxValue={32}
              initialValue={[parseInt(customTheme.border_radius)]}
              defaultValue={[DEFAULT_BORDER_RADIUS]}
              value={[parseInt(customTheme.border_radius)]}
              label={t("Theme.border_radius")}
              onValueChange={handleBorderRadiusChange}
            />

            {currentPukla?.settings?.avatar_shape !== "circle" && (
              <SliderWithInput
                minValue={0}
                maxValue={32}
                initialValue={[
                  parseInt(customTheme.avatar_border_radius || "0"),
                ]}
                defaultValue={[0]}
                value={[parseInt(customTheme.avatar_border_radius || "0")]}
                label={t("Theme.avatar_border_radius")}
                onValueChange={handleAvatarBorderRadiusChange}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-fit">
        <div className="sticky top-4">
          <h3 className="text-sm font-medium mb-2">{t("Theme.preview")}</h3>
          <CustomThemePreview
            sample_text={selectedPukla?.title}
            colors={customTheme}
            avatar_shape={selectedPukla?.settings?.avatar_shape}
            avatar_border_radius={customTheme.avatar_border_radius}
          />
        </div>
      </div>
    </div>
  );
}
