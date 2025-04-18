"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/router";
// UI
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({
  defaultSize = false,
  className,
  style,
}: {
  defaultSize?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = useTranslations("General");
  const lang = useLocale();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(defaultSize ? "" : "size-8", className)}
          style={style}
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={lang === "ar" ? "start" : "end"}>
        <DropdownMenuRadioGroup
          value={lang === "en-US" ? "en" : lang}
          onValueChange={(value) => {
            router.replace(router.pathname, router.asPath, {
              locale: value,
            });
          }}
        >
          <DropdownMenuRadioItem value="ar">
            {t("languages.ar")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">
            {t("languages.en")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
