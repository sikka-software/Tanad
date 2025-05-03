"use client";

import { Dialog } from "@radix-ui/react-dialog";
import {
  ChevronsUpDown,
  CreditCard,
  HelpCircle,
  LogOut,
  MessageSquareWarning,
  User2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/ui/sidebar";

import useUserStore, { ProfileType } from "@/stores/use-user-store";

import { FeedbackDialog } from "../app/FeedbackDialog";

export function SidebarUserFooter({ user }: { user: ProfileType }) {
  const { isMobile } = useSidebar();
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const signOut = useUserStore((state) => state.signOut);

  // Early return if no user to prevent null reference errors
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t("Auth.signed_out_successfully"));
      router.push("/auth");
    } catch (error) {
      toast.error(t("Auth.error_signing_out"));
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage src={user.avatar_url ?? ""} alt={user.full_name ?? ""} />
                  <AvatarFallback className="rounded-md">
                    {user.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{user.full_name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar_url ?? ""} alt={user.full_name ?? ""} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{user.full_name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/account">
                  <DropdownMenuItem className="cursor-pointer">
                    <User2 className="me-2 h-4 w-4" />
                    {t("Account.title")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/billing">
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="me-2 h-4 w-4" />
                    {t("Billing.title")}
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/help">
                  <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="me-2 h-4 w-4" />
                    {t("Help.title")}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setOpen(true)}>
                  <MessageSquareWarning className="me-2 h-4 w-4" />
                  {t("Feedback.give_feedback")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                <LogOut className="me-2 h-4 w-4" />
                {t("Auth.sign_out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <FeedbackDialog onOpenChange={setOpen} />
      </Dialog>
    </>
  );
}
