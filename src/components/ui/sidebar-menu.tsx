"use client";

import { useLocale, useTranslations } from "next-intl";

import { ChevronRight, Plus } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { SidebarMenuGroupProps } from "@/lib/sidebar-list";
import { cn } from "@/lib/utils";

export function NavMain({ title, items }: SidebarMenuGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, i) =>
          item.items ? (
            <CollapsibleSidebarMenuItem key={i} {...item} />
          ) : (
            <NonCollapsibleSidebarMenuItem key={i} {...item} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const CollapsibleSidebarMenuItem = (item: SidebarMenuGroupProps["items"][number]) => {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{t(item.translationKey)}</span>

            {item.items && (
              <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub dir={locale === "ar" ? "rtl" : "ltr"}>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title} className="relative">
                <SidebarMenuSubButton
                  asChild
                  className={cn(
                    subItem.isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  )}
                >
                  <a href={subItem.url}>
                    <span>{t(subItem.translationKey)}</span>
                  </a>
                </SidebarMenuSubButton>
                {subItem.action && (
                  <SidebarMenuAction className="absolute !end-1 top-1/2 -translate-y-1/2">
                    <Plus className="!size-3" />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>

                  //   <SidebarMenuAction>
                  //     <Button
                  //       variant="ghost"
                  //       size="icon"
                  //       className="m-auto !size-5 cursor-pointer !p-2 hover:border"
                  //       onClick={(e) => {
                  //         e.stopPropagation();
                  //         e.preventDefault();
                  //         if (subItem.action) {
                  //           router.push(subItem.action);
                  //         }
                  //       }}
                  //     >
                  //       <Plus className="!size-3" />
                  //     </Button>
                  //   </SidebarMenuAction>
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const NonCollapsibleSidebarMenuItem = (item: SidebarMenuGroupProps["items"][number]) => {
  const t = useTranslations();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="text-sidebar-foreground/70">
        {item.icon && <item.icon />}
        <span>{t(item.translationKey)}</span>
      </SidebarMenuButton>
      {item.action && (
        <SidebarMenuAction className="absolute !end-1 top-1/2 -translate-y-1/2">
          <Plus className="!size-3" />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  );
};
