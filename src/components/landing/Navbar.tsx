"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AtSign, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

// UI
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logos } from "@/components/ui/logos";

// Components
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import MobileNavMenuItem from "@/components/landing/MobileNavMenuItem";
// Types
import { IconComponents } from "@/lib/types";
// Hooks
import { useWindowSize } from "@/hooks/use-window-size";
// Utils
import { navigationMenuTriggerStyle, cn } from "@/lib/utils";
import settings from "../../../landing.config";
import LanguageSwitcher from "@/components/ui/language-switcher";
import ThemeSwitcher from "@/components/ui/theme-switcher";

export const contactIcons: IconComponents = {
  whatsapp: <Logos.whatsapp className="h-4 w-4" />,
  twitter: <Logos.twitter className="h-4 w-4" />,
  instagram: <Logos.instagram className="h-4 w-4" />,
  mail: <Logos.mail className="h-4 w-4" />,
  phone: <Logos.phone className="h-4 w-4" />,
};

export default function Navigation(props: any) {
  const t = useTranslations();
  const lang = useLocale();
  const { resolvedTheme } = useTheme();
  const [menuDialog, openMenuDialog] = useState(false);
  let size = useWindowSize();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const contactMethods = Object.keys(settings.contact)
    .map((key) => {
      const url = settings.contact[key];
      const icon = contactIcons[key];
      if (icon && url) {
        return {
          icon: icon,
          label: t(`ContactMethods.${key}`),
          action: () => window.open(url, "_blank"),
        };
      }
      return null;
    })
    .filter(Boolean);

  const navigationItems = [
    // {
    //   path: `/${router.locale}`,
    //   action: () => router.push(`/${router.locale}`),
    //   trigger: t("Landing.home"),
    // },

    {
      path: `/${router.locale}/features`,
      action: () => router.push(`/${router.locale}/features`),
      trigger: t("Landing.features"),
    },
    {
      path: `/${router.locale}/pricing`,
      action: () => router.push(`/${router.locale}/pricing`),
      trigger: t("Landing.pricing"),
    },
    // {
    //   path: `/${router.locale}/directory`,
    //   action: () => router.push(`/${router.locale}/directory`),
    //   trigger: t("Landing.directory"),
    // },
  ];

  const logoSrc = `/assets/pukla-logo-full-${
    !isMounted || resolvedTheme === "dark" ? "green" : "purple"
  }${lang === "en" ? "-en" : ""}.png`;

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-50",
        "flex w-full flex-row items-center justify-center p-4",
        props.onSticky ? "bg-background border-b" : "bg-transparent"
      )}
    >
      <div
        className={cn(
          "flex w-full flex-row items-center justify-between",
          !settings.navigation.fullWidth && "max-w-7xl"
        )}
      >
        <div className="flex flex-row items-center justify-center gap-10">
          <Link href={"/"}>
          Sanad
            {/* <Image
              loading="lazy"
              width={512}
              height={512}
              src={logoSrc}
              className="w-[150px] aspect-auto"
              alt="Pukla Logo"
            /> */}
          </Link>
          {(size?.width ?? 0) > 800 && (
            <div className="flex w-full flex-row gap-4 ">
              {navigationItems.map((navLink, i) => (
                <Link
                  key={i}
                  href={navLink.path}
                  className={cn(navigationMenuTriggerStyle())}
                >
                  {navLink.trigger}
                </Link>
              ))}
            </div>
          )}
        </div>
        {(size?.width ?? 0) > 800 ? (
          <div className="flex max-w-md flex-row gap-2">
            <LanguageSwitcher defaultSize={true} />
            <ThemeSwitcher defaultSize={true} />

            <Link href="/dashboard">
              <Button aria-label="Dashboard" variant="default">
                {t("Landing.dashboard")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-row gap-2">
            <Button
              aria-label="Mobile Menu"
              size={"icon"}
              variant={"outline"}
              onClick={() => openMenuDialog(!menuDialog)}
            >
              <Menu />
            </Button>

            <Sheet open={menuDialog} onOpenChange={openMenuDialog}>
              <SheetContent
                dir={lang === "ar" ? "rtl" : "ltr"}
                side={lang === "ar" ? "left" : "right"}
                style={{ padding: 0 }}
              >
                <div className="flex h-full flex-col pt-14">
                  <div className="flex flex-row justify-center gap-2 px-4 pb-4">
                    <Link href="/auth" className="w-full">
                      <Button aria-label="login" className="w-full">
                        {t("Landing.dashboard")}
                      </Button>
                    </Link>
                  </div>
                  <div className=" flex flex-grow flex-col gap-2 overflow-y-auto px-4">
                    {navigationItems.map((n, i) => (
                      <div className="flex flex-col gap-2" key={i}>
                        <MobileNavMenuItem
                          handleClick={() => openMenuDialog(false)}
                          path={n.path}
                          key={i}
                          item={n}
                          trigger={n.trigger}
                          index={i}
                        />
                        <CustomMotionDiv
                          delay={i * 0.1}
                          className="h-px bg-gray-300 dark:bg-gray-700"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex w-full  flex-row items-center justify-between gap-0 border-t p-4">
                    <div className="flex h-full flex-row items-center  gap-2">
                      <CustomMotionDiv delay={0.1}>
                        <ThemeSwitcher defaultSize={true} />
                      </CustomMotionDiv>
                      <CustomMotionDiv delay={0.2}>
                        <LanguageSwitcher defaultSize={true} />
                      </CustomMotionDiv>
                    </div>
                    <CustomMotionDiv delay={0.3}>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div>
                            <Button
                              aria-label="Contact Methods"
                              variant="outline"
                              size="icon"
                            >
                              <AtSign className="h-5 w-5" />
                            </Button>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align={lang === "ar" ? "start" : "end"}
                        >
                          {contactMethods.map(
                            (method, index) =>
                              method && (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={method.action}
                                >
                                  <span className="me-2">{method.icon}</span>
                                  {method.label}
                                </DropdownMenuItem>
                              )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CustomMotionDiv>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  );
}
