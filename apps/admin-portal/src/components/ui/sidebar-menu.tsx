"use client";

import React from "react";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { ChevronRight, Plus } from "lucide-react";
import { motion } from "motion/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/radix-collapsible";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SidebarMenuGroupProps } from "@/lib/sidebar-list";
import { cn } from "@/lib/utils";

export function NavMain({ title, items }: SidebarMenuGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarSeparator className="mb-2" />

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
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(item.isActive);

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={item.isActive}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{t(item.translationKey)}</span>

            {item.items && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isOpen ? (locale === "ar" ? -90 : 90) : 0 }}
                transition={{ duration: 0.2 }}
                className="ms-auto"
              >
                <ChevronRight className="size-4 rtl:-rotate-180" />
              </motion.div>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="me-0 pe-0" dir={locale === "ar" ? "rtl" : "ltr"}>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title} className="relative">
                <SidebarMenuSubButton
                  asChild
                  className={cn(
                    subItem.isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  )}
                >
                  <Link href={subItem.url}>
                    <span>{t(subItem.translationKey)}</span>
                  </Link>
                </SidebarMenuSubButton>
                {subItem.action && (
                  <SidebarMenuAction
                    className="absolute !end-1 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (subItem.action) {
                        router.push(subItem.action);
                      }
                    }}
                  >
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
      <Link href={item.url}>
        <SidebarMenuButton className="text-sidebar-foreground/70">
          {item.icon && <item.icon />}
          <span>{t(item.translationKey)}</span>
        </SidebarMenuButton>
      </Link>
      {item.action && (
        <SidebarMenuAction className="absolute !end-1 top-1/2 -translate-y-1/2">
          <Plus className="!size-3" />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  );
};
