import React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { PuklaThemeProps } from "@/lib/types";

interface CustomThemePreviewProps {
  colors: PuklaThemeProps;
  sample_text?: string;
  avatar_shape?:
    | "circle"
    | "square"
    | "horizontal_rectangle"
    | "vertical_rectangle";
  avatar_border_radius?: string;
}

export function CustomThemePreview({
  colors,
  sample_text,
  avatar_shape = "circle",
  avatar_border_radius = "0px",
}: CustomThemePreviewProps) {
  const t = useTranslations();

  return (
    <div className="group select-none relative border rounded-lg transition-all duration-200 overflow-hidden w-full min-w-[200px]">
      <div
        className={cn("p-4 space-y-3 transition-transform")}
        style={{
          backgroundColor: colors.background_color,
        }}
      >
        <div
          className={cn("mx-auto bg-gray-300")}
          style={{
            width: avatar_shape === "horizontal_rectangle" ? "4rem" : "3rem",
            height: avatar_shape === "vertical_rectangle" ? "4rem" : "3rem",
            borderRadius:
              avatar_shape === "circle" ? "9999px" : avatar_border_radius,
          }}
        />
        <div
          className="text-sm font-medium text-center truncate"
          style={{ color: colors.text_color }}
        >
          {sample_text}
        </div>
        <div className="space-y-2">
          {["Button 1", "Button 2", "Button 3"].map((i) => (
            <div
              key={i}
              className="h-8 rounded-md w-full transition-colors text-center flex items-center justify-center"
              style={{
                backgroundColor: colors.button_color,
                borderColor: colors.button_border_color || colors.button_color,
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: colors.border_radius,
                color: colors.button_text_color,
              }}
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
