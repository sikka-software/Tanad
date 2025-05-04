"use client";

import { Asterisk, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/ui/sidebar";

import { applyCustomMenuOrder, getMenuList, type SidebarMenuGroupProps } from "@/lib/sidebar-list";

import useUserStore, { ProfileType } from "@/stores/use-user-store";

import { EnterpriseSwitcher } from "./enterprise-switcher";
import { NavMain } from "./sidebar-menu";
import { SidebarUserFooter } from "./sidebar-user-footer";

export function AppSidebar() {
  const t = useTranslations();
  const lang = useLocale();
  const { state, isMobile, setOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const previousStateRef = useRef<{ groups: Set<number>; menus: Set<string> }>({
    groups: new Set(),
    menus: new Set(),
  });

  const profile = useUserStore((state) => state.profile);
  const enterprise = useUserStore((state) => state.enterprise);
  const hasPermission = useUserStore((state) => state.hasPermission);

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
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <EnterpriseSwitcher
            enterprises={[{ name: enterprise?.name || "", logo: Asterisk, plan: "" }]}
          />
        </div>
        {state === "expanded" && (
          <div className="relative flex items-center gap-2">
            <Search className="text-muted-foreground absolute start-2 size-4" />
            <Input
              type="text"
              placeholder={t("General.sidebar_search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 ps-8"
            />
          </div>
        )}
      </SidebarHeader>
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

        {searchableMenuGroups.SystemAdmin && searchableMenuGroups.SystemAdmin.length > 0 && (
          <NavMain title={t("SystemAdmin.title")} items={searchableMenuGroups.SystemAdmin} />
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarUserFooter user={profile as ProfileType} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
