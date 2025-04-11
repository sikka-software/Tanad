"use client";

import { useEffect, useState } from "react";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";

import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronUp,
  User2,
  LogOut,
  MessageSquareWarning,
  CreditCard,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import useUserStore from "@/hooks/use-user-store";
import { CACHE_KEY } from "@/lib/constants";
import { getMenuList } from "@/lib/menu-list";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import { FeedbackDialog } from "../app/FeedbackDialog";

type Menu = {
  href: string;
  label: string;
  translationKey: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: {
    href: string;
    label: string;
    translationKey: string;
    active?: boolean;
    plusAction?: string;
  }[];
};

type Group = {
  groupLabel?: string;
  groupLabelTranslationKey?: string;
  icon: LucideIcon;
  menus: Menu[];
};

export function AppSidebar() {
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { state, isMobile, setOpen: setSidebarOpen } = useSidebar();
  const { user } = useUserStore();
  const router = useRouter();

  const menuGroups = getMenuList(router.pathname);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
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
          <SidebarMenu className="mt-4 gap-2">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <SidebarSeparator className="mb-2" />
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className="w-full overflow-hidden"
                        tooltip={group.groupLabelTranslationKey || ""}
                      >
                        {group.icon && <group.icon className="!size-6 md:!size-4" />}
                        {!isMobile && state !== "collapsed" && (
                          <span className="text-nowrap">
                            {t(group.groupLabelTranslationKey || "")}
                          </span>
                        )}
                        <ChevronDown className="ms-auto group-data-[state=open]/collapsible:hidden" />
                        <ChevronUp className="ms-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className={state !== "collapsed" ? "ms-4 border-s" : ""}>
                      <div className="w-full">
                        {group.menus.map((menu, menuIndex) => (
                          <SidebarMenuItem key={menuIndex}>
                            {menu.submenus && menu.submenus.length > 0 ? (
                              <Collapsible className="group/submenu-collapsible w-full">
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton
                                    className="w-full overflow-hidden"
                                    tooltip={menu.translationKey}
                                  >
                                    {menu.icon && <menu.icon className="!size-6 md:!size-4" />}
                                    {!isMobile && state !== "collapsed" && (
                                      <span className="text-nowrap">{t(menu.translationKey)}</span>
                                    )}
                                    <ChevronDown className="ms-auto group-data-[state=open]/submenu-collapsible:hidden" />
                                    <ChevronUp className="ms-auto group-data-[state=closed]/submenu-collapsible:hidden" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub className="w-[calc(100%-1rem)] !px-0">
                                    {menu.submenus.map((submenu, submenuIndex) => (
                                      <SidebarMenuSubItem key={submenuIndex}>
                                        <Link href={submenu.href}>
                                          <SidebarMenuSubButton
                                            className={cn(
                                              submenu.active &&
                                                "bg-primary text-background hover:bg-primary hover:text-background",
                                                'p-0 ps-2 pe-1'
                                            )}
                                          >
                                            <span className="text-nowrap">
                                              {t(submenu.translationKey)}
                                            </span>
                                            {submenu.plusAction && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ms-auto !size-5 cursor-pointer !p-2 hover:border"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  if (submenu.plusAction) {
                                                    router.push(submenu.plusAction);
                                                  }
                                                }}
                                              >
                                                <Plus className="!size-3" />
                                              </Button>
                                            )}
                                          </SidebarMenuSubButton>
                                        </Link>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : (
                              <Link href={menu.href}>
                                <SidebarMenuButton
                                  dir={lang === "ar" ? "rtl" : "ltr"}
                                  tooltip={menu.translationKey}
                                  className={cn(
                                    menu.active &&
                                      "bg-primary text-background hover:bg-primary hover:text-background",
                                  )}
                                >
                                  {menu.icon && <menu.icon className="!size-6 md:!size-4" />}
                                  <span>{t(menu.translationKey)}</span>
                                </SidebarMenuButton>
                              </Link>
                            )}
                          </SidebarMenuItem>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </div>
            ))}
          </SidebarMenu>
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
                      ? "w-[var(--radix-popper-content-width)]"
                      : "w-[var(--radix-popper-anchor-width)]"
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
      <SidebarRail />
    </Sidebar>
  );
}
