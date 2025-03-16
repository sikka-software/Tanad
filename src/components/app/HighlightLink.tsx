import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/router";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import useUserStore from "@/hooks/use-user-store";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type HighlightAnimation = "outline" | "border" | "scale" | "none";

type HighlightLinkProps = {
  value?: HighlightAnimation;
  onChange?: (value: HighlightAnimation) => void;
  disabled?: boolean;
  linkId: string;
  puklaId: string;
  onUpgradeNeeded?: () => void;
};

const HighlightLink: React.FC<HighlightLinkProps> = ({
  value = "none",
  onChange,
  disabled = false,
  linkId,
  puklaId,
  onUpgradeNeeded,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAnimation, setSelectedAnimation] =
    useState<HighlightAnimation>(value);

  const animations: { value: HighlightAnimation; preview: React.ReactNode }[] =
    [
      {
        value: "none",
        preview: (
          <div className="w-full h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            {t("Theme.none")}
          </div>
        ),
      },
      {
        value: "outline",
        preview: (
          <div className="w-full h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center animate-highlight_outline">
            {t("Theme.outline")}
          </div>
        ),
      },
      {
        value: "border",
        preview: (
          <div className="w-full h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center animate-highlight_border">
            {t("Theme.border")}
          </div>
        ),
      },
      {
        value: "scale",
        preview: (
          <div className="w-full h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center animate-highlight_scale">
            {t("Theme.scale")}
          </div>
        ),
      },
    ];

  const handleSave = async (newAnimation: HighlightAnimation) => {
    if (user?.subscribed_to === "pukla_free") {
      onUpgradeNeeded?.();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("pukla_links")
        .update({ item_highlight: newAnimation })
        .eq("id", linkId)
        .eq("pukla_id", puklaId);

      if (error) throw error;

      toast.success(t("Editor.link_updated_successfully"));
      onChange?.(newAnimation);
    } catch (error) {
      console.error("Error updating highlight animation:", error);
      toast.error(t("Editor.failed_to_update_link"));
      // Revert to previous value on error
      setSelectedAnimation(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/billing");
  };

  return (
    <div className="space-y-4">
      <Label>{t("Theme.select_highlight_animation")}</Label>
      <RadioGroup
        value={selectedAnimation}
        onValueChange={(val) => {
          const newValue = val as HighlightAnimation;
          setSelectedAnimation(newValue);
          handleSave(newValue);
        }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
        disabled={disabled || isSaving}
      >
        {animations.map((animation) => (
          <div key={animation.value} className="relative">
            <RadioGroupItem
              value={animation.value}
              id={`highlight-${animation.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`highlight-${animation.value}`}
              className={cn(
                "flex flex-col gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer",
                (disabled || isSaving) && "cursor-not-allowed opacity-50"
              )}
            >
              {animation.preview}
              {isSaving && selectedAnimation === animation.value && (
                <div className="absolute inset-0 flex items-center justify-center bg-popover/50 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default HighlightLink;
