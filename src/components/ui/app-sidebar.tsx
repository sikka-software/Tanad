"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { createContext } from "react";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import type { LucideIcon } from "lucide-react";
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
  Plus,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
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

// Create context for accordion state
const AccordionContext = createContext<{
  openAccordions: Set<string>;
  handleAccordionChange: (value: string, isOpen: boolean) => void;
}>({
  openAccordions: new Set(),
  handleAccordionChange: () => {},
});

// Custom SidebarAccordion component
function SidebarAccordion({
  children,
  value,
  className,
  sidebarState,
  parentValue,
}: {
  children: [React.ReactNode, React.ReactNode];
  value: string;
  className?: string;
  sidebarState: "expanded" | "collapsed";
  parentValue?: string;
}) {
  const height = useRef<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { openAccordions, handleAccordionChange } = useContext(AccordionContext);
  const isOpen = openAccordions.has(value);
  const isParentOpen = parentValue ? openAccordions.has(parentValue) : true;
  const shouldBeOpen = isOpen && (!parentValue || isParentOpen) && !isClosing;
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (sidebarState === "collapsed" && isOpen && (!parentValue || isParentOpen)) {
      // Start closing animation when sidebar collapses
      setIsAnimating(true);
      setIsClosing(true);
      const startHeight = contentRef.current?.scrollHeight;
      setContentHeight(startHeight);

      // Trigger the animation by setting height to 0
      requestAnimationFrame(() => {
        setContentHeight(0);
      });

      // Reset after animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setContentHeight(undefined);
      }, 300);

      return () => clearTimeout(timer);
    } else if (sidebarState === "expanded" && isOpen) {
      // Handle opening animation when sidebar expands
      setIsClosing(false);
      setIsAnimating(true);
      
      // Start with height 0
      setContentHeight(0);
      
      // Then animate to full height
      requestAnimationFrame(() => {
        const targetHeight = contentRef.current?.scrollHeight;
        setContentHeight(targetHeight);
      });

      // Reset after animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setContentHeight(undefined);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [sidebarState, isOpen, parentValue, isParentOpen]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (sidebarState === "collapsed" || (parentValue && !isParentOpen)) {
      return; // Don't allow toggling if sidebar is collapsed or parent is closed
    }

    setIsAnimating(true);
    const newIsOpen = !isOpen;

    if (newIsOpen) {
      const targetHeight = contentRef.current?.scrollHeight;
      setContentHeight(0);
      requestAnimationFrame(() => {
        setContentHeight(targetHeight);
      });
    } else {
      const startHeight = contentRef.current?.scrollHeight;
      setContentHeight(startHeight);
      requestAnimationFrame(() => {
        setContentHeight(0);
      });
    }

    handleAccordionChange(value, newIsOpen);

    const timer = setTimeout(() => {
      if (newIsOpen) {
        setContentHeight(undefined);
      }
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  return (
    <div
      className={cn("overflow-hidden transition-all duration-300", className)}
      data-state={shouldBeOpen ? "open" : "closed"}
    >
      <div onClick={handleClick}>{children[0]}</div>
      <div
        ref={contentRef}
        style={{ height: contentHeight === undefined ? (shouldBeOpen ? "auto" : 0) : contentHeight }}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isAnimating && "pointer-events-none",
        )}
      >
        {children[1]}
      </div>
    </div>
  );
}

// Add a custom style for the chevron rotation
const accordionChevronStyles = `
  .accordion-chevron {
    transition: transform 0.2s ease;
  }
  
  [data-state="open"] .accordion-chevron {
    transform: rotate(180deg);
  }

  /* Ensure smooth accordion animations */
  [data-radix-accordion-content] {
    transition: height 0.3s ease-out;
    will-change: height;
  }

  /* Prevent content from being cut off during animation */
  [data-radix-accordion-content][data-state="open"] {
    height: var(--radix-accordion-content-height);
    overflow: hidden;
  }

  /* Ensure content is visible during sidebar collapse */
  .group-data-[collapsible=icon] [data-radix-accordion-content][data-state="open"] {
    animation: none;
    transition: height 0.3s ease-out;
  }
`;

export function AppSidebar() {
  const t = useTranslations();
  const lang = useLocale();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { state, isMobile, setOpen: setSidebarOpen, open: isSidebarOpen } = useSidebar();
  const { user } = useUserStore();
  const router = useRouter();
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [lastOpenAccordions, setLastOpenAccordions] = useState<Set<string>>(new Set());

  // Store last open accordions when sidebar collapses
  useEffect(() => {
    if (state === "collapsed") {
      setLastOpenAccordions(new Set(openAccordions));
    } else if (state === "expanded") {
      // Restore last open accordions when sidebar expands
      setOpenAccordions(new Set(lastOpenAccordions));
    }
  }, [state]);

  const handleAccordionChange = (value: string, isOpen: boolean) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return newSet;
    });
  };

  const menuGroups = getMenuList(router.pathname);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoSrc = `/assets/pukla-logo-full-${
    !isMounted || resolvedTheme === "dark" ? "green" : "purple"
  }${lang === "en" ? "-en" : ""}.png`;

  return (
    <>
      <style jsx global>
        {accordionChevronStyles}
      </style>
      <AccordionContext.Provider value={{ openAccordions, handleAccordionChange }}>
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
              <SidebarGroupContent>
                <SidebarMenu className="mt-4 gap-2">
                  {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <SidebarSeparator className="mb-2" />
                      <SidebarAccordion
                        value={`group-${groupIndex}`}
                        className="border-none"
                        sidebarState={state}
                      >
                        <div>
                          <SidebarMenuButton
                            className="w-full overflow-hidden"
                            tooltip={group.groupLabelTranslationKey || ""}
                            onClick={(e) => {
                              if (state === "collapsed" && !isMobile) {
                                e.preventDefault();
                                e.stopPropagation();
                                setSidebarOpen(true);
                                // Wait for sidebar expansion animation to start
                                requestAnimationFrame(() => {
                                  handleAccordionChange(`group-${groupIndex}`, true);
                                });
                              }
                            }}
                          >
                            {group.icon && <group.icon className="!size-6 md:!size-4" />}
                            {(!isMobile && state !== "collapsed") && (
                              <span className="text-nowrap">
                                {t(group.groupLabelTranslationKey || "")}
                              </span>
                            )}
                            <ChevronDown className="accordion-chevron ms-auto" />
                          </SidebarMenuButton>
                        </div>
                        <div>
                          <div className="w-full">
                            {group.menus.map((menu, menuIndex) => (
                              <SidebarMenuItem key={menuIndex}>
                                {menu.submenus && menu.submenus.length > 0 ? (
                                  <SidebarAccordion
                                    value={`item-${groupIndex}-${menuIndex}`}
                                    className="border-none"
                                    sidebarState={state}
                                    parentValue={`group-${groupIndex}`}
                                  >
                                    <div>
                                      <SidebarMenuButton
                                        className="w-full overflow-hidden"
                                        tooltip={menu.translationKey}
                                        onClick={(e) => {
                                          if (state === "collapsed" && !isMobile) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSidebarOpen(true);
                                            // Wait for sidebar expansion animation to start
                                            requestAnimationFrame(() => {
                                              handleAccordionChange(`group-${groupIndex}`, true);
                                              handleAccordionChange(`item-${groupIndex}-${menuIndex}`, true);
                                            });
                                          }
                                        }}
                                      >
                                        {menu.icon && <menu.icon className="!size-6 md:!size-4" />}
                                        {(!isMobile && state !== "collapsed") && (
                                          <span className="text-nowrap">
                                            {t(menu.translationKey)}
                                          </span>
                                        )}
                                        <ChevronDown className="accordion-chevron ms-auto" />
                                      </SidebarMenuButton>
                                    </div>
                                    <div>
                                      <SidebarMenuSub className="!ms-2 w-full">
                                        {menu.submenus.map((submenu, submenuIndex) => (
                                          <Link href={submenu.href} key={submenuIndex}>
                                            <SidebarMenuSubButton
                                              className={cn(
                                                "w-full",
                                                submenu.active &&
                                                  "bg-primary text-background hover:bg-primary hover:text-background",
                                              )}
                                            >
                                              {(!isMobile && state !== "collapsed") && (
                                                <span className="text-nowrap">
                                                  {t(submenu.translationKey)}
                                                </span>
                                              )}
                                              {submenu.plusAction && (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="ms-auto !size-5 cursor-pointer !p-2"
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
                                        ))}
                                      </SidebarMenuSub>
                                    </div>
                                  </SidebarAccordion>
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
                        </div>
                      </SidebarAccordion>
                    </div>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
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
        </Sidebar>
      </AccordionContext.Provider>
    </>
  );
}
