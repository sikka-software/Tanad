import React from "react";

// Components
import { SingleThemeThumbnail } from "@/components/app/SingleThemeThumbnail";
import useUserStore from "@/hooks/use-user-store";
import { PuklaThemeProps } from "@/lib/types";

interface PredefinedThemesSectionProps {
  allThemes: PuklaThemeProps[];
  selectedTheme: PuklaThemeProps | null;
  onThemeSelect: (theme: PuklaThemeProps) => void;
  onUpgradeClick: () => void;
}

export const PredefinedThemesSection: React.FC<PredefinedThemesSectionProps> = ({
  allThemes,
  selectedTheme,
  onThemeSelect,
  onUpgradeClick,
}) => {
  const { profile } = useUserStore();

  const handleThumbnailClick = (theme: PuklaThemeProps) => {
    if (!theme.is_free && profile?.subscribed_to === "pukla_free" && onUpgradeClick) {
      onUpgradeClick();
    } else {
      onThemeSelect(theme);
    }
  };

  return (
    <>
      <div className="inline-grid w-full grid-cols-[repeat(auto-fit,_minmax(130px,_1fr))] gap-4 p-4">
        {allThemes?.map((theme, index) => (
          <div className="flex-none" key={index}>
            <SingleThemeThumbnail
              sample_text={theme.theme_name}
              locked={!theme.is_free && profile?.subscribed_to === "pukla_free"}
              isSelected={selectedTheme?.theme_name === theme.theme_name}
              onSelect={() => handleThumbnailClick(theme)}
              colors={{
                ...theme,
                button_color: theme.button_color,
                text_color: theme.text_color,
                background_color: theme.background_color,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};
