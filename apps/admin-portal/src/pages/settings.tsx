"use client";

import { useState, useEffect } from "react";
import React from "react";

import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronsUpDown,
  CreditCard,
  GripVertical,
  Mail,
  Save,
  SettingsIcon,
  User,
  Loader2,
  Sidebar,
} from "lucide-react";

import GeneralSettings from "@/components/settings/general-settings";
import NotificationSettings from "@/components/settings/notification-settings";
import PreferenceSettings from "@/components/settings/preference-settings";
import SidebarSettings from "@/components/settings/sidebar-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/ui/page-title";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getMenuList, type SidebarMenuGroupProps } from "@/lib/sidebar-list";

// Valid tab names for type safety
const validTabs = ["general", "navigation", "preferences", "notifications", "billing"] as const;
type TabName = (typeof validTabs)[number];

// Function to get tab from URL hash
const getTabFromHash = (): TabName => {
  if (typeof window === "undefined") return "general";

  const hash = window.location.hash.replace("#", "");
  return validTabs.includes(hash as TabName) ? (hash as TabName) : "general";
};

// Function to set URL hash
const setHashForTab = (tab: TabName) => {
  if (typeof window !== "undefined") {
    window.location.hash = tab;
  }
};

const SettingsPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const lang = useLocale();
  const [menuList, setMenuList] = useState(getMenuList(pathname));
  const [activeTab, setActiveTab] = useState<TabName>("general");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const generalSettingsFormRef = React.useRef<HTMLFormElement>(null);
  const notificationSettingsFormRef = React.useRef<HTMLFormElement>(null);
  const preferenceSettingsFormRef = React.useRef<HTMLFormElement>(null);
  const sidebarSettingsFormRef = React.useRef<HTMLFormElement>(null);

  // Initialize from URL hash and set up hash change listener
  useEffect(() => {
    // Set initial tab from hash
    const tabFromHash = getTabFromHash();
    setActiveTab(tabFromHash);

    // Listen for hash changes
    const handleHashChange = () => {
      const newTab = getTabFromHash();
      setActiveTab(newTab);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSave = () => {
    if (activeTab === "general" && generalSettingsFormRef.current) {
      generalSettingsFormRef.current.requestSubmit();
    } else if (activeTab === "notifications" && notificationSettingsFormRef.current) {
      notificationSettingsFormRef.current.requestSubmit();
    } else if (activeTab === "preferences" && preferenceSettingsFormRef.current) {
      preferenceSettingsFormRef.current.requestSubmit();
    } else if (activeTab === "navigation" && sidebarSettingsFormRef.current) {
      sidebarSettingsFormRef.current.requestSubmit();
    }
  };

  const handleSaveStart = () => {
    setIsSaving(true);
  };

  const handleSaveComplete = () => {
    setIsSaving(false);
    setIsDirty(false);
  };

  // Handle tab change with hash update
  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    setHashForTab(tab);
  };

  return (
    <div>
      <PageTitle
        title={t("Settings.title")}
        customButton={
          <div className="container mx-auto flex max-w-7xl justify-end">
            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="h-8 gap-2"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("General.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("General.save")}
                </>
              )}
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4 p-4 md:flex-row">
        {/* Sidebar */}
        <div className="w-full shrink-0 md:w-64">
          <Card className="shadow-none">
            <CardContent className="p-0" dir={lang === "ar" ? "rtl" : "ltr"}>
              <div className="flex w-full flex-col">
                <Button
                  variant={activeTab === "general" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => handleTabChange("general")}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.general")}
                </Button>
                <Button
                  variant={activeTab === "navigation" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => handleTabChange("navigation")}
                >
                  <Sidebar className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.navigation")}
                </Button>
                <Button
                  variant={activeTab === "preferences" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => handleTabChange("preferences")}
                >
                  <ChevronsUpDown className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.preferences")}
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => handleTabChange("notifications")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.notifications")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value as TabName)}
            className="w-full"
          >
            <TabsList className="hidden">
              <TabsTrigger value="general">{t("Settings.tabs.general")}</TabsTrigger>
              <TabsTrigger value="navigation">{t("Settings.tabs.navigation")}</TabsTrigger>
              <TabsTrigger value="preferences">{t("Settings.tabs.preferences")}</TabsTrigger>
              <TabsTrigger value="notifications">{t("Settings.tabs.notifications")}</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <TabsContent value="general" className="m-0">
                <GeneralSettings
                  onDirtyChange={setIsDirty}
                  onSave={handleSaveStart}
                  onSaveComplete={handleSaveComplete}
                  isSaving={isSaving}
                  formRef={generalSettingsFormRef}
                />
              </TabsContent>

              <TabsContent value="navigation" className="m-0">
                <SidebarSettings
                  onDirtyChange={setIsDirty}
                  onSave={handleSaveStart}
                  onSaveComplete={handleSaveComplete}
                  isSaving={isSaving}
                  formRef={sidebarSettingsFormRef}
                />
              </TabsContent>

              <TabsContent value="preferences" className="m-0">
                <PreferenceSettings
                  onDirtyChange={setIsDirty}
                  onSave={handleSaveStart}
                  onSaveComplete={handleSaveComplete}
                  isSaving={isSaving}
                  formRef={preferenceSettingsFormRef}
                />
              </TabsContent>

              <TabsContent value="notifications" className="m-0">
                <NotificationSettings
                  onDirtyChange={setIsDirty}
                  onSave={handleSaveStart}
                  onSaveComplete={handleSaveComplete}
                  isSaving={isSaving}
                  formRef={notificationSettingsFormRef}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
