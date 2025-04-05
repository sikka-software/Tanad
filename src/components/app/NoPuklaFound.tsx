"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
// UI
import { Button } from "@/components/ui/button";
// Components
import ThemeSwitcher from "@/components/ui/theme-switcher";
import LanguageSwitcher from "@/components/ui/language-switcher";

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
      className="flex items-center flex-col gap-2 justify-center min-h-screen bg-background max-w-[90%] mx-auto"
    >
      <div className="bg-background p-8 rounded-lg border max-w-md w-full mx-4">
        <div className="text-center justify-center items-center flex flex-col mb-8">
          <Link href="/">
            <Image
              src={logoSrc}
              alt="logo"
              className="mb-4 w-auto h-[30px]"
              width={300}
              height={300}
            />
          </Link>

          <h1 className="text-2xl font-bold mb-2 text-foreground">
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

        <p className="mt-8 text-xs text-center text-muted-foreground">
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
      <div className="flex w-full max-w-md  flex-row justify-between items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
