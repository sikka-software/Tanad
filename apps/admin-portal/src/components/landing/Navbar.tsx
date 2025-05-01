"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import LanguageSwitcher from "../ui/language-switcher";
import ThemeSwitcher from "../ui/theme-switcher";

const menuItems = [
  { name: "Landing.features", href: "#link" },
  { name: "Landing.solution", href: "#link" },
  { name: "Landing.pricing", href: "#link" },
  { name: "Landing.about", href: "#link" },
];

const Navigation = () => {
  const t = useTranslations();
  const [menuState, setMenuState] = React.useState(false);
  const { resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoSrc = `https://sikka-images.s3.ap-southeast-1.amazonaws.com/products/tanad/tanad_symbol_${
    !isMounted || resolvedTheme === "dark" ? "white" : "black"
  }.png`;

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "group bg-background/50 fixed z-20 w-full border-b backdrop-blur-3xl transition-colors duration-150",
        )}
      >
        <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Image
                  loading="lazy"
                  width={512}
                  height={512}
                  src={logoSrc}
                  className="aspect-auto h-[30px] w-auto"
                  alt="Tanad Logo"
                />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 duration-200 group-data-[state=active]:scale-0 group-data-[state=active]:rotate-180 group-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 group-data-[state=active]:scale-100 group-data-[state=active]:rotate-0 group-data-[state=active]:opacity-100" />
              </button>

              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{t(item.name)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 group-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:group-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{t(item.name)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
          
                <Button asChild variant="outline" size="sm">
                  <Link href="#">
                    <span>{t("Auth.sign_in")}</span>
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="#">
                    <span>{t("Auth.sign_up")}</span>
                  </Link>
                </Button>
                <ThemeSwitcher />
                <LanguageSwitcher />

              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 78 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-auto", className)}
    >
      <path
        d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
        fill="url(#logo-gradient)"
      />
      <path
        d="M27.06 7.054V12.239C27.06 12.5903 27.1393 12.8453 27.298 13.004C27.468 13.1513 27.7513 13.225 28.148 13.225H29.338V14.84H27.808C26.9353 14.84 26.2667 14.636 25.802 14.228C25.3373 13.82 25.105 13.157 25.105 12.239V7.054H24V5.473H25.105V3.144H27.06V5.473H29.338V7.054H27.06ZM30.4782 10.114C30.4782 9.17333 30.6709 8.34033 31.0562 7.615C31.4529 6.88967 31.9855 6.32867 32.6542 5.932C33.3342 5.524 34.0822 5.32 34.8982 5.32C35.6349 5.32 36.2752 5.46733 36.8192 5.762C37.3745 6.04533 37.8165 6.40233 38.1452 6.833V5.473H40.1002V14.84H38.1452V13.446C37.8165 13.888 37.3689 14.2563 36.8022 14.551C36.2355 14.8457 35.5895 14.993 34.8642 14.993C34.0595 14.993 33.3229 14.789 32.6542 14.381C31.9855 13.9617 31.4529 13.3837 31.0562 12.647C30.6709 11.899 30.4782 11.0547 30.4782 10.114ZM38.1452 10.148C38.1452 9.502 38.0092 8.941 37.7372 8.465C37.4765 7.989 37.1309 7.62633 36.7002 7.377C36.2695 7.12767 35.8049 7.003 35.3062 7.003C34.8075 7.003 34.3429 7.12767 33.9122 7.377C33.4815 7.615 33.1302 7.972 32.8582 8.448C32.5975 8.91267 32.4672 9.468 32.4672 10.114C32.4672 10.76 32.5975 11.3267 32.8582 11.814C33.1302 12.3013 33.4815 12.6753 33.9122 12.936C34.3542 13.1853 34.8189 13.31 35.3062 13.31C35.8049 13.31 36.2695 13.1853 36.7002 12.936C37.1309 12.6867 37.4765 12.324 37.7372 11.848C38.0092 11.3607 38.1452 10.794 38.1452 10.148ZM43.6317 4.232C43.2803 4.232 42.9857 4.113 42.7477 3.875C42.5097 3.637 42.3907 3.34233 42.3907 2.991C42.3907 2.63967 42.5097 2.345 42.7477 2.107C42.9857 1.869 43.2803 1.75 43.6317 1.75C43.9717 1.75 44.2607 1.869 44.4987 2.107C44.7367 2.345 44.8557 2.63967 44.8557 2.991C44.8557 3.34233 44.7367 3.637 44.4987 3.875C44.2607 4.113 43.9717 4.232 43.6317 4.232ZM44.5837 5.473V14.84H42.6457V5.473H44.5837ZM49.0661 2.26V14.84H47.1281V2.26H49.0661ZM50.9645 10.114C50.9645 9.17333 51.1572 8.34033 51.5425 7.615C51.9392 6.88967 52.4719 6.32867 53.1405 5.932C53.8205 5.524 54.5685 5.32 55.3845 5.32C56.1212 5.32 56.7615 5.46733 57.3055 5.762C57.8609 6.04533 58.3029 6.40233 58.6315 6.833V5.473H60.5865V14.84H58.6315V13.446C58.3029 13.888 57.8552 14.2563 57.2885 14.551C56.7219 14.8457 56.0759 14.993 55.3505 14.993C54.5459 14.993 53.8092 14.789 53.1405 14.381C52.4719 13.9617 51.9392 13.3837 51.5425 12.647C51.1572 11.899 50.9645 11.0547 50.9645 10.114ZM58.6315 10.148C58.6315 9.502 58.4955 8.941 58.2235 8.465C57.9629 7.989 57.6172 7.62633 57.1865 7.377C56.7559 7.12767 56.2912 7.003 55.7925 7.003C55.2939 7.003 54.8292 7.12767 54.3985 7.377C53.9679 7.615 53.6165 7.972 53.3445 8.448C53.0839 8.91267 52.9535 9.468 52.9535 10.114C52.9535 10.76 53.0839 11.3267 53.3445 11.814C53.6165 12.3013 53.9679 12.6753 54.3985 12.936C54.8405 13.1853 55.3052 13.31 55.7925 13.31C56.2912 13.31 56.7559 13.1853 57.1865 12.936C57.6172 12.6867 57.9629 12.324 58.2235 11.848C58.4955 11.3607 58.6315 10.794 58.6315 10.148ZM65.07 6.833C65.3533 6.357 65.7273 5.98867 66.192 5.728C66.668 5.456 67.229 5.32 67.875 5.32V7.326H67.382C66.6227 7.326 66.0447 7.51867 65.648 7.904C65.2627 8.28933 65.07 8.958 65.07 9.91V14.84H63.132V5.473H65.07V6.833ZM73.3624 10.165L77.6804 14.84H75.0624L71.5944 10.811V14.84H69.6564V2.26H71.5944V9.57L74.9944 5.473H77.6804L73.3624 10.165Z"
        fill="currentColor"
      />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="10"
          y1="0"
          x2="10"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Navigation;

// import { AtSign, Menu } from "lucide-react";
// import { useLocale, useTranslations } from "next-intl";
// import { useTheme } from "next-themes";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";

// // Components
// import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
// import MobileNavMenuItem from "@/components/landing/MobileNavMenuItem";
// // UI
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import LanguageSwitcher from "@/components/ui/language-switcher";
// import { Logos } from "@/components/ui/logos";
// import { Sheet, SheetContent } from "@/components/ui/sheet";
// import ThemeSwitcher from "@/components/ui/theme-switcher";

// // Types
// import { IconComponents } from "@/lib/types";
// // Utils
// import { navigationMenuTriggerStyle, cn } from "@/lib/utils";

// // Hooks
// import { useWindowSize } from "@/hooks/use-window-size";

// import settings from "../../../landing.config";

// export const contactIcons: IconComponents = {
//   whatsapp: <Logos.whatsapp className="h-4 w-4" />,
//   twitter: <Logos.twitter className="h-4 w-4" />,
//   instagram: <Logos.instagram className="h-4 w-4" />,
//   mail: <Logos.mail className="h-4 w-4" />,
//   phone: <Logos.phone className="h-4 w-4" />,
// };

// export default function Navigation(props: any) {
//   const t = useTranslations();
//   const lang = useLocale();
//   const { resolvedTheme } = useTheme();
//   const [menuDialog, openMenuDialog] = useState(false);
//   let size = useWindowSize();
//   const router = useRouter();

//   const [isMounted, setIsMounted] = useState(false);
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   const contactMethods = Object.keys(settings.contact)
//     .map((key) => {
//       const url = settings.contact[key];
//       const icon = contactIcons[key];
//       if (icon && url) {
//         return {
//           icon: icon,
//           label: t(`ContactMethods.${key}`),
//           action: () => window.open(url, "_blank"),
//         };
//       }
//       return null;
//     })
//     .filter(Boolean);

//   const navigationItems = [
//     // {
//     //   path: `/${router.locale}`,
//     //   action: () => router.push(`/${router.locale}`),
//     //   trigger: t("Landing.home"),
//     // },

//     {
//       path: `/${router.locale}/features`,
//       action: () => router.push(`/${router.locale}/features`),
//       trigger: t("Landing.features"),
//     },
//     {
//       path: `/${router.locale}/pricing`,
//       action: () => router.push(`/${router.locale}/pricing`),
//       trigger: t("Landing.pricing"),
//     },
//     // {
//     //   path: `/${router.locale}/directory`,
//     //   action: () => router.push(`/${router.locale}/directory`),
//     //   trigger: t("Landing.directory"),
//     // },
//   ];

//   const logoSrc = `https://sikka-images.s3.ap-southeast-1.amazonaws.com/products/tanad/tanad_symbol_${
//     !isMounted || resolvedTheme === "dark" ? "white" : "black"
//   }.png`;

//   if (!isMounted) {
//     return null; // or a loading skeleton
//   }

//   return (
//     <div
//       className={cn(
//         "sticky top-0 z-50",
//         "flex w-full flex-row items-center justify-center p-4",
//         props.onSticky ? "bg-background border-b" : "bg-transparent",
//       )}
//     >
//       <div
//         className={cn(
//           "bg--300 flex w-full flex-row items-center justify-between",
//           !settings.navigation.fullWidth && "max-w-7xl",
//         )}
//       >
//         <div className="flex flex-row items-center justify-center gap-10">
//           <Link href={"/"}>
//             <Image
//               loading="lazy"
//               width={512}
//               height={512}
//               src={logoSrc}
//               className="aspect-auto h-[35px] w-auto"
//               alt="Tanad Logo"
//             />
//           </Link>
//         </div>

//         {(size?.width ?? 0) > 800 ? (
//           <div className="flex max-w-md flex-row gap-2">
//             <div className="bg--400 flex w-fit flex-row gap-2">
//               {navigationItems.map((navLink, i) => (
//                 <Link key={i} href={navLink.path} className={cn(navigationMenuTriggerStyle())}>
//                   {navLink.trigger}
//                 </Link>
//               ))}
//             </div>
//             <LanguageSwitcher defaultSize={true} />
//             <ThemeSwitcher defaultSize={true} />

//             <Link href="/dashboard">
//               <Button aria-label="Dashboard" variant="default">
//                 {t("Landing.dashboard")}
//               </Button>
//             </Link>
//           </div>
//         ) : (
//           <div className="flex flex-row gap-2">
//             <Button
//               aria-label="Mobile Menu"
//               size={"icon"}
//               variant={"outline"}
//               onClick={() => openMenuDialog(!menuDialog)}
//             >
//               <Menu />
//             </Button>

//             <Sheet open={menuDialog} onOpenChange={openMenuDialog}>
//               <SheetContent
//                 dir={lang === "ar" ? "rtl" : "ltr"}
//                 side={lang === "ar" ? "left" : "right"}
//                 style={{ padding: 0 }}
//               >
//                 <div className="flex h-full flex-col pt-14">
//                   <div className="flex flex-row justify-center gap-2 px-4 pb-4">
//                     <Link href="/auth" className="w-full">
//                       <Button aria-label="login" className="w-full">
//                         {t("Landing.dashboard")}
//                       </Button>
//                     </Link>
//                   </div>
//                   <div className="flex flex-grow flex-col gap-2 overflow-y-auto px-4">
//                     {navigationItems.map((n, i) => (
//                       <div className="flex flex-col gap-2" key={i}>
//                         <MobileNavMenuItem
//                           handleClick={() => openMenuDialog(false)}
//                           path={n.path}
//                           key={i}
//                           item={n}
//                           trigger={n.trigger}
//                           index={i}
//                         />
//                         <CustomMotionDiv
//                           delay={i * 0.1}
//                           className="h-px bg-gray-300 dark:bg-gray-700"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                   <div className="flex w-full flex-row items-center justify-between gap-0 border-t p-4">
//                     <div className="flex h-full flex-row items-center gap-2">
//                       <CustomMotionDiv delay={0.1}>
//                         <ThemeSwitcher defaultSize={true} />
//                       </CustomMotionDiv>
//                       <CustomMotionDiv delay={0.2}>
//                         <LanguageSwitcher defaultSize={true} />
//                       </CustomMotionDiv>
//                     </div>
//                     <CustomMotionDiv delay={0.3}>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger>
//                           <div>
//                             <Button aria-label="Contact Methods" variant="outline" size="icon">
//                               <AtSign className="h-5 w-5" />
//                             </Button>
//                           </div>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align={lang === "ar" ? "start" : "end"}>
//                           {contactMethods.map(
//                             (method, index) =>
//                               method && (
//                                 <DropdownMenuItem key={index} onClick={method.action}>
//                                   <span className="me-2">{method.icon}</span>
//                                   {method.label}
//                                 </DropdownMenuItem>
//                               ),
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </CustomMotionDiv>
//                   </div>
//                 </div>
//               </SheetContent>
//             </Sheet>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
