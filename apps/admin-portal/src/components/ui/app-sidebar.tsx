"use client";

import type { LucideIcon } from "lucide-react";
import { Asterisk, CreditCard, LogOut, MessageSquareWarning, Search, User2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { CACHE_KEY } from "@/lib/constants";
import { applyCustomMenuOrder, getMenuList, type SidebarMenuGroupProps } from "@/lib/sidebar-list";

import useUserStore from "@/stores/use-user-store";

import { FeedbackDialog } from "../app/FeedbackDialog";
import { EnterpriseSwitcher } from "./enterprise-switcher";
import { NavMain } from "./sidebar-menu";

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

export function AppSidebar() {
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);
  const { state, isMobile, setOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const previousStateRef = useRef<{ groups: Set<number>; menus: Set<string> }>({
    groups: new Set(),
    menus: new Set(),
  });
  const { user, profile, enterprise, membership, signOut, hasPermission } = useUserStore();

  // Store and clear expanded states when sidebar collapses
  useEffect(() => {
    if (state === "collapsed" && !isMobile) {
      // Store current state before clearing
      previousStateRef.current = {
        groups: new Set(expandedGroups),
        menus: new Set(expandedMenus),
      };
      // Clear all expanded states
      setExpandedGroups(new Set());
      setExpandedMenus(new Set());
    } else if (state === "expanded" && !isMobile) {
      // Restore previous state
      setExpandedGroups(previousStateRef.current.groups);
      setExpandedMenus(previousStateRef.current.menus);
    }
  }, [state, isMobile]);

  const handleItemClick = useCallback(
    (groupIndex: number, menuIndex?: number) => {
      if (state === "collapsed" && !isMobile) {
        // First open the sidebar
        setSidebarOpen(true);
        // Then restore previous state and add the clicked items
        const newGroups = new Set(previousStateRef.current.groups);
        const newMenus = new Set(previousStateRef.current.menus);

        newGroups.add(groupIndex);
        if (menuIndex !== undefined) {
          newMenus.add(`${groupIndex}-${menuIndex}`);
        }

        // Update states with a slight delay to ensure sidebar transition has started
        requestAnimationFrame(() => {
          setExpandedGroups(newGroups);
          setExpandedMenus(newMenus);
        });
      }
    },
    [state, isMobile, setSidebarOpen],
  );

  const defaultMenuGroups = useMemo(() => getMenuList(router.pathname), [router.pathname]);

  const orderedMenuGroups = useMemo(() => {
    if (profile?.user_settings && "navigation" in profile.user_settings) {
      try {
        const result = applyCustomMenuOrder(
          defaultMenuGroups,
          profile.user_settings.navigation as Record<string, Array<{ title: string }>>,
        );

        // Apply hidden menu items filter
        if (profile.user_settings.hidden_menu_items) {
          const hiddenItems = profile.user_settings.hidden_menu_items as Record<string, string[]>;
          const filteredResult: Record<string, SidebarMenuGroupProps["items"]> = {};

          Object.entries(result).forEach(([groupName, items]) => {
            // Filter out hidden items from this group
            filteredResult[groupName] = items.filter(
              (item) => !hiddenItems[groupName]?.includes(item.title),
            );
          });

          return filteredResult;
        }

        return result;
      } catch (error) {
        // console.error("[app-sidebar] Error applying custom menu order:", error);
      }
    } else {
      // console.log("[app-sidebar] No navigation settings found in profile");
    }
    return defaultMenuGroups;
  }, [defaultMenuGroups, profile?.user_settings]);

  // Filter menu items based on permissions
  const filterGroupsByPermission = (
    groups: Record<string, SidebarMenuGroupProps["items"]>,
  ): Record<string, SidebarMenuGroupProps["items"]> => {
    const filteredGroups: Record<string, SidebarMenuGroupProps["items"]> = {};

    // Iterate over each group name (e.g., "Administration", "Accounting")
    for (const groupName in groups) {
      const items = groups[groupName];

      // Explicitly type the result of the map operation
      const mappedItems: (SidebarMenuGroupProps["items"][number] | null)[] = items.map((item) => {
        // 1. Filter sub-items first (if they exist)
        let filteredSubItems: typeof item.items | undefined = undefined;
        if (item.items) {
          filteredSubItems = item.items.filter((subItem) => {
            // Keep sub-item if no permission is required or user has permission
            return !subItem.requiredPermission || hasPermission(subItem.requiredPermission);
          });
        }

        // 3. Determine if the parent item should be kept based on children
        // If it had sub-items originally, but none are left after filtering, hide the parent item.
        if (item.items && (!filteredSubItems || filteredSubItems.length === 0)) {
          return null;
        }

        // Return the item, potentially with filtered sub-items
        return {
          ...item,
          items: filteredSubItems, // Update sub-items
        };
      });

      // Filter out the null values using a simpler filter
      const filteredItems = mappedItems.filter((item) => item !== null);

      // Only add the group to the result if it still contains items after filtering
      if (filteredItems.length > 0) {
        // Explicitly cast back to the required type
        filteredGroups[groupName] = filteredItems as SidebarMenuGroupProps["items"];
      }
    }
    return filteredGroups;
  };

  const finalMenuGroups = useMemo(
    () => filterGroupsByPermission(orderedMenuGroups),
    [orderedMenuGroups, hasPermission],
  );

  const filterMenuItems = (items: any, query: string) => {
    if (!query) return items;

    const searchLower = query.toLowerCase();

    // Get the English label from the translation key
    const getEnglishLabel = (translationKey: string) => {
      return translationKey.split(".")[0];
    };

    const filterGroup = (group: any) => {
      if (!group) return null;

      const filteredItems = group
        .map((item: any) => {
          // Check both English and translated labels for main item
          const englishLabel = getEnglishLabel(item.translationKey);
          const translatedLabel = t(item.translationKey).toLowerCase();
          const matchesTitle =
            englishLabel.toLowerCase().includes(searchLower) ||
            translatedLabel.includes(searchLower);

          // Check both English and translated labels for sub-items
          const matchesSubItems = item.items?.some((subItem: any) => {
            const subEnglishLabel = getEnglishLabel(subItem.translationKey);
            const subTranslatedLabel = t(subItem.translationKey).toLowerCase();
            return (
              subEnglishLabel.toLowerCase().includes(searchLower) ||
              subTranslatedLabel.includes(searchLower)
            );
          });

          if (matchesTitle) return item;

          if (item.items) {
            const filteredSubItems = item.items.filter((subItem: any) => {
              const subEnglishLabel = getEnglishLabel(subItem.translationKey);
              const subTranslatedLabel = t(subItem.translationKey).toLowerCase();
              return (
                subEnglishLabel.toLowerCase().includes(searchLower) ||
                subTranslatedLabel.includes(searchLower)
              );
            });

            if (filteredSubItems.length > 0) {
              return { ...item, items: filteredSubItems };
            }
          }

          return null;
        })
        .filter(Boolean);

      return filteredItems.length > 0 ? filteredItems : null;
    };

    return {
      Administration: filterGroup(items.Administration),
      Accounting: filterGroup(items.Accounting),
      HumanResources: filterGroup(items.HumanResources),
      Settings: filterGroup(items.Settings),
    };
  };

  const searchableMenuGroups = useMemo(
    () => filterMenuItems(finalMenuGroups, searchQuery),
    [finalMenuGroups, searchQuery, t],
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Sidebar collapsible="icon" side={lang === "ar" ? "right" : "left"} className="z-50">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <EnterpriseSwitcher
            enterprises={[{ name: enterprise?.name || "", logo: Asterisk, plan: "" }]}
          />
        </div>
      </SidebarHeader>
      {state === "expanded" && (
        <SidebarHeader className="px-2 py-2">
          <div className="relative flex items-center gap-2 px-1.5">
            <Search className="text-muted-foreground absolute start-4 size-4" />
            <Input
              type="text"
              placeholder={t("General.sidebar_search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 ps-8"
            />
          </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        {searchableMenuGroups.Administration && searchableMenuGroups.Administration.length > 0 && (
          <NavMain title={t("Administration.title")} items={searchableMenuGroups.Administration} />
        )}
        {searchableMenuGroups.Accounting && searchableMenuGroups.Accounting.length > 0 && (
          <NavMain title={t("Accounting.title")} items={searchableMenuGroups.Accounting} />
        )}
        {searchableMenuGroups.HumanResources && searchableMenuGroups.HumanResources.length > 0 && (
          <NavMain title={t("HumanResources.title")} items={searchableMenuGroups.HumanResources} />
        )}
        {searchableMenuGroups.Settings && searchableMenuGroups.Settings.length > 0 && (
          <NavMain title={t("Settings.title")} items={searchableMenuGroups.Settings} />
        )}
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
                    {profile?.email}
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
                  onClick={async () => {
                    console.log("[AppSidebar] Sign out clicked");

                    // Clean up local storage
                    if (user?.id) {
                      console.log("[AppSidebar] Removing cache for user:", user.id);
                      localStorage.removeItem(CACHE_KEY(user.id));
                    }
                    localStorage.removeItem("analytics_date_range");

                    try {
                      await signOut();
                      console.log("[AppSidebar] Sign out complete, redirecting to /auth");
                      router.replace("/auth");
                    } catch (error) {
                      console.error("[AppSidebar] Error signing out:", error);
                    }
                  }}
                >
                  <LogOut className="!size-4" /> <span>{t("Auth.sign_out")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
