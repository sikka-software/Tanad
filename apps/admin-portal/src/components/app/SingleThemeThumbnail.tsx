import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { PuklaThemeProps } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SingleThemeThumbnailProps {
  colors: PuklaThemeProps;
  isSelected: boolean;
  onSelect: () => void;
  sample_text?: string;
  locked?: boolean;
}

export function SingleThemeThumbnail({
  colors,
  isSelected,
  onSelect,
  sample_text,
  locked,
}: SingleThemeThumbnailProps) {
  const t = useTranslations();

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border-2 transition-all duration-200",
        isSelected
          ? "ring-primary border-transparent ring-2"
          : "hover:border-primary/50 border-transparent",
        locked ? "opacity-80" : "cursor-pointer",
      )}
    >
      {locked && (
        <div className="absolute end-2 top-2 z-20 flex items-center justify-center gap-2 rounded-md bg-black/75 p-1 px-2 text-sm text-white">
          <Lock className="w-4" /> <span>{t("General.upgrade")}</span>
        </div>
      )}
      <div
        className={cn("space-y-3 p-4 transition-transform", isSelected && "scale-[0.95]")}
        style={{
          backgroundColor: colors.background_color,
        }}
      >
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-300" />
        <div
          className="truncate text-center text-sm font-medium"
          style={{ color: colors.text_color }}
        >
          {sample_text}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-full rounded-md transition-colors"
              style={{
                backgroundColor: colors.button_color,
                border: `1px solid ${colors.button_border_color || colors.button_color}`,
              }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
