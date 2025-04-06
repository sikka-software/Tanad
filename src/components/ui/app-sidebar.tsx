"use client";

import { useEffect, useState } from "react";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  Link2,
  BarChart,
  CreditCard,
  ChevronUp,
  User2,
  LogOut,
  MessageSquareWarning,
  Brush,
  Paperclip,
  LayoutDashboard,
  Package,
  File,
  Users,
  ChevronDown,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useUserStore from "@/hooks/use-user-store";
import { CACHE_KEY } from "@/lib/constants";
import { getMenuList } from "@/lib/menu-list";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import { FeedbackDialog } from "../app/FeedbackDialog";

// Add a custom style for the chevron rotation
const accordionChevronStyles = `
  .accordion-chevron {
    transition: transform 0.2s ease;
  }
  
  [data-state="open"] .accordion-chevron {
    transform: rotate(180deg);
  }
`;

export function AppSidebar() {
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const { user } = useUserStore();
  const router = useRouter();

  const menuGroups = getMenuList(router.pathname);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoSrc = `/assets/pukla-logo-full-${
    !isMounted || resolvedTheme === "dark" ? "green" : "purple"
  }${lang === "en" ? "-en" : ""}.png`;

  const sidebarIsOpen = state !== "collapsed" && !isMobile;

  return (
    <>
      <style jsx global>
        {accordionChevronStyles}
      </style>
      <Sidebar collapsible="icon" side={lang === "ar" ? "right" : "left"}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    Select Workspace
                    <ChevronDown className="ms-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)]">
                  <DropdownMenuItem>
                    <span>Acme Inc</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Acme Corp.</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarHeader className="p-0">
              <Link
                href={user ? "/dashboard" : "/"}
                className="flex items-center"
              >
                <span className="text-xl my-2 font-bold w-full flex justify-center overflow-hidden">
                  {!isMobile && state === "collapsed" ? (
                    <Image
                      src={`/assets/pukla-logo-symbol-${resolvedTheme === "dark" ? "green" : "purple"}.png`}
                      alt="Pukla"
                      className="h-6 w-auto min-w-max"
                      width={512}
                      height={512}
                    />
                  ) : (
                    <Image
                      src={logoSrc}
                      alt="Pukla"
                      className="h-6 w-auto min-w-max"
                      width={512}
                      height={512}
                    />
                  )}
                </span>
              </Link>
            </SidebarHeader> */}
            <SidebarGroupContent>
              <SidebarMenu className="mt-4 gap-2">
                {menuGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {group.groupLabel && (
                      <div className="text-muted-foreground px-3 py-2 text-xs font-medium">
                        {t(group.groupLabel)}
                      </div>
                    )}
                    {group.menus.map((menu, menuIndex) => (
                      <SidebarMenuItem key={menuIndex}>
                        {menu.submenus && menu.submenus.length > 0 ? (
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={`item-${menuIndex}`} className="border-none">
                              <AccordionTrigger
                                className="w-full p-0 hover:no-underline"
                                hideChevron
                              >
                                <SidebarMenuButton className="w-full">
                                  {menu.icon && <menu.icon className="!size-6 md:!size-4" />}
                                  <span>{t(menu.translationKey)}</span>
                                  <ChevronDown className="accordion-chevron ms-auto" />
                                </SidebarMenuButton>
                              </AccordionTrigger>
                              <AccordionContent className="m-0 p-0">
                                <SidebarMenuSub className="!ms-2 w-full">
                                  {menu.submenus.map((submenu, submenuIndex) => (
                                    <Link href={submenu.href} key={submenuIndex}>
                                      <SidebarMenuSubButton className="w-full">
                                        <span>{t(submenu.translationKey)}</span>
                                      </SidebarMenuSubButton>
                                    </Link>
                                  ))}
                                </SidebarMenuSub>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Link href={menu.href}>
                            <SidebarMenuButton
                              dir={lang === "ar" ? "rtl" : "ltr"}
                              tooltip={t(menu.label)}
                              className={cn(
                                menu.active &&
                                  "bg-primary text-background hover:bg-primary hover:text-background",
                              )}
                            >
                              {menu.icon && <menu.icon className="!size-6 md:!size-4" />}
                              <span>{t(menu.label)}</span>
                            </SidebarMenuButton>
                          </Link>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-0">
          <div className="flex flex-col gap-2 p-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-muted-foreground flex !h-[34px] items-center gap-2 rounded-md border !p-1.5 text-xs"
                >
                  <MessageSquareWarning className="!size-4" />
                  {!isMobile && state === "collapsed" ? null : (
                    <span>{t("Feedback.give_feedback")}</span>
                  )}
                </Button>
              </DialogTrigger>
              <FeedbackDialog onOpenChange={setOpen} />
            </Dialog>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
                  <DropdownMenuTrigger asChild>
                    {!isMobile && state === "collapsed" ? (
                      <Button
                        variant="outline"
                        className="text-muted-foreground flex !h-[34px] items-center gap-2 rounded-md border !p-1.5 text-xs"
                      >
                        <User2 className="!size-4" />
                      </Button>
                    ) : (
                      <Button variant={"outline"} className="w-full">
                        {user?.user_metadata.email}
                      </Button>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className={
                      !isMobile && state === "collapsed"
                        ? "w-[--radix-popper-content-width]"
                        : "w-[--radix-popper-anchor-width]"
                    }
                    align="start"
                  >
                    {!isMobile && state === "collapsed" && (
                      <>
                        <DropdownMenuLabel>{user?.user_metadata.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <Link href="/account">
                      <DropdownMenuItem className="cursor-pointer">
                        <User2 className="!size-4" />
                        <span>{t("Account.title")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/billing">
                      <DropdownMenuItem className="cursor-pointer">
                        <CreditCard className="!size-4" />
                        <span>{t("Billing.title")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        supabase.auth.signOut().then(() => {
                          localStorage.removeItem(CACHE_KEY(user?.id!));
                          localStorage.removeItem("analytics_date_range");
                          router.replace("/auth");
                        });
                      }}
                    >
                      <LogOut className="!size-4" /> <span>{t("Auth.sign_out")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
