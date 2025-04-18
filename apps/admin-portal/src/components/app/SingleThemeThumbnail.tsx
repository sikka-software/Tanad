import React from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { PuklaThemeProps } from "@/lib/types";

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
        "group relative w-full rounded-lg border-2 transition-all duration-200 overflow-hidden",
        isSelected
          ? "ring-2 ring-primary border-transparent"
          : "hover:border-primary/50 border-transparent",
        locked ? "opacity-80" : "cursor-pointer",
      )}
    >
      {locked && (
        <div className="absolute end-2 top-2 z-20 flex items-center justify-center gap-2 rounded bg-black/75 p-1 px-2 text-sm text-white">
          <Lock className="w-4" /> <span>{t("General.upgrade")}</span>
        </div>
      )}
      <div
        className={cn(
          "p-4 space-y-3 transition-transform",
          isSelected && "scale-[0.95] ",
        )}
        style={{
          backgroundColor: colors.background_color,
        }}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-gray-300" />
        <div
          className="text-sm font-medium text-center truncate"
          style={{ color: colors.text_color }}
        >
          {sample_text}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 rounded-md w-full transition-colors"
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
