"use client";

import { ChevronsUpDown, Pen, Plus, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/ui/sidebar";

import { Button } from "./button";
import IconButton from "./icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function EnterpriseSwitcher({
  enterprises,
}: {
  enterprises: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const t = useTranslations();
  const lang = useLocale();
  const { isMobile } = useSidebar();
  const [activeEnterprise, setActiveEnterprise] = React.useState(enterprises[0]);

  if (!activeEnterprise) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeEnterprise.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{activeEnterprise.name}</span>
                <span className="truncate text-xs">{activeEnterprise.plan}</span>
              </div>
              <ChevronsUpDown className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {t("General.enterprises")}
            </DropdownMenuLabel>
            {enterprises.map((enterprise, index) => (
              <DropdownMenuItem
                key={enterprise.name}
                onClick={() => setActiveEnterprise(enterprise)}
                className="justify-between gap-2 p-2"
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <enterprise.logo className="size-4 shrink-0" />
                  </div>
                  <span>{enterprise.name}</span>
                </div>
                <Link href={`/enterprise`}>
                  <Button
                    variant="ghost"
                    size="icon_sm"
                    className="ms-auto"
                    onClick={() => setActiveEnterprise(enterprise)}
                  >
                    <Settings className="size-4" />
                  </Button>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Tooltip>
              <TooltipTrigger>
                <DropdownMenuItem className="gap-2 p-2" disabled={true}>
                  <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {t("General.add_enterprise")}
                  </div>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{t("General.soon")}</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
