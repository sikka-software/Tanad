"use client";

import { useState } from "react";

import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

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
  Moon,
  Save,
  SettingsIcon,
  Sun,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/ui/page-title";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMenuList, type SidebarMenuGroupProps } from "@/lib/sidebar-list";

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

export default function SettingsPage() {
  const pathname = usePathname();
  const t = useTranslations();
  const lang = useLocale();
  const [menuList, setMenuList] = useState(getMenuList(pathname));
  const [activeTab, setActiveTab] = useState("general");
  const [isDirty, setIsDirty] = useState(false);

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
    // Save logic here
    setIsDirty(false);
    console.log("Settings saved", menuList);
  };

  return (
    <div>
      <PageTitle
        title={t("Settings.title")}
        customButton={
          <div className="container mx-auto flex max-w-7xl justify-end">
            <Button onClick={handleSave} disabled={!isDirty} className="h-8 gap-2" size="sm">
              <Save className="h-4 w-4" />
              {t("General.save")}
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
                  onClick={() => setActiveTab("general")}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.general")}
                </Button>
                <Button
                  variant={activeTab === "appearance" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => setActiveTab("appearance")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.appearance")}
                </Button>
                <Button
                  variant={activeTab === "navigation" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => setActiveTab("navigation")}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.navigation")}
                </Button>
                <Button
                  variant={activeTab === "preferences" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => setActiveTab("preferences")}
                >
                  <ChevronsUpDown className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.preferences")}
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => setActiveTab("notifications")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t("Settings.tabs.notifications")}
                </Button>
                <Button
                  variant={activeTab === "billing" ? "secondary" : "ghost"}
                  className="h-auto justify-start rounded-none px-4 py-3"
                  onClick={() => setActiveTab("billing")}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="general">{t("Settings.tabs.general")}</TabsTrigger>
              <TabsTrigger value="appearance">{t("Settings.tabs.appearance")}</TabsTrigger>
              <TabsTrigger value="navigation">{t("Settings.tabs.navigation")}</TabsTrigger>
              <TabsTrigger value="preferences">{t("Settings.tabs.preferences")}</TabsTrigger>
              <TabsTrigger value="notifications">{t("Settings.tabs.notifications")}</TabsTrigger>
              <TabsTrigger value="billing">{t("Settings.tabs.billing")}</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <TabsContent value="general" className="m-0">
                <Card className="shadow-none">
                  <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
                    <CardTitle>{t("Settings.general.title")}</CardTitle>
                    <CardDescription>{t("Settings.general.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">{t("Settings.general.profile.title")}</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("Settings.general.profile.name")}</Label>
                          <Input id="name" defaultValue="John Doe" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("Settings.general.profile.email")}</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue="john@example.com"
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.general.regional.title")}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="language">
                            {t("Settings.general.regional.language")}
                          </Label>
                          <Select defaultValue="en" onValueChange={handleInputChange}>
                            <SelectTrigger id="language">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">{t("General.languages.en")}</SelectItem>
                              <SelectItem value="ar">{t("General.languages.ar")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">
                            {t("Settings.general.regional.timezone")}
                          </Label>
                          <Select defaultValue="utc" onValueChange={handleInputChange}>
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">Eastern Time (ET)</SelectItem>
                              <SelectItem value="cst">Central Time (CT)</SelectItem>
                              <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="m-0">
                <Card className="shadow-none">
                  <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
                    <CardTitle>{t("Settings.appearance.title")}</CardTitle>
                    <CardDescription>{t("Settings.appearance.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.appearance.theme.title")}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <Label htmlFor="theme-mode">
                            {t("Settings.appearance.theme.dark_mode")}
                          </Label>
                          <Moon className="h-4 w-4" />
                        </div>
                        <Switch
                          id="theme-mode"
                          onCheckedChange={handleInputChange}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.appearance.density.title")}
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="density">
                            {t("Settings.appearance.density.interface_density")}
                          </Label>
                          <Select defaultValue="comfortable" onValueChange={handleInputChange}>
                            <SelectTrigger id="density">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comfortable">
                                {t("Settings.appearance.density.comfortable")}
                              </SelectItem>
                              <SelectItem value="compact">
                                {t("Settings.appearance.density.compact")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                <Card className="shadow-none">
                  <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
                    <CardTitle>{t("Settings.preferences.title")}</CardTitle>
                    <CardDescription>{t("Settings.preferences.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.preferences.default.title")}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="currency">
                            {t("Settings.preferences.default.currency")}
                          </Label>
                          <Select defaultValue="usd" onValueChange={handleInputChange}>
                            <SelectTrigger id="currency">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd">USD ($)</SelectItem>
                              <SelectItem value="eur">EUR (€)</SelectItem>
                              <SelectItem value="gbp">GBP (£)</SelectItem>
                              <SelectItem value="jpy">JPY (¥)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="calendar">
                            {t("Settings.preferences.default.calendar")}
                          </Label>
                          <Select defaultValue="month" onValueChange={handleInputChange}>
                            <SelectTrigger id="calendar">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="year">Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.preferences.datetime.title")}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="date-format">
                            {t("Settings.preferences.datetime.date_format")}
                          </Label>
                          <Select defaultValue="mdy" onValueChange={handleInputChange}>
                            <SelectTrigger id="date-format">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                              <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                              <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-format">
                            {t("Settings.preferences.datetime.time_format")}
                          </Label>
                          <Select defaultValue="12h" onValueChange={handleInputChange}>
                            <SelectTrigger id="time-format">
                              <SelectValue placeholder={t("General.select")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12h">
                                {t("Settings.preferences.datetime.12h")}
                              </SelectItem>
                              <SelectItem value="24h">
                                {t("Settings.preferences.datetime.24h")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="m-0">
                <Card className="shadow-none">
                  <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
                    <CardTitle>{t("Settings.notifications.title")}</CardTitle>
                    <CardDescription>{t("Settings.notifications.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.notifications.email.title")}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-updates" className="flex-1">
                            {t("Settings.notifications.email.updates")}
                          </Label>
                          <Switch
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            id="email-updates"
                            defaultChecked
                            onCheckedChange={handleInputChange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-marketing" className="flex-1">
                            {t("Settings.notifications.email.marketing")}
                          </Label>
                          <Switch
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            id="email-marketing"
                            defaultChecked
                            onCheckedChange={handleInputChange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-security" className="flex-1">
                            {t("Settings.notifications.email.security")}
                          </Label>
                          <Switch
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            id="email-security"
                            defaultChecked
                            onCheckedChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("Settings.notifications.in_app.title")}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="app-mentions" className="flex-1">
                            {t("Settings.notifications.in_app.mentions")}
                          </Label>
                          <Switch
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            id="app-mentions"
                            defaultChecked
                            onCheckedChange={handleInputChange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="app-comments" className="flex-1">
                            {t("Settings.notifications.in_app.comments")}
                          </Label>
                          <Switch
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            id="app-comments"
                            defaultChecked
                            onCheckedChange={handleInputChange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="app-tasks" className="flex-1">
                            {t("Settings.notifications.in_app.tasks")}
                          </Label>
                          <Switch
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            id="app-tasks"
                            defaultChecked
                            onCheckedChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
