"use client";

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
import Link from "next/link";
import { useRouter } from "next/router";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { CACHE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import useUserStore from "@/hooks/use-user-store";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { FeedbackDialog } from "../app/FeedbackDialog";

export function AppSidebar() {
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const { user } = useUserStore();
  const router = useRouter();

  const items = [
    { title: t("Dashboard.title"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("Products.title"), url: "/products", icon: Package },
    { title: t("Invoices.title"), url: "/invoices", icon: File },
    { title: t("Clients.title"), url: "/clients", icon: Users },
    { title: t("Analytics.title"), url: "/analytics", icon: BarChart },
    { title: t("Billing.title"), url: "/billing", icon: CreditCard },
  ];

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoSrc = `/assets/pukla-logo-full-${
    !isMounted || resolvedTheme === "dark" ? "green" : "purple"
  }${lang === "en" ? "-en" : ""}.png`;

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
              {items.map((item, i) => (
                <SidebarMenuItem key={i}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      tooltip={item.title}
                      className={cn(
                        router.pathname === item.url &&
                          "bg-primary text-background hover:bg-primary hover:text-background"
                      )}
                    >
                      {item.icon && (
                        <item.icon className="!size-6 md:!size-4" />
                      )}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className=" px-0">
        <div className="p-2 flex flex-col gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-xs  flex items-center  gap-2 text-muted-foreground  !p-1.5 !h-[34px] rounded-md border"
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
                      className="text-xs flex items-center  gap-2 text-muted-foreground  !p-1.5 !h-[34px] rounded-md border"
                    >
                      <User2 className="!size-4" />
                    </Button>
                  ) : (
                    <Button variant={"outline"} className=" w-full">
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
                      <DropdownMenuLabel>
                        {user?.user_metadata.email}
                      </DropdownMenuLabel>
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
                    <LogOut className="!size-4" />{" "}
                    <span>{t("Auth.sign_out")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
