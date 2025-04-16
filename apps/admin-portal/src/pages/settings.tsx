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
} from "lucide-react";

import GeneralSettings from "@/components/settings/general-settings";
import NotificationSettings from "@/components/settings/notification-settings";
import PreferenceSettings from "@/components/settings/preference-settings";
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
type TabName = typeof validTabs[number];

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

interface SortableItemProps {
  item: SidebarMenuGroupProps["items"][number];
}

const SortableItem = ({ item }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.title,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-accent flex cursor-grab items-center gap-3 rounded-md border p-3 active:cursor-grabbing"
    >
      <GripVertical className="text-muted-foreground h-4 w-4" />
      {item.icon && <item.icon className="h-4 w-4" />}
      <span className="flex-1">{item.title}</span>
      {item.isActive && (
        <span className="text-primary bg-primary/10 rounded-full px-2 py-1 text-xs font-medium">
          Active
        </span>
      )}
    </div>
  );
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent, groupName: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuList[groupName].findIndex((item) => item.title === active.id);
      const newIndex = menuList[groupName].findIndex((item) => item.title === over.id);

      setMenuList((prev) => ({
        ...prev,
        [groupName]: arrayMove(prev[groupName], oldIndex, newIndex),
      }));
      setIsDirty(true);
    }
  };

  const handleInputChange = () => {
    setIsDirty(true);
  };

  const handleSave = () => {
    if (activeTab === "general" && generalSettingsFormRef.current) {
      generalSettingsFormRef.current.requestSubmit();
    } else if (activeTab === "notifications" && notificationSettingsFormRef.current) {
      notificationSettingsFormRef.current.requestSubmit();
    } else if (activeTab === "preferences" && preferenceSettingsFormRef.current) {
      preferenceSettingsFormRef.current.requestSubmit();
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
                  <SettingsIcon className="mr-2 h-4 w-4" />
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
                <Button
                  variant={activeTab === "billing" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => handleTabChange("billing")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.billing")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabName)} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="general">{t("Settings.tabs.general")}</TabsTrigger>
              <TabsTrigger value="navigation">{t("Settings.tabs.navigation")}</TabsTrigger>
              <TabsTrigger value="preferences">{t("Settings.tabs.preferences")}</TabsTrigger>
              <TabsTrigger value="notifications">{t("Settings.tabs.notifications")}</TabsTrigger>
              <TabsTrigger value="billing">{t("Settings.tabs.billing")}</TabsTrigger>
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
                <Card className="shadow-none">
                  <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
                    <CardTitle>{t("Settings.navigation.title")}</CardTitle>
                    <CardDescription>{t("Settings.navigation.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
                    {Object.entries(menuList).map(([groupName, items]) => (
                      <div key={groupName} className="space-y-4">
                        <h3 className="text-sm font-medium">{groupName}</h3>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, groupName)}
                        >
                          <SortableContext
                            items={items.map((item) => item.title)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {items.map((item) => (
                                <SortableItem key={item.title} item={item} />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    ))}
                  </CardContent>
                </Card>
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

              <TabsContent value="billing" className="m-0">
                <Card className="shadow-none">
                  <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
                    <CardTitle>{t("Settings.billing.title")}</CardTitle>
                    <CardDescription>{t("Settings.billing.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.billing.current_plan.title")}
                      </h3>
                      <div className="bg-accent/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Pro Plan</h4>
                            <p className="text-muted-foreground text-sm">
                              $29/month, billed monthly
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {t("Settings.billing.current_plan.change_plan")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.billing.payment_method.title")}
                      </h3>
                      <div className="bg-background flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <p className="text-sm font-medium">Visa ending in 4242</p>
                            <p className="text-muted-foreground text-xs">Expires 12/2025</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t("Settings.billing.payment_method.edit")}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.billing.billing_info.title")}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="billing-name">
                            {t("Settings.billing.billing_info.name")}
                          </Label>
                          <Input
                            id="billing-name"
                            defaultValue="John Doe"
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-email">
                            {t("Settings.billing.billing_info.email")}
                          </Label>
                          <Input
                            id="billing-email"
                            type="email"
                            defaultValue="billing@example.com"
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-address">
                            {t("Settings.billing.billing_info.address")}
                          </Label>
                          <Input
                            id="billing-address"
                            defaultValue="123 Main St"
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-city">
                            {t("Settings.billing.billing_info.city")}
                          </Label>
                          <Input
                            id="billing-city"
                            defaultValue="San Francisco"
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
