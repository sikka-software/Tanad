"use client";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// UI
import { Button } from "@/ui/button";
import LanguageSwitcher from "@/ui/language-switcher";
// Components
import ThemeSwitcher from "@/ui/theme-switcher";

export default function NoPuklaFound() {
  const t = useTranslations("PuklaNotFound");
  const lang = useLocale();
  const { resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoSrc = `/assets/pukla-logo-full-${
    !isMounted || resolvedTheme === "dark" ? "green" : "purple"
  }${lang === "en" ? "-en" : ""}.png`;

  if (!isMounted) {
    return null;
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="bg-background mx-auto flex min-h-screen max-w-[90%] flex-col items-center justify-center gap-2"
    >
      <div className="bg-background mx-4 w-full max-w-md rounded-lg border p-8">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Link href="/">
            <Image
              src={logoSrc}
              alt="logo"
              className="mb-4 h-[30px] w-auto"
              width={300}
              height={300}
            />
          </Link>

          <h1 className="text-foreground mb-2 text-2xl font-bold">
            {t("oops_this_pukla_doesnt_exist_yet")}
          </h1>
          <p className="text-muted-foreground">
            {t("but_dont_worry_you_can_create_your_own_pukla_right_now")}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">{t("sign_up_for_free")}</Link>
          </Button>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-xs">
          {t.rich("by_using_our_service_you_agree_to_our", {
            terms: (chunks) => (
              <Link href="/terms" className="underline">
                {chunks}
              </Link>
            ),
            privacy_policy: (chunks) => (
              <Link href="/privacy" className="underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
      <div className="flex w-full max-w-md flex-row items-center justify-between gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
