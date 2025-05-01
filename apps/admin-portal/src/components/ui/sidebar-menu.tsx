"use client";

import { ChevronRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/radix-collapsible";
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
  useSidebar,
} from "@/components/ui/sidebar";

import { SidebarMenuGroupProps } from "@/lib/sidebar-list";
import { cn } from "@/lib/utils";

export function NavMain({ title, items }: SidebarMenuGroupProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            key={title}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [isOpen, setIsOpen] = React.useState(item.is_active);
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton tooltip={t(item.translationKey)}>
              {item.icon && <item.icon />}
              <span>{t(item.translationKey)}</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            dir={locale === "ar" ? "rtl" : "ltr"}
            side="right"
            align="start"
            className="min-w-32 p-0"
          >
            <div className="p-2">
              <div className={cn("px-2 py-1.5 text-sm font-semibold")}>
                {t(item.translationKey)}
              </div>
              <DropdownMenuSeparator className="mx-1" />
              {item.items?.map((subItem) => (
                <Link
                  href={subItem.url}
                  key={subItem.title}
                  className="focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  <span>{t(subItem.translationKey)}</span>
                  {subItem.action && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary hover:text-primary-foreground !size-5 flex-shrink-0 cursor-pointer !p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.push(subItem.action!);
                      }}
                      aria-label={`Add new ${t(subItem.translationKey)}`}
                    >
                      <Plus className="!size-3" />
                    </Button>
                  )}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={item.is_active}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={t(item.translationKey)}>
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
                    subItem.is_active &&
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
        <SidebarMenuButton tooltip={t(item.translationKey)}>
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
