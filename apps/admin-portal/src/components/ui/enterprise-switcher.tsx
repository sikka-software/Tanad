"use client";

import { Asterisk, Plus, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import useUserStore from "@/stores/use-user-store";

export function EnterpriseSwitcher({
  enterprises,
}: {
  enterprises: {
    name: string;
    logo: string;
    plan: string;
  }[];
}) {
  const t = useTranslations();
  const lang = useLocale();
  const { isMobile } = useSidebar();
  const [activeEnterprise, setActiveEnterprise] = React.useState(enterprises[0]);

  const { enterprise, setEnterprise } = useUserStore();
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
              <div className="bg-sidebar-primary text-sidebar-primary-foreground aspect-squre flex size-8 !max-w-8 min-w-8 items-center justify-center overflow-hidden rounded-lg p-0">
                {enterprise?.logo ? (
                  <Image
                    src={enterprise?.logo}
                    alt={enterprise?.name || ""}
                    className="w-8 object-cover object-center"
                    width={100}
                    height={100}
                  />
                ) : (
                  <Asterisk className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{enterprise?.name}</span>
                <span className="truncate text-xs">{activeEnterprise.plan}</span>
              </div>
              {/* <ChevronsUpDown className="ms-auto" /> */}
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
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-sm border">
                    {enterprise?.logo ? (
                      <img
                        src={enterprise?.logo}
                        alt={enterprise?.name || ""}
                        className="object-cover"
                      />
                    ) : (
                      <Asterisk className="size-4" />
                    )}
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
