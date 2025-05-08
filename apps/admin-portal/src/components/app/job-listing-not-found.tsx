"use client";

import { Search, Plus, Briefcase, Home } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import LanguageSwitcher from "@/components/ui/language-switcher";
import ThemeSwitcher from "@/components/ui/theme-switcher";

export function JobListingNotFound() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const t = useTranslations();
  const lang = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = `https://sikka-images.s3.ap-southeast-1.amazonaws.com/products/tanad/tanad_full_logo_${
    !mounted || resolvedTheme === "dark" ? "white" : "black"
  }${lang === "en" ? "_en" : "_ar"}.png`;

  // Return null or loading state before client-side mount
  if (!mounted) {
    return null;
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 p-4 dark:from-slate-900 dark:to-slate-800"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-xl flex-col gap-4"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          {/* Simple gradient accent */}
          {/* <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-purple-600" /> */}

          <CardContent className="border-b p-8">
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900">
                <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t("JobListings.not_found.title")}
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {t("JobListings.not_found.desc")}
                </p>
              </div>
              <Button
                // size="lg"
                asChild
                className="mx-auto w-full bg-blue-600 hover:bg-blue-700 sm:w-auto dark:bg-blue-400 dark:hover:bg-blue-500"
              >
                <Link href="/job_listings/add">
                  <Plus className="h-4 w-4" />
                  {t("JobListings.not_found.create_new")}
                </Link>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="bg-background flex flex-col items-start gap-4 p-4">
            <div className="w-full">
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
                  <h3 className="font-medium text-blue-800 dark:text-blue-100">
                    {t("JobListings.not_found.looking_to_hire")}
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    {t("JobListings.not_found.our_platform")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-medium text-slate-900 dark:text-slate-100">2,000+</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t("JobListings.not_found.companies_using_platform")}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-medium text-slate-900 dark:text-slate-100">40%</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t("JobListings.not_found.faster_hiring_process")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="my- bg--400 flex w-full flex-row items-end justify-between gap-2">
              <Image
                height={512}
                width={512}
                loading="lazy"
                className={"bg--400 h-9 w-auto"}
                alt={`Tanad Logo`}
                src={logoSrc}
              />
              <div className="flex flex-row gap-2">
                <Button variant="outline" asChild>
                  <Link href="/">{t("General.learn_more")}</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/auth#signup">{t("General.get_started")}</Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
        <div className="flex flex-row justify-between">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </motion.div>
    </div>
  );
}
